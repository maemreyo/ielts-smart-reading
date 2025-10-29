"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReadingState } from "./reading/hooks/useReadingState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Highlighter, Settings, Download, Copy } from "lucide-react";
import Link from "next/link";

interface SelectedWord {
  word: string;
  element: HTMLElement;
  position: number;
  paragraphIndex: number;
  start?: number; // Character position in full text
  end?: number; // Character position in full text
}

interface SelfLearningViewProps {
  title?: string;
  paragraphs: string[];
  book: string;
  test: string;
  passage: string;
}

// Extended interface that includes both position tracking and export data
interface HighlightedRange {
  id: string;
  targetLexeme: string; // Required for export
  sourceContext: string; // Required for export - the sentence containing the highlighted item
  type: 'word' | 'collocation';
  displayText: string; // What shows in the Vocabulary Panel
  componentRanges: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  // Export specification fields (mostly empty for now)
  isNonContiguous: boolean;
  selectedWordPositions: Array<{
    position: number;
    paragraphIndex: number;
  }>;
  originalContext: string;
  phase1Inference: {
    contextualGuessVI: string;
  };
  phase2Annotation: {
    phonetic: string;
    sentiment: string;
    definitionEN: string;
    translationVI: string;
    relatedCollocates: string[];
    wordForms: Record<string, Array<{ form: string; meaning: string }>>;
  };
  phase3Production: {
    taskType: string;
    content: string;
  };
}

