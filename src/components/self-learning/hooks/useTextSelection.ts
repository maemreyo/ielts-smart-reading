"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SelectedWord, HighlightedRange } from "../types";

interface UseTextSelectionProps {
  isClient: boolean;
  paragraphs: string[];
  highlightedRanges: HighlightedRange[];
  setHighlightedRanges: React.Dispatch<React.SetStateAction<HighlightedRange[]>>;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function useTextSelection({
  isClient,
  paragraphs,
  highlightedRanges,
  setHighlightedRanges,
  contentRef
}: UseTextSelectionProps) {
  // Non-contiguous selection state
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Prevent duplicate highlights from double-click
  const [lastHighlightTime, setLastHighlightTime] = useState(0);
  const [lastHighlightText, setLastHighlightText] = useState('');

  // Get full text content for position calculations
  const getFullText = useCallback(() => {
    if (!contentRef.current) return "";
    return contentRef.current.textContent || "";
  }, [contentRef]);

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
    const words = sentence.split(' ').filter(word => word.trim().length > 0);
    if (words.length > 18) {
      const truncatedWords = words.slice(0, 18);
      let truncatedText = truncatedWords.join(' ');

      if (words.length > 18) {
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
  }, [contentRef]);

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
  }, [contentRef]);

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

      // Use actual DOM traversal to find the paragraph and relative position
      const paragraphInfo = findParagraphForDOMPosition(range);
      console.log('📍 Paragraph info from DOM:', paragraphInfo);

      // Calculate the final paragraph-based position
      const start = calculateParagraphBasedPosition(paragraphInfo.paragraphIndex, paragraphInfo.relativePosition);
      const end = start + selectedText.length;

      console.log('📍 Final Position range:', { start, end });

      // Check if this range already exists
      const exists = highlightedRanges.some(hr =>
        hr.componentRanges.some(range => range.start === start && range.end === end)
      );

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

      if (isRapidSelection || hasOverlappingRange) {
        console.log('🚫 Duplicate highlight detected, ignoring');
        return;
      }

      if (!exists) {
        // Determine if this is a collocation (multiple words) or single word
        const trimmedText = selectedText.trim();
        const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
        const isCollocation = words.length > 1;
        const type = isCollocation ? 'collocation' : 'word';

        const newHighlight = createHighlightedRange(
          selectedText,
          start,
          end,
          type,
          selectedText
        );

        // Update last highlight info to prevent double-click duplicates
        setLastHighlightTime(currentTime);
        setLastHighlightText(selectedText);

        setHighlightedRanges(prev => [...prev, newHighlight]);

        // Only remove selection after successfully processing it
        selection.removeAllRanges();
        console.log('🗑️ Selection removed after processing');
      }
    }
  }, [isClient, highlightedRanges, contentRef, findParagraphForDOMPosition, calculateParagraphBasedPosition, createHighlightedRange, lastHighlightTime, lastHighlightText, setHighlightedRanges]);

  // Handle word click for non-contiguous selection
  const handleWordClick = useCallback((word: string, element: HTMLElement, position: number, paragraphIndex: number, isCtrlPressed: boolean) => {
    console.log('🔤 handleWordClick called:', { word, position, paragraphIndex, isCtrlPressed });

    // Calculate the actual character position of this word in the full text
    const wordPosition = calculateWordPosition(element, word, paragraphIndex);

    if (isCtrlPressed) {
      // Multi-word selection mode
      setSelectedWords(prev => {
        const isAlreadySelected = prev.some(w => w.word === word);

        if (isAlreadySelected) {
          // Remove word from selection
          return prev.filter(w => w.word !== word);
        } else {
          // Add word to selection with position data
          return [...prev, { word, element, position, paragraphIndex, ...wordPosition }];
        }
      });
      setShowFloatingToolbar(true);
    } else {
      // Single word selection
      const newSelection = [{ word, element, position, paragraphIndex, ...wordPosition }];
      setSelectedWords(newSelection);
      setShowFloatingToolbar(true);
    }

    // Update toolbar position
    const rect = element.getBoundingClientRect();
    const newPosition = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    };
    setToolbarPosition(newPosition);
  }, [calculateWordPosition]);

  // Finalize non-contiguous selection
  const finalizeHighlight = useCallback(() => {
    if (selectedWords.length === 0) return;

    // Sort selected words by their character position in the text
    const sortedWords = [...selectedWords].sort((a, b) => {
      if (a.start !== undefined && b.start !== undefined) {
        return a.start - b.start;
      }
      if (a.paragraphIndex !== b.paragraphIndex) {
        return a.paragraphIndex - b.paragraphIndex;
      }
      return a.position - b.position;
    });

    if (sortedWords.length === 1) {
      // Single word selection
      const word = sortedWords[0];
      if (word.start !== undefined && word.end !== undefined && word.start !== -1) {
        const newHighlight = createHighlightedRange(
          word.word,
          word.start,
          word.end,
          'word',
          word.word,
          [{ position: word.position, paragraphIndex: word.paragraphIndex }]
        );

        setHighlightedRanges(prev => [...prev, newHighlight]);
      }
    } else {
      // Multi-word selection - create a collocation
      const contiguousGroups: Array<{words: typeof sortedWords, isContiguous: boolean}> = [];
      let currentGroup: typeof sortedWords = [sortedWords[0]];

      for (let i = 1; i < sortedWords.length; i++) {
        const currentWord = sortedWords[i];
        const prevWord = sortedWords[i - 1];

        // Check if words are contiguous
        const isContiguous =
          currentWord.paragraphIndex === prevWord.paragraphIndex &&
          currentWord.start !== undefined &&
          prevWord.end !== undefined &&
          (currentWord.start - prevWord.end) <= 5;

        if (isContiguous) {
          currentGroup.push(currentWord);
        } else {
          contiguousGroups.push({
            words: currentGroup,
            isContiguous: currentGroup.length > 1
          });
          currentGroup = [currentWord];
        }
      }

      contiguousGroups.push({
        words: currentGroup,
        isContiguous: currentGroup.length > 1
      });

      // Create display text
      const displayTextParts: string[] = [];
      contiguousGroups.forEach((group) => {
        if (group.isContiguous) {
          displayTextParts.push(group.words.map(w => w.word).join(' '));
        } else {
          displayTextParts.push(group.words[0].word);
        }
      });

      const displayText = displayTextParts.length === 1 
        ? displayTextParts[0] 
        : displayTextParts.join(' ... ');

      const componentRanges = sortedWords.map((word) => {
        if (word.start !== undefined && word.end !== undefined && word.start !== -1) {
          return {
            start: word.start,
            end: word.end,
            text: word.word
          };
        } else {
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

      setHighlightedRanges(prev => [...prev, newHighlight]);
    }

    // Reset selection
    setSelectedWords([]);
    setShowFloatingToolbar(false);
  }, [selectedWords, createHighlightedRange, setHighlightedRanges, getFullText, getSourceContext]);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setSelectedWords([]);
    setShowFloatingToolbar(false);
  }, []);

  // Set up mouse up listener for text selection
  useEffect(() => {
    if (!isClient) return;

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isClient, handleMouseUp]);

  // Handle click outside to cancel selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideContent = contentRef.current && !contentRef.current.contains(target);

      const toolbarElement = document.querySelector('[data-floating-toolbar="true"]');
      const isOutsideToolbar = toolbarElement && !toolbarElement.contains(target);

      if (isOutsideContent && isOutsideToolbar) {
        cancelSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cancelSelection, contentRef]);

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

  return {
    selectedWords,
    showFloatingToolbar,
    toolbarPosition,
    handleWordClick,
    finalizeHighlight,
    cancelSelection,
    setToolbarPosition
  };
}