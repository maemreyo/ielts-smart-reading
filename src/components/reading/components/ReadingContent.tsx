"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LexicalItem } from "@/components/lexical-item";

interface ReadingContentProps {
  // Content data
  title?: string;
  paragraphs: string[];
  lexicalItems: any[];
  
  // State
  currentParagraph: number;
  
  // View modes
  theme: string;
  fontFamily: string;
  fontSize: number;
  lineSpacing: string;
  columnCount: number;
  focusMode: boolean;
  dimOthers: boolean;
  sentimentFilter: string | null;
  hideTranslations: boolean;
  guessMode: boolean;
  showAnimations: boolean;
  bookmarks: number[];
  
  // Functions
  processParagraph: (paragraph: string, paragraphIndex: number) => React.ReactNode[];
  onParagraphClick?: (paragraphIndex: number) => void;
}

export function ReadingContent({
  title,
  paragraphs,
  currentParagraph,
  theme,
  fontFamily,
  fontSize,
  lineSpacing,
  columnCount,
  focusMode,
  dimOthers,
  bookmarks,
  showAnimations,
  processParagraph,
  onParagraphClick,
}: ReadingContentProps) {
  const themeClasses = {
    light: "bg-white text-gray-900",
    sepia: "bg-amber-50 text-amber-900",
    dark: "bg-gray-900 text-gray-100",
  };

  const columnClasses = {
    1: "columns-1",
    2: "md:columns-2",
    3: "lg:columns-3",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "min-h-screen transition-all duration-300",
        themeClasses[theme as keyof typeof themeClasses],
        fontFamily,
        lineSpacing
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        {title && (
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
          </div>
        )}

        {focusMode ? (
          /* Focus Mode - Single Paragraph */
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 text-center text-sm text-muted-foreground">
              Paragraph {currentParagraph + 1} of {paragraphs.length}
            </div>
            <motion.div
              key={currentParagraph}
              initial={showAnimations ? { opacity: 0, x: 50 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={showAnimations ? { opacity: 0, x: -50 } : undefined}
              transition={{ duration: 0.3 }}
              className="prose prose-lg max-w-none leading-relaxed"
            >
              <p>{processParagraph(paragraphs[currentParagraph], currentParagraph)}</p>
            </motion.div>
          </div>
        ) : (
          /* Normal Mode - All Paragraphs */
          <div
            className={cn(
              "prose prose-lg max-w-none",
              columnClasses[columnCount as keyof typeof columnClasses]
            )}
          >
            {paragraphs.map((paragraph, index) => (
              <motion.div
                key={index}
                initial={showAnimations ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={showAnimations ? { delay: index * 0.1 } : undefined}
                className={cn(
                  "mb-8 relative group",
                  dimOthers && currentParagraph !== index && "dim-paragraph cursor-pointer hover:opacity-60",
                  dimOthers && currentParagraph === index && "current-focus-paragraph",
                  currentParagraph === index &&
                    "ring-2 ring-primary/20 rounded-lg p-2",
                  dimOthers && "transition-opacity duration-200"
                )}
                onClick={() => dimOthers && onParagraphClick?.(index)}
              >
                {/* Bookmark indicator */}
                {bookmarks.includes(index) && (
                  <div className="absolute -left-8 top-0 text-yellow-500">
                    📖
                  </div>
                )}

                {/* Current paragraph indicator */}
                {currentParagraph === index && (
                  <div className="absolute -left-6 top-1 w-2 h-2 bg-primary rounded-full current-paragraph"></div>
                )}

                <p className="break-inside-avoid">
                  {processParagraph(paragraph, index)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}