export function SelfLearningView({
  title,
  paragraphs,
  book,
  test,
  passage,
}: SelfLearningViewProps) {
  const readingState = useReadingState();

  const [isClient, setIsClient] = useState(typeof window !== 'undefined');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Position-based highlighting state
  const [highlightedRanges, setHighlightedRanges] = useState<HighlightedRange[]>([]);

  // Non-contiguous selection state
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Prevent duplicate highlights from double-click
  const [lastHighlightTime, setLastHighlightTime] = useState(0);
  const [lastHighlightText, setLastHighlightText] = useState('');

  // Panel UI state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Load highlights from localStorage on mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem("position-based-highlights");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📥 Loaded highlights from localStorage:', parsed);

        // Migrate old data structure to new one if needed
        const migratedHighlights = parsed.map((item: any) => {
          // If this is old data structure (missing new fields), migrate it
          if (!item.sourceContext || !item.phase1Inference) {
            console.log('🔄 Migrating old highlight item:', item);

            // Calculate position for source context extraction
            const start = item.componentRanges?.[0]?.start || 0;
            const end = item.componentRanges?.[0]?.end || (start + (item.text?.length || 0));

            return {
              id: item.id || Date.now().toString(),
              targetLexeme: item.displayText || item.text || 'Unknown',
              sourceContext: extractSourceContextFromFullText(start, end),
              type: item.type || 'word',
              displayText: item.displayText || item.text || 'Unknown',
              componentRanges: item.componentRanges || [{ start, end, text: item.text || 'Unknown' }],
              isNonContiguous: item.type === 'collocation' || item.componentRanges?.length > 1,
              selectedWordPositions: item.selectedWordPositions || [{ position: start, paragraphIndex: 0 }],
              originalContext: item.originalContext || item.displayText || item.text || 'Unknown',
              phase1Inference: { contextualGuessVI: "" },
              phase2Annotation: {
                phonetic: "",
                sentiment: "",
                definitionEN: "",
                translationVI: "",
                relatedCollocates: [],
                wordForms: {}
              },
              phase3Production: { taskType: "", content: "" }
            };
          }
          return item;
        });

        console.log('📋 Migrated highlights:', migratedHighlights);
        setHighlightedRanges(migratedHighlights);
      }
    } catch (error) {
      console.error("Error loading highlights:", error);
    }
  }, [isClient, paragraphs]);

  // Helper function to extract source context for migration
  const extractSourceContextFromFullText = useCallback((start: number, end: number): string => {
    const fullText = paragraphs.join(' '); // Simple fallback
    if (!fullText) return "Context not available";

    // Find the start and end of the sentence containing the highlighted text
    const beforeText = fullText.substring(0, start);
    const afterText = fullText.substring(end);

    // Find sentence boundaries (., !, ?)
    const sentenceStart = Math.max(
      beforeText.lastIndexOf('. ') + 2,
      beforeText.lastIndexOf('! ') + 2,
      beforeText.lastIndexOf('? ') + 2,
      0
    );

    const sentenceEnd = Math.min(
      afterText.indexOf('. ') + end + 1,
      afterText.indexOf('! ') + end + 1,
      afterText.indexOf('? ') + end + 1,
      fullText.length
    );

    const sentence = fullText.substring(sentenceStart, sentenceEnd).trim();

    // Truncate to < 18 words as per specification, respecting word boundaries
    const words = sentence.split(' ').filter(word => word.trim().length > 0); // Filter out empty strings
    if (words.length > 18) {
      const truncatedWords = words.slice(0, 18);
      let truncatedText = truncatedWords.join(' ');

      // Ensure we don't cut off in the middle of punctuation or partial words
      // Check if the sentence continues and we should add ellipsis
      if (words.length > 18) {
        // Remove trailing punctuation if any and add ellipsis
        truncatedText = truncatedText.replace(/[,.!?;:]+$/, '');
        truncatedText += '...';
      }

      return truncatedText;
    }

    return sentence;
  }, [paragraphs]);

  // Save highlights to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem("position-based-highlights", JSON.stringify(highlightedRanges));
    } catch (error) {
      console.error("Error saving highlights:", error);
    }
  }, [isClient, highlightedRanges]);

  // Get full text content for position calculations
  const getFullText = useCallback(() => {
    if (!contentRef.current) return "";
    return contentRef.current.textContent || "";
  }, []);

  // Extract source context (the sentence containing highlighted text)
  const getSourceContext = useCallback((start: number, end: number): string => {
    const fullText = getFullText();
    if (!fullText) return "";

    // Find the start and end of the sentence containing the highlighted text
    const beforeText = fullText.substring(0, start);
    const afterText = fullText.substring(end);

    // Find sentence boundaries (., !, ?)
    const sentenceStart = Math.max(
      beforeText.lastIndexOf('. ') + 2,
      beforeText.lastIndexOf('! ') + 2,
      beforeText.lastIndexOf('? ') + 2,
      0
    );

    const sentenceEnd = Math.min(
      afterText.indexOf('. ') + end + 1,
      afterText.indexOf('! ') + end + 1,
      afterText.indexOf('? ') + end + 1,
      fullText.length
    );

    const sentence = fullText.substring(sentenceStart, sentenceEnd).trim();

    // Truncate to < 18 words as per specification, respecting word boundaries
    const words = sentence.split(' ').filter(word => word.trim().length > 0); // Filter out empty strings
    if (words.length > 18) {
      const truncatedWords = words.slice(0, 18);
      let truncatedText = truncatedWords.join(' ');

      // Ensure we don't cut off in the middle of punctuation or partial words
      // Check if the sentence continues and we should add ellipsis
      if (words.length > 18) {
        // Remove trailing punctuation if any and add ellipsis
        truncatedText = truncatedText.replace(/[,.!?;:]+$/, '');
        truncatedText += '...';
      }

      return truncatedText;
    }

    return sentence;
  }, [getFullText]);

  // Helper function to create a complete HighlightedRange object
  const createHighlightedRange = useCallback((
    text: string,
    start: number,
    end: number,
    type: 'word' | 'collocation',
    displayText: string,
    selectedWordPositions?: Array<{position: number; paragraphIndex: number}>
  ): HighlightedRange => {
    const sourceContext = getSourceContext(start, end);

    return {
      id: Date.now().toString(),
      targetLexeme: text,
      sourceContext,
      type,
      displayText,
      componentRanges: [{ start, end, text }],
      isNonContiguous: type === 'collocation',
      selectedWordPositions: selectedWordPositions || [{ position: start, paragraphIndex: 0 }],
      originalContext: type === 'collocation' ? displayText : text,
      phase1Inference: { contextualGuessVI: "" },
      phase2Annotation: {
        phonetic: "",
        sentiment: "",
        definitionEN: "",
        translationVI: "",
        relatedCollocates: [],
        wordForms: {}
      },
      phase3Production: { taskType: "", content: "" }
    };
  }, [getSourceContext]);

  // Helper function to get actual paragraph offsets from the DOM
  const getActualParagraphOffsetsFromDOM = useCallback(() => {
    if (!contentRef.current) return [];

    const offsets: Array<{ start: number; end: number; paragraphIndex: number }> = [];
    const childNodes = Array.from(contentRef.current.children);

    let currentOffset = 0;
    childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const textContent = node.textContent || '';
        const start = currentOffset;
        const end = start + textContent.length;

        offsets.push({ start, end, paragraphIndex: index });

        // Account for paragraph breaks (\n\n) in the position calculation
        currentOffset = end + 2;
      }
    });

    console.log('📐 Actual DOM paragraph offsets:', offsets);
    return offsets;
  }, []);

  // Helper function to find which paragraph contains a DOM position using actual DOM traversal
  const findParagraphForDOMPosition = useCallback((range: Range) => {
    if (!contentRef.current) return { paragraphIndex: 0, relativePosition: 0 };

    // Find the paragraph element that contains the selection
    let container = range.commonAncestorContainer;

    // If we're in a text node, get its parent element
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    // Find the closest paragraph element within contentRef
    let paragraphElement = container as Element;
    while (paragraphElement && paragraphElement !== contentRef.current) {
      if (paragraphElement.tagName === 'P' || paragraphElement.tagName === 'DIV') {
        // Check if this is one of our rendered paragraphs
        const childNodes = Array.from(contentRef.current.children);
        const paragraphIndex = childNodes.indexOf(paragraphElement);

        if (paragraphIndex !== -1) {
          // Calculate the relative position within this paragraph
          const paragraphRange = document.createRange();
          paragraphRange.selectNodeContents(paragraphElement);
          paragraphRange.setEnd(range.startContainer, range.startOffset);
          const relativePosition = paragraphRange.toString().length;

          console.log('🎯 Found paragraph:', {
            paragraphIndex,
            paragraphText: paragraphElement.textContent?.substring(0, 50) + '...',
            relativePosition
          });

          return { paragraphIndex, relativePosition };
        }
      }
      paragraphElement = paragraphElement.parentElement;
    }

    // Fallback: use the first paragraph
    console.log('⚠️ Fallback to first paragraph');
    return { paragraphIndex: 0, relativePosition: 0 };
  }, []);

  // Helper function to calculate paragraph-based position
  const calculateParagraphBasedPosition = useCallback((paragraphIndex: number, relativePosition: number) => {
    // Calculate the cumulative offset up to this paragraph
    let cumulativeOffset = 0;
    for (let i = 0; i < paragraphIndex; i++) {
      cumulativeOffset += paragraphs[i].length + 2; // +2 for \n\n
    }

    return cumulativeOffset + relativePosition;
  }, [paragraphs]);

  // Calculate the character position of a clicked word in the full text
  const calculateWordPosition = useCallback((element: HTMLElement, word: string, paragraphIndex: number) => {
    if (!contentRef.current) return { start: -1, end: -1 };

    console.log('🔍 Calculating position for word:', `"${word}"`, 'in paragraph:', paragraphIndex);

    // Create a range for the clicked element
    const range = document.createRange();
    range.selectNodeContents(element);

    // Get the position of this element within the full content
    const preElementRange = document.createRange();
    preElementRange.selectNodeContents(contentRef.current);
    preElementRange.setEnd(range.startContainer, range.startOffset);

    const start = preElementRange.toString().length;
    const end = start + word.length;

    console.log('📍 Calculated word position:', { start, end, word });

    return { start, end };
  }, []);

  // Handle text selection with mouse
  const handleMouseUp = useCallback(() => {
    console.log('🖱️ handleMouseUp called');
    if (!isClient) {
      console.log('❌ Not client side');
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ No selection');
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    console.log('📝 Selected text:', `"${selectedText}"`, 'length:', selectedText.length);

    if (selectedText.length > 0 && contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
      console.log('✅ Valid selection in content');

      // Get the character position of the selection within the full text (DOM-based)
      const preSelectionRange = document.createRange();
      preSelectionRange.selectNodeContents(contentRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const domStart = preSelectionRange.toString().length;
      const domEnd = domStart + selectedText.length;

      console.log('📍 DOM Position range:', { domStart, domEnd });

      // Use actual DOM traversal to find the paragraph and relative position
      const paragraphInfo = findParagraphForDOMPosition(range);
      console.log('📍 Paragraph info from DOM:', paragraphInfo);

      // Calculate the final paragraph-based position
      const start = calculateParagraphBasedPosition(paragraphInfo.paragraphIndex, paragraphInfo.relativePosition);
      const end = start + selectedText.length;

      console.log('📍 Final calculated positions:', {
        paragraphIndex: paragraphInfo.paragraphIndex,
        relativePosition: paragraphInfo.relativePosition,
        start,
        end
      });

      console.log('📍 Final Position range:', { start, end });

      // Check if this range already exists
      const exists = highlightedRanges.some(hr =>
        hr.componentRanges.some(range => range.start === start && range.end === end)
      );
      console.log('🔄 Range exists:', exists);

      // Prevent duplicate highlights from double-click and rapid selections
      const currentTime = Date.now();
      const timeSinceLastHighlight = currentTime - lastHighlightTime;
      const isSameText = selectedText === lastHighlightText;
      const isSimilarText = selectedText.trim() === lastHighlightText.trim();
      const isRapidSelection = timeSinceLastHighlight < 500 && (isSameText || isSimilarText);

      // Also check for range overlap as additional protection
      const hasOverlappingRange = highlightedRanges.some(hr =>
        hr.componentRanges.some(range => {
          const overlapStart = Math.max(start, range.start);
          const overlapEnd = Math.min(end, range.end);
          return overlapStart < overlapEnd; // Some overlap exists
        })
      );

      console.log('🖱️ Duplicate detection:', {
        currentTime,
        lastHighlightTime,
        timeSinceLastHighlight,
        selectedText: `"${selectedText}"`,
        lastHighlightText: `"${lastHighlightText}"`,
        isSameText,
        isSimilarText,
        isRapidSelection,
        hasOverlappingRange,
        shouldBlock: isRapidSelection || hasOverlappingRange
      });

      if (isRapidSelection || hasOverlappingRange) {
        console.log('🚫 Duplicate highlight detected, ignoring');
        return;
      }

      if (!exists) {
        // Determine if this is a collocation (multiple words) or single word
        const trimmedText = selectedText.trim();
        const words = trimmedText.split(/\s+/).filter(word => word.length > 0); // Filter out empty strings
        const isCollocation = words.length > 1;
        const type = isCollocation ? 'collocation' : 'word';

        console.log('🔍 Classification analysis:', {
          originalText: `"${selectedText}"`,
          trimmedText: `"${trimmedText}"`,
          words,
          wordCount: words.length,
          isCollocation,
          type
        });

        const newHighlight = createHighlightedRange(
          selectedText,
          start,
          end,
          type,
          selectedText
        );

        console.log('➕ Adding new highlight:', {
          ...newHighlight,
          debug_type: newHighlight.type,
          debug_displayText: newHighlight.displayText
        });

        // Update last highlight info to prevent double-click duplicates
        setLastHighlightTime(currentTime);
        setLastHighlightText(selectedText);

        setHighlightedRanges(prev => {
          console.log('📋 Current highlights before:', prev);
          const updated = [...prev, newHighlight];
          console.log('📋 Current highlights after:', updated);
          return updated;
        });

        // Only remove selection after successfully processing it
        selection.removeAllRanges();
        console.log('🗑️ Selection removed after processing');
      } else {
        console.log('❌ Range already exists, keeping selection');
      }
    } else {
      console.log('❌ Invalid selection or outside content');
    }
  }, [isClient, highlightedRanges]);

  // Set up mouse up listener for text selection
  useEffect(() => {
    if (!isClient) return;

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isClient, handleMouseUp]);

  // Handle word click for non-contiguous selection
  const handleWordClick = useCallback((word: string, element: HTMLElement, position: number, paragraphIndex: number, isCtrlPressed: boolean) => {
    console.log('🔤 handleWordClick called:', { word, position, paragraphIndex, isCtrlPressed });

    // Calculate the actual character position of this word in the full text
    const wordPosition = calculateWordPosition(element, word, paragraphIndex);

    if (isCtrlPressed) {
      // Multi-word selection mode
      setSelectedWords(prev => {
        const isAlreadySelected = prev.some(w => w.word === word);
        console.log('🔄 Word already selected:', isAlreadySelected);

        if (isAlreadySelected) {
          // Remove word from selection
          const updated = prev.filter(w => w.word !== word);
          console.log('➖ Removed word, new selection:', updated);
          return updated;
        } else {
          // Add word to selection with position data
          const updated = [...prev, { word, element, position, paragraphIndex, ...wordPosition }];
          console.log('➕ Added word with position, new selection:', updated);
          return updated;
        }
      });
      setShowFloatingToolbar(true);
    } else {
      // Single word selection
      const newSelection = [{ word, element, position, paragraphIndex, ...wordPosition }];
      console.log('🔤 Single word selection with position:', newSelection);
      setSelectedWords(newSelection);
      setShowFloatingToolbar(true);
    }

    // Update toolbar position
    const rect = element.getBoundingClientRect();
    const newPosition = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    };
    console.log('📍 Toolbar position:', newPosition);
    setToolbarPosition(newPosition);
  }, [calculateWordPosition]);

  // Finalize non-contiguous selection
  const finalizeHighlight = useCallback(() => {
    console.log('🎯 finalizeHighlight called');
    console.log('📋 Selected words:', selectedWords);

    if (selectedWords.length === 0) {
      console.log('❌ No selected words to highlight');
      return;
    }

    // Sort selected words by their character position in the text
    const sortedWords = [...selectedWords].sort((a, b) => {
      if (a.start !== undefined && b.start !== undefined) {
        return a.start - b.start;
      }
      // Fallback to original sorting if positions aren't available
      if (a.paragraphIndex !== b.paragraphIndex) {
        return a.paragraphIndex - b.paragraphIndex;
      }
      return a.position - b.position;
    });

    console.log('📝 Sorted words:', sortedWords);

    if (sortedWords.length === 1) {
      // Single word selection - create a word-type highlight
      const word = sortedWords[0];
      console.log(`🔍 Processing single word: "${word.word}"`);

      if (word.start !== undefined && word.end !== undefined && word.start !== -1) {
        const newHighlight = createHighlightedRange(
          word.word,
          word.start,
          word.end,
          'word',
          word.word,
          [{ position: word.position, paragraphIndex: word.paragraphIndex }]
        );

        console.log('✨ Created single word highlight:', newHighlight);
        setHighlightedRanges(prev => {
          console.log('📋 Highlights before adding:', prev);
          const updated = [...prev, newHighlight];
          console.log('📋 Highlights after adding:', updated);
          return updated;
        });
      } else {
        console.log(`⚠️ No exact position for "${word.word}"`);
      }
    } else {
      // Multi-word selection - create a collocation
      console.log('🔗 Creating collocation from multiple words');

      // Analyze contiguity and create contiguous groups
      const contiguousGroups: Array<{words: typeof sortedWords, isContiguous: boolean}> = [];
      let currentGroup: typeof sortedWords = [sortedWords[0]];

      console.log('🔍 Analyzing contiguity for words:', sortedWords);

      for (let i = 1; i < sortedWords.length; i++) {
        const currentWord = sortedWords[i];
        const prevWord = sortedWords[i - 1];

        // Check if words are contiguous (same paragraph and close position)
        const isContiguous =
          currentWord.paragraphIndex === prevWord.paragraphIndex &&
          currentWord.start !== undefined &&
          prevWord.end !== undefined &&
          (currentWord.start - prevWord.end) <= 5; // Allow up to 5 characters gap

        console.log(`📏 Checking contiguity between "${prevWord.word}" and "${currentWord.word}":`, {
          isContiguous,
          gap: currentWord.start !== undefined && prevWord.end !== undefined ? currentWord.start - prevWord.end : 'unknown',
          paragraphIndex: currentWord.paragraphIndex
        });

        if (isContiguous) {
          // Add to current group
          currentGroup.push(currentWord);
        } else {
          // Start a new group
          contiguousGroups.push({
            words: currentGroup,
            isContiguous: currentGroup.length > 1
          });
          currentGroup = [currentWord];
        }
      }

      // Add the last group
      contiguousGroups.push({
        words: currentGroup,
        isContiguous: currentGroup.length > 1
      });

      console.log('📊 Contiguous groups detected:', contiguousGroups);

      // Create display text based on contiguous groups
      const displayTextParts: string[] = [];
      contiguousGroups.forEach((group) => {
        if (group.isContiguous) {
          // Join contiguous words with spaces
          displayTextParts.push(group.words.map(w => w.word).join(' '));
        } else {
          // Single word, just add it
          displayTextParts.push(group.words[0].word);
        }
      });

      // Join groups with ellipsis if there are multiple non-contiguous groups
      let displayText: string;
      if (displayTextParts.length === 1) {
        displayText = displayTextParts[0];
      } else {
        displayText = displayTextParts.join(' ... ');
      }

      console.log('🎨 Final display text:', `"${displayText}"`);

      const componentRanges = sortedWords.map((word) => {
        if (word.start !== undefined && word.end !== undefined && word.start !== -1) {
          return {
            start: word.start,
            end: word.end,
            text: word.word
          };
        } else {
          // Fallback for words without positions
          const fullText = getFullText();
          const wordStart = fullText.indexOf(word.word);
          return {
            start: wordStart,
            end: wordStart + word.word.length,
            text: word.word
          };
        }
      });

      const selectedWordPositions = sortedWords.map(word => ({
        position: word.position,
        paragraphIndex: word.paragraphIndex
      }));

      const firstWord = sortedWords[0];
      const lastWord = sortedWords[sortedWords.length - 1];
      const overallStart = firstWord.start ?? 0;
      const overallEnd = lastWord.end ?? (overallStart + displayText.length);

      const newHighlight: HighlightedRange = {
        id: Date.now().toString(),
        targetLexeme: displayText,
        sourceContext: getSourceContext(overallStart, overallEnd),
        type: 'collocation',
        displayText,
        componentRanges,
        isNonContiguous: true,
        selectedWordPositions,
        originalContext: displayText,
        phase1Inference: { contextualGuessVI: "" },
        phase2Annotation: {
          phonetic: "",
          sentiment: "",
          definitionEN: "",
          translationVI: "",
          relatedCollocates: [],
          wordForms: {}
        },
        phase3Production: { taskType: "", content: "" }
      };

      console.log('✨ Created collocation highlight:', newHighlight);
      setHighlightedRanges(prev => {
        console.log('📋 Highlights before adding:', prev);
        const updated = [...prev, newHighlight];
        console.log('📋 Highlights after adding:', updated);
        return updated;
      });
    }

    // Reset selection
    console.log('🔄 Resetting selection state');
    setSelectedWords([]);
    setShowFloatingToolbar(false);
  }, [selectedWords, getFullText]);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setSelectedWords([]);
    setShowFloatingToolbar(false);
  }, []);

  // Clear all highlights
  const clearHighlightedItems = useCallback(() => {
    setHighlightedRanges([]);
  }, []);

  // Export functions for the specification requirements
  const exportAsText = useCallback(() => {
    const text = highlightedRanges.map(item => item.targetLexeme).join('\n');
    return text;
  }, [highlightedRanges]);

  const exportAsCSV = useCallback(() => {
    const headers = ['targetLexeme', 'sourceContext'];
    const rows = highlightedRanges.map(item => [
      `"${item.targetLexeme}"`,
      `"${item.sourceContext}"`
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }, [highlightedRanges]);

  const exportAsJSON = useCallback(() => {
    console.log('📤 Exporting highlights as JSON:', highlightedRanges);

    const exportData = highlightedRanges.map(item => {
      const exportItem = {
        id: parseInt(item.id),
        targetLexeme: item.targetLexeme,
        sourceContext: item.sourceContext,
        phase1Inference: item.phase1Inference,
        phase2Annotation: item.phase2Annotation,
        phase3Production: item.phase3Production
      };
      console.log('📦 Export item:', exportItem);
      return exportItem;
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    console.log('📄 Final JSON string:', jsonString);

    return jsonString;
  }, [highlightedRanges]);

  const copyToClipboard = useCallback((format: 'simple' | 'json') => {
    if (format === 'simple') {
      const text = highlightedRanges.map(item => item.targetLexeme).join(', ');
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(exportAsJSON());
    }
  }, [highlightedRanges, exportAsJSON]);

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Render text segment with clickable words
  const renderTextSegmentWithWordClicks = useCallback((text: string, keyPrefix: string) => {
    // Split into paragraphs first
    const paragraphs = text.split(/\n\n/);

    return paragraphs.map((paragraph, pIndex) => {
      // Split each paragraph into words and non-words
      const parts = paragraph.split(/(\s+|[.,!?;:"'\(\)\[\]{}])/);

      const elements = parts.map((part, partIndex) => {
        const isWord = part.trim().length > 0 && !/^\s+$/.test(part) && !/^[.,!?;:"'\(\)\[\]{}]+$/.test(part);

        if (isWord) {
          // Check if this word is selected
          const isSelected = selectedWords.some(w => w.word === part);

          return (
            <span
              key={`${keyPrefix}-${pIndex}-${partIndex}`}
              className={cn(
                "inline cursor-pointer transition-all duration-200 rounded",
                "hover:bg-blue-100 dark:hover:bg-blue-900/30",
                "px-0.5 py-0.5 -mx-0.5",
                isSelected && "bg-blue-200 dark:bg-blue-800/50 ring-2 ring-blue-500 px-1"
              )}
              onClick={(e) => {
                e.stopPropagation();
                const isCtrlPressed = e.ctrlKey || e.metaKey;
                // Calculate position in text
                const elementText = e.currentTarget.parentElement?.textContent || '';
                const wordPosition = elementText.substring(0, elementText.indexOf(part)).split(/\s+/).filter(w => w.trim()).length;
                handleWordClick(part, e.currentTarget as HTMLElement, wordPosition, pIndex, isCtrlPressed);
              }}
            >
              {part}
            </span>
          );
        } else {
          return (
            <span key={`${keyPrefix}-${pIndex}-${partIndex}`}>
              {part}
            </span>
          );
        }
      });

      return (
        <p key={`${keyPrefix}-${pIndex}`} className="break-inside-avoid mb-4 leading-relaxed">
          {elements}
        </p>
      );
    });
  }, [selectedWords, handleWordClick]);


  // Render full text with position-based highlights
  const renderFullTextWithHighlights = useCallback(() => {
    console.log('🎨 renderFullTextWithHighlights called');
    console.log('📋 Current highlightedRanges:', highlightedRanges);

    if (!isClient || !contentRef.current) {
      console.log('❌ Not client or no content ref');
      return null;
    }

    const sortedRanges = [...highlightedRanges].sort((a, b) => {
      // Sort by the start position of the first component range
      const aStart = a.componentRanges[0]?.start ?? 0;
      const bStart = b.componentRanges[0]?.start ?? 0;
      return aStart - bStart;
    });
    console.log('📊 Sorted ranges:', sortedRanges);

    if (sortedRanges.length === 0) {
      console.log('⚠️ No highlights to render, returning normal text');
      return (
        <div className={cn("prose prose-lg max-w-none", readingState.lineSpacing)}>
          {paragraphs.map((paragraph, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-8"
            >
              {renderTextSegmentWithWordClicks(paragraph, `paragraph-${index}`)}
            </motion.div>
          ))}
        </div>
      );
    }

    // Calculate text offsets for each paragraph
    let currentOffset = 0;
    const paragraphOffsets: Array<{ start: number; end: number; text: string }> = [];

    paragraphs.forEach((paragraph) => {
      const start = currentOffset;
      const end = start + paragraph.length;
      paragraphOffsets.push({ start, end, text: paragraph });
      currentOffset = end + 2; // +2 for \n\n between paragraphs
    });

    console.log('📝 Paragraph offsets:', paragraphOffsets);

    // Render each paragraph with its highlights
    return (
      <div className={cn("prose prose-lg max-w-none", readingState.lineSpacing)}>
        {paragraphs.map((paragraph, paragraphIndex) => {
          const paragraphOffset = paragraphOffsets[paragraphIndex];
          const paragraphStart = paragraphOffset.start;
          const paragraphEnd = paragraphOffset.end;

          // Find highlights that have component ranges within this paragraph
          const paragraphHighlights = sortedRanges.filter(highlight =>
            highlight.componentRanges.some(range =>
              range.start >= paragraphStart && range.end <= paragraphEnd
            )
          );

          console.log(`📚 Paragraph ${paragraphIndex} highlights:`, paragraphHighlights);

          if (paragraphHighlights.length === 0) {
            // No highlights in this paragraph, render normally
            return (
              <motion.div
                key={paragraphIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: paragraphIndex * 0.1 }}
                className="mb-8"
              >
                {renderTextSegmentWithWordClicks(paragraph, `paragraph-${paragraphIndex}`)}
              </motion.div>
            );
          }

          // Collect all component ranges that belong to this paragraph
          const allComponentRanges: Array<{range: {start: number; end: number; text: string}; highlightId: string; displayText: string}> = [];

          paragraphHighlights.forEach(highlight => {
            highlight.componentRanges.forEach(range => {
              if (range.start >= paragraphStart && range.end <= paragraphEnd) {
                allComponentRanges.push({
                  range,
                  highlightId: highlight.id,
                  displayText: highlight.displayText
                });
              }
            });
          });

          // Sort component ranges by start position
          allComponentRanges.sort((a, b) => a.range.start - b.range.start);

          // Render paragraph with component ranges
          let lastIndex = paragraphStart;
          const paragraphElements: React.ReactNode[] = [];

          allComponentRanges.forEach(({range, highlightId, displayText}, componentIndex) => {
            // Add text before this component range
            if (range.start > lastIndex) {
              const beforeText = paragraph.substring(
                lastIndex - paragraphStart,
                range.start - paragraphStart
              );
              paragraphElements.push(
                renderClickableWordsFromText(beforeText, `pre-${paragraphIndex}-${componentIndex}`)
              );
            }

            // Add highlighted text
            const highlightedText = paragraph.substring(
              range.start - paragraphStart,
              range.end - paragraphStart
            );
            paragraphElements.push(
              <span
                key={`highlight-${highlightId}-${componentIndex}`}
                className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 py-0.5 -mx-0.5 rounded cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-700/50"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🖱️ Clicked highlighted text:', {highlightId, displayText, highlightedText});
                  // TODO: Implement remove highlight functionality
                }}
                title={displayText} // Show the full display text on hover
              >
                {highlightedText}
              </span>
            );

            lastIndex = range.end;
          });

          // Add remaining text after last component range
          if (lastIndex < paragraphEnd) {
            const remainingText = paragraph.substring(
              lastIndex - paragraphStart,
              paragraphEnd - paragraphStart
            );
            paragraphElements.push(
              renderClickableWordsFromText(remainingText, `post-${paragraphIndex}`)
            );
          }

          return (
            <motion.div
              key={paragraphIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: paragraphIndex * 0.1 }}
              className="mb-8"
            >
              <p className="break-inside-avoid mb-4 leading-relaxed">
                {paragraphElements.map((element, elementIndex) => (
                  <React.Fragment key={elementIndex}>
                    {element}
                  </React.Fragment>
                ))}
              </p>
            </motion.div>
          );
        })}
      </div>
    );
  }, [isClient, highlightedRanges, paragraphs, readingState.lineSpacing, selectedWords, handleWordClick]);

  // Helper function to render clickable words from text (returns ReactNode[], not wrapped in <p>)
  const renderClickableWordsFromText = useCallback((text: string, keyPrefix: string) => {
    // Split text into words and non-words
    const parts = text.split(/(\s+|[.,!?;:"'\(\)\[\]{}])/);

    return parts.map((part, partIndex) => {
      const isWord = part.trim().length > 0 && !/^\s+$/.test(part) && !/^[.,!?;:"'\(\)\[\]{}]+$/.test(part);

      if (isWord) {
        // Check if this word is selected
        const isSelected = selectedWords.some(w => w.word === part);

        return (
          <span
            key={`${keyPrefix}-${partIndex}`}
            className={cn(
              "inline cursor-pointer transition-all duration-200 rounded",
              "hover:bg-blue-100 dark:hover:bg-blue-900/30",
              "px-0.5 py-0.5 -mx-0.5",
              isSelected && "bg-blue-200 dark:bg-blue-800/50 ring-2 ring-blue-500 px-1"
            )}
            onClick={(e) => {
              e.stopPropagation();
              const isCtrlPressed = e.ctrlKey || e.metaKey;
              // Calculate word position in text
              const elementText = e.currentTarget.parentElement?.textContent || '';
              const wordPosition = elementText.substring(0, elementText.indexOf(part)).split(/\s+/).filter(w => w.trim()).length;
              handleWordClick(part, e.currentTarget as HTMLElement, wordPosition, 0, isCtrlPressed);

              // Update toolbar position
              const rect = e.currentTarget.getBoundingClientRect();
              setToolbarPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10
              });
            }}
          >
            {part}
          </span>
        );
      } else {
        return (
          <span key={`${keyPrefix}-${partIndex}`}>
            {part}
          </span>
        );
      }
    });
  }, [selectedWords, handleWordClick]);


  // Handle click outside to cancel selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside content AND outside the floating toolbar
      const target = e.target as Node;
      const isOutsideContent = contentRef.current && !contentRef.current.contains(target);

      // Find if click is within floating toolbar
      const toolbarElement = document.querySelector('[data-floating-toolbar="true"]');
      const isOutsideToolbar = toolbarElement && !toolbarElement.contains(target);

      if (isOutsideContent && isOutsideToolbar) {
        console.log('🖱️ Click detected outside content and toolbar, canceling selection');
        cancelSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cancelSelection]);

  // Handle escape key to cancel selection
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelSelection();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [cancelSelection]);

  // Theme classes for background
  const themeClasses = {
    light: "bg-white text-gray-900",
    sepia: "bg-amber-50 text-amber-900",
    dark: "bg-gray-900 text-gray-100",
  };

  return (
    <div className={cn("min-h-screen transition-all duration-300", themeClasses[readingState.theme as keyof typeof themeClasses], readingState.fontFamily)} style={{ fontSize: `${readingState.fontSize}px` }}>
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/reading/${book}/${test}/${passage}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Reading
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">Learn by Myself Mode</h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {highlightedRanges.length} item{highlightedRanges.length !== 1 ? "s" : ""} highlighted
              </div>

              {highlightedRanges.length > 0 && (
                <Link href={`/vocabulary-learning/${book}/${test}/${passage}`}>
                  <Button size="sm" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Practice Vocabulary
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How to use:</strong> Click and drag to select text, or click on any word to highlight it.
            Hold <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl</kbd> or <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Cmd</kbd> and click multiple words to create a phrase.
            Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Esc</kbd> to cancel selection.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "max-w-7xl mx-auto px-4 py-8 transition-all duration-300",
        highlightedRanges.length > 0 && "mr-80"
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h1>
              <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
            </div>
          )}

          {/* Reading Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(readingState.lineSpacing)}
            ref={contentRef}
          >
            {renderFullTextWithHighlights()}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Toolbar */}
      {showFloatingToolbar && (() => {
        console.log('🔧 Floating toolbar rendering at position:', toolbarPosition);
        return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-2"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: "translate(-50%, 0)",
          }}
          data-floating-toolbar="true"
        >
          {/* Selection indicator */}
          <div className="text-xs text-muted-foreground px-2 py-1 border-r border-border">
            {selectedWords.length} word{selectedWords.length !== 1 ? "s" : ""} selected
          </div>

          {/* Highlight button */}
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              console.log('🔘 Highlight button clicked!');
              finalizeHighlight();
            }}
            className="flex items-center gap-2"
          >
            <Highlighter className="w-4 h-4" />
            Highlight
          </Button>

          {/* Cancel button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              console.log('❌ Cancel button clicked!');
              cancelSelection();
            }}
            className="p-2"
          >
            ×
          </Button>
        </motion.div>
        );
      })()}

      {/* Highlighted Items Sidebar (shown when there are items) */}
      {highlightedRanges.length > 0 && (
        <div className={cn(
          "fixed right-0 top-20 bg-card border-l border-border shadow-lg z-30 transition-all duration-300",
          isPanelCollapsed ? "w-12" : "w-80 bottom-0"
        )}>
          <div className="p-4">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between mb-4">
              {!isPanelCollapsed && (
                <h3 className="font-semibold flex items-center gap-2">
                  <Highlighter className="w-5 h-5" />
                  Vocabulary ({highlightedRanges.length})
                </h3>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="p-1 h-8 w-8"
                title={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
              >
                {isPanelCollapsed ? (
                  <span className="text-lg">›</span>
                ) : (
                  <span className="text-lg">‹</span>
                )}
              </Button>
            </div>

            {!isPanelCollapsed && (
              <>
                {/* Copy and Export buttons moved to top */}
                <div className="mb-4 space-y-2">
                  {/* Copy Section */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Copy to Clipboard</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('simple')}
                        className="flex-1 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Simple
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard('json')}
                        className="flex-1 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy JSON
                      </Button>
                    </div>
                  </div>

                  {/* Export Section */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Export as File</div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(exportAsText(), `vocabulary-${book}-${test}-${passage}.txt`, 'text/plain')}
                        className="flex-1 flex items-center gap-1 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        .txt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(exportAsCSV(), `vocabulary-${book}-${test}-${passage}.csv`, 'text/csv')}
                        className="flex-1 flex items-center gap-1 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        .csv
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(exportAsJSON(), `vocabulary-${book}-${test}-${passage}.json`, 'application/json')}
                        className="flex-1 flex items-center gap-1 text-xs"
                      >
                        <Download className="w-3 h-3" />
                        .json
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Simplified vocabulary list */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {highlightedRanges.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium text-sm text-foreground leading-relaxed">
                        {item.displayText}
                      </div>
                      {item.type === 'collocation' && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          Phrase
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Clear button at bottom */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearHighlightedItems}
                    className="w-full"
                  >
                    Clear All Highlights
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {/* <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        globalHighlightEnabled={globalHighlightEnabled}
        onGlobalHighlightChange={setGlobalHighlightEnabled}
        highlightedCount={highlightedItems.length}
        onClearAllHighlights={clearHighlightedItems}
      /> */}
    </div>
  );
}