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

    console.log('📄 Extracting source context for positions:', { start, end, fullTextLength: fullText.length });

    // Find the start and end of the sentence containing the highlighted text
    const beforeText = fullText.substring(0, start);
    const afterText = fullText.substring(end);

    // Find sentence boundaries (., !, ?) with proper spacing
    const sentenceStartCandidates = [
      beforeText.lastIndexOf('. ') !== -1 ? beforeText.lastIndexOf('. ') + 2 : -1,
      beforeText.lastIndexOf('! ') !== -1 ? beforeText.lastIndexOf('! ') + 2 : -1,
      beforeText.lastIndexOf('? ') !== -1 ? beforeText.lastIndexOf('? ') + 2 : -1,
      0 // Start of text as fallback
    ].filter(pos => pos !== -1);

    const sentenceStart = Math.max(...sentenceStartCandidates);

    const sentenceEndCandidates = [
      afterText.indexOf('. ') !== -1 ? afterText.indexOf('. ') + end + 1 : -1,
      afterText.indexOf('! ') !== -1 ? afterText.indexOf('! ') + end + 1 : -1,
      afterText.indexOf('? ') !== -1 ? afterText.indexOf('? ') + end + 1 : -1,
      fullText.length // End of text as fallback
    ].filter(pos => pos !== -1);

    const sentenceEnd = Math.min(...sentenceEndCandidates);

    const sentence = fullText.substring(sentenceStart, sentenceEnd).trim();
    console.log('📝 Extracted sentence:', `"${sentence}"`);

    // Truncate to < 18 words as per specification, respecting word boundaries
    const words = sentence.split(/\s+/).filter(word => word.trim().length > 0);
    console.log('📊 Word analysis:', { totalWords: words.length, words: words.slice(0, 10) });

    if (words.length > 18) {
      // Take first 18 words
      const truncatedWords = words.slice(0, 18);
      let truncatedText = truncatedWords.join(' ');

      // Clean up trailing punctuation and add ellipsis
      truncatedText = truncatedText.replace(/[,.!?;:]+$/, '');
      
      // Only add ellipsis if we actually truncated content
      if (words.length > 18) {
        truncatedText += '...';
      }

      console.log('✂️ Truncated context:', `"${truncatedText}"`);
      return truncatedText;
    }

    console.log('✅ Context within limit:', `"${sentence}"`);
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
        wordForms: {
          noun: [],
          verb: [],
          adjective: [],
          adverb: []
        },
        register: "",
        connotation: null,
        usageNotes: null,
        contrastingCollocates: []
      },
      phase3Production: { taskType: "", content: "" }
    };
  }, [getSourceContext]);

  // Helper function to find which paragraph contains a DOM position using actual DOM traversal
  const findParagraphForDOMPosition = useCallback((range: Range) => {
    if (!contentRef.current) return { paragraphIndex: 0, relativePosition: 0 };

    console.log('🔍 Starting DOM position search...');
    
    // Find the actual text node and element that contains the selection
    let targetElement = range.startContainer;
    
    // If we're in a text node, get its parent element
    if (targetElement.nodeType === Node.TEXT_NODE) {
      targetElement = targetElement.parentNode;
    }

    console.log('🎯 Target element:', targetElement);

    // Walk up the DOM tree to find the motion.div container
    let currentElement = targetElement as Element;
    while (currentElement && currentElement !== contentRef.current) {
      console.log('🔍 Checking element:', currentElement.tagName, currentElement.className);
      
      // Check if this element is a direct child of contentRef (motion.div)
      if (currentElement.parentElement === contentRef.current) {
        // This is a motion.div - find its index
        const contentChildren = Array.from(contentRef.current.children);
        const motionDivIndex = contentChildren.indexOf(currentElement);
        
        console.log('🎯 Found motion.div at index:', motionDivIndex);
        
        if (motionDivIndex !== -1) {
          // Calculate relative position within the paragraph
          const paragraphElement = currentElement.querySelector('p');
          if (paragraphElement) {
            const paragraphRange = document.createRange();
            paragraphRange.selectNodeContents(paragraphElement);
            paragraphRange.setEnd(range.startContainer, range.startOffset);
            const relativePosition = paragraphRange.toString().length;

            console.log('🎯 Successfully found paragraph:', {
              paragraphIndex: motionDivIndex,
              paragraphText: paragraphElement.textContent?.substring(0, 50) + '...',
              relativePosition,
              motionDivElement: currentElement.tagName
            });

            return { paragraphIndex: motionDivIndex, relativePosition };
          }
        }
      }
      
      currentElement = currentElement.parentElement;
    }

    // Enhanced fallback - try to find by comparing text content
    console.log('⚠️ Direct method failed, trying text comparison fallback...');
    
    const selectionText = range.toString();
    const contentChildren = Array.from(contentRef.current.children);
    
    for (let i = 0; i < contentChildren.length; i++) {
      const motionDiv = contentChildren[i];
      const textContent = motionDiv.textContent || '';
      
      if (textContent.includes(selectionText)) {
        console.log('🎯 Found by text comparison:', {
          paragraphIndex: i,
          paragraphText: textContent.substring(0, 50) + '...',
          selectionText
        });
        
        // Calculate relative position
        const selectionStart = textContent.indexOf(selectionText);
        return { paragraphIndex: i, relativePosition: selectionStart };
      }
    }

    // Final fallback
    console.log('⚠️ All methods failed, using fallback to first paragraph');
    return { paragraphIndex: 0, relativePosition: 0 };
  }, [contentRef]);

  // Helper function to calculate paragraph-based position
  const calculateParagraphBasedPosition = useCallback((paragraphIndex: number, relativePosition: number) => {
    // Calculate position based on original paragraphs array (consistent with ReadingContent)
    let cumulativeOffset = 0;
    
    // Calculate offset using the same logic as ReadingContent
    for (let i = 0; i < paragraphIndex && i < paragraphs.length; i++) {
      cumulativeOffset += paragraphs[i].length;
      console.log(`📏 Paragraph ${i} length:`, paragraphs[i].length, `"${paragraphs[i].substring(0, 50)}..."`);
    }
    
    const finalPosition = cumulativeOffset + relativePosition;
    console.log('🎯 Calculated position (consistent logic):', {
      paragraphIndex,
      relativePosition,
      cumulativeOffset,
      finalPosition,
      totalParagraphs: paragraphs.length
    });
    
    return finalPosition;
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
      const isRapidSelection = timeSinceLastHighlight < 1000 && (isSameText || isSimilarText); // Increased timeout to 1 second

      // Enhanced overlap detection - check for exact matches and partial overlaps
      const hasOverlappingRange = highlightedRanges.some(hr =>
        hr.componentRanges.some(range => {
          // Check for exact match first
          if (range.start === start && range.end === end) {
            console.log('🔍 Found exact match:', { existing: range, new: { start, end } });
            return true;
          }
          
          // Check for partial overlap
          const overlapStart = Math.max(start, range.start);
          const overlapEnd = Math.min(end, range.end);
          const hasOverlap = overlapStart < overlapEnd;
          
          if (hasOverlap) {
            console.log('🔍 Found overlap:', { 
              existing: range, 
              new: { start, end }, 
              overlap: { overlapStart, overlapEnd } 
            });
          }
          
          return hasOverlap;
        })
      );

      // Enhanced duplicate detection logging
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
        selection.removeAllRanges(); // Clear selection to avoid confusion
        return;
      }

      if (!exists) {
        // Determine if this is a collocation (multiple words) or single word
        const trimmedText = selectedText.trim();
        const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
        const isCollocation = words.length > 1;
        const type = isCollocation ? 'collocation' : 'word';

        console.log('🔍 Classification analysis for mouse selection:', {
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
      console.log('🔗 Creating collocation from multiple words');
      console.log('🔍 Analyzing contiguity for words:', sortedWords.map(w => ({
        word: w.word,
        start: w.start,
        end: w.end,
        paragraphIndex: w.paragraphIndex
      })));

      const contiguousGroups: Array<{words: typeof sortedWords, isContiguous: boolean}> = [];
      let currentGroup: typeof sortedWords = [sortedWords[0]];

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
          sameParagraph: currentWord.paragraphIndex === prevWord.paragraphIndex,
          paragraphIndex: currentWord.paragraphIndex
        });

        if (isContiguous) {
          // Add to current group
          currentGroup.push(currentWord);
        } else {
          // Start a new group
          contiguousGroups.push({
            words: [...currentGroup],
            isContiguous: currentGroup.length > 1
          });
          currentGroup = [currentWord];
        }
      }

      // Add the last group
      contiguousGroups.push({
        words: [...currentGroup],
        isContiguous: currentGroup.length > 1
      });

      console.log('📊 Contiguous groups detected:', contiguousGroups.map(g => ({
        words: g.words.map(w => w.word),
        isContiguous: g.isContiguous,
        wordCount: g.words.length
      })));

      // Create display text based on contiguous groups - FIXED LOGIC
      const displayTextParts: string[] = [];
      
      contiguousGroups.forEach((group) => {
        if (group.isContiguous && group.words.length > 1) {
          // Join contiguous words with spaces (e.g., "A B C")
          displayTextParts.push(group.words.map(w => w.word).join(' '));
        } else {
          // For single words (including single words in non-contiguous groups), add them individually
          group.words.forEach(word => {
            displayTextParts.push(word.word);
          });
        }
      });

      console.log('🔧 Display text parts before joining:', displayTextParts);

      // Smart joining logic to avoid redundant ellipsis
      let displayText: string;
      if (displayTextParts.length === 1) {
        // Only one part - just use it as is
        displayText = displayTextParts[0];
      } else if (displayTextParts.length === 2) {
        // Two parts - join with ellipsis
        displayText = displayTextParts.join(' ... ');
      } else {
        // Multiple parts - join with ellipsis but avoid creating "A ... B ... C"
        // Instead, group consecutive single words if they form meaningful phrases
        const optimizedParts: string[] = [];
        let tempSingleWords: string[] = [];
        
        displayTextParts.forEach((part, index) => {
          const isSingleWord = part.split(' ').length === 1;
          
          if (isSingleWord) {
            tempSingleWords.push(part);
          } else {
            // This is a multi-word phrase
            if (tempSingleWords.length > 0) {
              // Add accumulated single words as separate parts
              tempSingleWords.forEach(word => optimizedParts.push(word));
              tempSingleWords = [];
            }
            optimizedParts.push(part);
          }
        });
        
        // Add any remaining single words
        if (tempSingleWords.length > 0) {
          tempSingleWords.forEach(word => optimizedParts.push(word));
        }
        
        displayText = optimizedParts.join(' ... ');
      }

      console.log('🎨 Final display text (fixed logic):', `"${displayText}"`);

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
          wordForms: {
            noun: [],
            verb: [],
            adjective: [],
            adverb: []
          },
          register: "",
          connotation: null,
          usageNotes: null,
          contrastingCollocates: []
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