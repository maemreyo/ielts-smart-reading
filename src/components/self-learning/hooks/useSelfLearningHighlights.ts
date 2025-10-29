"use client";

import { useState, useEffect, useCallback } from "react";
import { HighlightedRange } from "../types";

export function useSelfLearningHighlights(paragraphs: string[]) {
  const [isClient, setIsClient] = useState(typeof window !== 'undefined');
  const [highlightedRanges, setHighlightedRanges] = useState<HighlightedRange[]>([]);

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
  }, [paragraphs]);

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
          if (!item.sourceContext || !item.phase1Inference) {
            console.log('🔄 Migrating old highlight item:', item);

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
  }, [isClient, paragraphs, extractSourceContextFromFullText]);

  // Save highlights to localStorage whenever they change
  useEffect(() => {
    if (!isClient) return;

    try {
      localStorage.setItem("position-based-highlights", JSON.stringify(highlightedRanges));
    } catch (error) {
      console.error("Error saving highlights:", error);
    }
  }, [isClient, highlightedRanges]);

  // Clear all highlights
  const clearHighlightedItems = useCallback(() => {
    setHighlightedRanges([]);
  }, []);

  return {
    highlightedRanges,
    setHighlightedRanges,
    clearHighlightedItems
  };
}