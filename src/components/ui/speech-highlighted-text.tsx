"use client";

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SpeechHighlightedTextProps {
  text: string;
  currentCharIndex: number;
  isSpeaking: boolean;
  className?: string;
  highlightClassName?: string;
  spokenClassName?: string;
  unspokenClassName?: string;
  wordsPerLine?: number;
}

export function SpeechHighlightedText({
  text,
  currentCharIndex,
  isSpeaking,
  className,
  highlightClassName = "bg-yellow-300 dark:bg-yellow-500 text-black dark:text-black px-1 rounded",
  spokenClassName = "text-muted-foreground",
  unspokenClassName = "text-foreground",
  wordsPerLine,
}: SpeechHighlightedTextProps) {
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);

  // Split text into words with their positions
  const words = useMemo(() => {
    const wordRegex = /\S+/g;
    const result: Array<{
      word: string;
      startIndex: number;
      endIndex: number;
      isSpoken: boolean;
      isCurrent: boolean;
    }> = [];

    let match;
    while ((match = wordRegex.exec(text)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      const isSpoken = endIndex <= currentCharIndex;
      const isCurrent = isSpeaking && startIndex <= currentCharIndex && endIndex > currentCharIndex;

      result.push({
        word: match[0],
        startIndex,
        endIndex,
        isSpoken,
        isCurrent,
      });
    }

    return result;
  }, [text, currentCharIndex, isSpeaking]);

  // Group words into lines if specified
  const wordGroups = useMemo(() => {
    if (!wordsPerLine) {
      return [words];
    }

    const groups: typeof words[] = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      groups.push(words.slice(i, i + wordsPerLine));
    }
    return groups;
  }, [words, wordsPerLine]);

  const handleWordClick = (word: string, index: number) => {
    // You can add functionality here, like speaking a specific word
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!text) {
    return null;
  }

  return (
    <div className={cn("text-base leading-relaxed", className)}>
      {wordGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-2">
          {group.map((wordData, wordIndex) => {
            const globalIndex = words.indexOf(wordData);

            return (
              <span key={globalIndex} className="inline-block mr-2 mb-1">
                <span
                  onClick={() => handleWordClick(wordData.word, globalIndex)}
                  onMouseEnter={() => setHoveredWordIndex(globalIndex)}
                  onMouseLeave={() => setHoveredWordIndex(null)}
                  className={cn(
                    "cursor-pointer transition-colors duration-150 rounded px-1 py-0.5",
                    wordData.isCurrent && highlightClassName,
                    !wordData.isCurrent && wordData.isSpoken && spokenClassName,
                    !wordData.isSpoken && unspokenClassName,
                    hoveredWordIndex === globalIndex && "bg-gray-200 dark:bg-gray-700",
                    "select-none"
                  )}
                >
                  {wordData.word}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// A simpler version for inline highlighting
interface SimpleSpeechHighlightProps {
  text: string;
  currentCharIndex: number;
  isSpeaking: boolean;
  className?: string;
  highlightClassName?: string;
}

export function SimpleSpeechHighlight({
  text,
  currentCharIndex,
  isSpeaking,
  className,
  highlightClassName = "bg-yellow-300 dark:bg-yellow-500 text-black dark:text-black px-1 rounded",
}: SimpleSpeechHighlightProps) {
  if (!isSpeaking || currentCharIndex === 0) {
    return <span className={className}>{text}</span>;
  }

  const spokenPart = text.substring(0, currentCharIndex);
  const currentPart = text.substring(currentCharIndex).split(/\s+/)[0] || '';
  const remainingPart = text.substring(currentCharIndex + currentPart.length);

  return (
    <span className={className}>
      {spokenPart && <span>{spokenPart}</span>}
      {currentPart && (
        <span className={highlightClassName}>{currentPart}</span>
      )}
      {remainingPart && <span>{remainingPart}</span>}
    </span>
  );
}