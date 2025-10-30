import React from "react";
import { LexicalItem, LegacyLexicalItem, isLegacyLexicalItem, isNewLexicalItem } from "@/types/lexical";

// Re-export for backward compatibility
export type { LexicalItem, LegacyLexicalItem };
export { isLegacyLexicalItem, isNewLexicalItem };

// Cache the LexicalItem component to prevent re-imports
const LexicalItemComponent = React.lazy(() =>
  import("@/components/lexical-item-v2").then(module => ({
    default: module.LexicalItem
  }))
);

export function createTextProcessor(
  lexicalItems: LexicalItem[],
  sentimentFilter: string | null,
  hideTranslations: boolean,
  guessMode: boolean,
  theme: string,
  onLearnVocabulary?: (item: LexicalItem) => void
) {
  return React.useMemo(() => function processParagraph(
    paragraph: string,
    paragraphIndex: number
  ): React.ReactNode[] {

    if (!lexicalItems || lexicalItems.length === 0) {
      return [paragraph];
    }

    // Filter items by sentiment if filter is active
    const filteredItems = sentimentFilter
      ? lexicalItems.filter(
          (item) => item.phase2Annotation.sentiment === sentimentFilter
        )
      : lexicalItems;

    if (filteredItems.length === 0) {
      return [paragraph];
    }

    let processedText = paragraph;
    const replacements: Array<{
      start: number;
      end: number;
      element: React.ReactElement;
    }> = [];

    // Process each lexical item
    filteredItems.forEach((item, itemIndex) => {
      let { targetLexeme } = item;
      let regex: RegExp;

      // Handle special lexeme patterns
      if (targetLexeme.includes("*")) {
        // Handle wildcard patterns
        const pattern = targetLexeme.replace(/\*/g, "\\w*");
        regex = new RegExp(`\\b${pattern}\\b`, "gi");
      } else {
        // Remove part-of-speech annotations like (n), (adj), (v), etc.
        let lexeme = targetLexeme
          .replace(/\s*\([a-zA-Z]+\.?\)/gi, "")
          .trim();
        lexeme = lexeme.replace(/[()]/g, "");
        const escapedLexeme = lexeme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(`\\b${escapedLexeme}\\b`, "gi");
      }

      let match;
      let matchIndex = 0;

      // Find all matches in the current processed text
      while ((match = regex.exec(processedText)) !== null) {
        const matchedText = match[0];
        const matchStart = match.index;
        const matchEnd = match.index + matchedText.length;

        // Check if this position is already replaced
        const isAlreadyReplaced = replacements.some(
          (replacement) =>
            (matchStart >= replacement.start && matchStart < replacement.end) ||
            (matchEnd > replacement.start && matchEnd <= replacement.end) ||
            (matchStart <= replacement.start && matchEnd >= replacement.end)
        );

        if (!isAlreadyReplaced) {
          const elementKey = `${item.id}-${paragraphIndex}-${matchIndex}`;
          
          const lexicalElement = React.createElement(
            React.Suspense,
            { 
              fallback: React.createElement('span', { 
                className: 'underline decoration-dotted' 
              }, matchedText),
              key: elementKey 
            },
            React.createElement(LexicalItemComponent, {
              item,
              hideTranslation: hideTranslations,
              guessMode,
              theme,
              onLearnVocabulary,
              children: matchedText
            })
          );

          replacements.push({
            start: matchStart,
            end: matchEnd,
            element: lexicalElement,
          });

          matchIndex++;
        }

        // Prevent infinite loop
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }

      // Reset regex for next item
      regex.lastIndex = 0;
    });

    // Sort replacements by start position (descending) to replace from end to beginning
    replacements.sort((a, b) => b.start - a.start);

    // Build the result array
    const result: React.ReactNode[] = [];
    let lastEnd = processedText.length;

    // Process replacements from end to beginning
    for (const replacement of replacements) {
      // Add text after this replacement
      if (lastEnd > replacement.end) {
        const textAfter = processedText.slice(replacement.end, lastEnd);
        if (textAfter) {
          result.unshift(textAfter);
        }
      }

      // Add the replacement element
      result.unshift(replacement.element);

      lastEnd = replacement.start;
    }

    // Add any remaining text at the beginning
    if (lastEnd > 0) {
      const textBefore = processedText.slice(0, lastEnd);
      if (textBefore) {
        result.unshift(textBefore);
      }
    }

    return result.length > 0 ? result : [paragraph];
  }, [lexicalItems, sentimentFilter, hideTranslations, guessMode, theme, onLearnVocabulary]);
}