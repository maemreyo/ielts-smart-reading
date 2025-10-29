"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SelectedWord, HighlightedRange } from "../types";

interface ReadingContentProps {
  paragraphs: string[];
  highlightedRanges: HighlightedRange[];
  selectedWords: SelectedWord[];
  onWordClick: (word: string, element: HTMLElement, position: number, paragraphIndex: number, isCtrlPressed: boolean) => void;
  lineSpacing: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onToolbarPositionUpdate: (position: { x: number; y: number }) => void;
}

export function ReadingContent({
  paragraphs,
  highlightedRanges,
  selectedWords,
  onWordClick,
  lineSpacing,
  contentRef,
  onToolbarPositionUpdate
}: ReadingContentProps) {
  // Render clickable words from text (returns ReactNode[], not wrapped in <p>)
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
              onWordClick(part, e.currentTarget as HTMLElement, wordPosition, 0, isCtrlPressed);

              // Update toolbar position
              const rect = e.currentTarget.getBoundingClientRect();
              onToolbarPositionUpdate({
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
  }, [selectedWords, onWordClick, onToolbarPositionUpdate]);

  // Render text segment with clickable words
  const renderTextSegmentWithWordClicks = useCallback((text: string, keyPrefix: string) => {
    // Split into paragraphs first
    const textParagraphs = text.split(/\n\n/);

    return textParagraphs.map((paragraph, pIndex) => {
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
                onWordClick(part, e.currentTarget as HTMLElement, wordPosition, pIndex, isCtrlPressed);
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
  }, [selectedWords, onWordClick]);

  // Render full text with position-based highlights
  const renderFullTextWithHighlights = useCallback(() => {
    console.log('🎨 renderFullTextWithHighlights called');

    const sortedRanges = [...highlightedRanges].sort((a, b) => {
      // Sort by the start position of the first component range
      const aStart = a.componentRanges[0]?.start ?? 0;
      const bStart = b.componentRanges[0]?.start ?? 0;
      return aStart - bStart;
    });

    if (sortedRanges.length === 0) {
      return (
        <div className={cn("prose prose-lg max-w-none", lineSpacing)}>
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

    // Render each paragraph with its highlights
    return (
      <div className={cn("prose prose-lg max-w-none", lineSpacing)}>
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
  }, [highlightedRanges, paragraphs, lineSpacing, selectedWords, renderTextSegmentWithWordClicks, renderClickableWordsFromText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(lineSpacing)}
      ref={contentRef}
    >
      {renderFullTextWithHighlights()}
    </motion.div>
  );
}