"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LexicalItem } from "@/components/lexical-item";
import { Play, Pause, RotateCcw, Volume2, Redo, Repeat1 } from "lucide-react";

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

  // Per-paragraph controls
  onParagraphPlay?: (paragraphIndex: number) => void;
  onParagraphRepeat?: (paragraphIndex: number) => void;
  onParagraphPause?: (paragraphIndex: number) => void;
  currentSpeakingParagraph?: number;
  isPlaying?: boolean;
  isPaused?: boolean;
  repeatMode?: boolean;
  speechSupported?: boolean;
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
  // Per-paragraph controls
  onParagraphPlay,
  onParagraphRepeat,
  onParagraphPause,
  currentSpeakingParagraph,
  isPlaying,
  isPaused,
  repeatMode,
  speechSupported,
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
            {paragraphs.map((paragraph, index) => {
              const isCurrentlySpeaking = currentSpeakingParagraph === index && currentSpeakingParagraph !== -1;
              const showRepeatButton = speechSupported && (repeatMode || isCurrentlySpeaking);

              return (
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
                  {/* Per-paragraph controls */}
                  {speechSupported && (
                    <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {/* Play button - Only show when not speaking */}
                      {!isCurrentlySpeaking && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onParagraphPlay?.(index);
                          }}
                          className="p-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
                          title="Play this paragraph"
                        >
                          <Play size={14} />
                        </motion.button>
                      )}

                      {/* Pause/Resume button - Only show when this paragraph is speaking */}
                      {isCurrentlySpeaking && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onParagraphPause?.(index);
                          }}
                          className="p-1.5 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-md"
                          title={isPaused ? "Resume this paragraph" : "Pause this paragraph"}
                        >
                          {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        </motion.button>
                      )}

                      {/* Repeat button - Show when repeat mode is active or paragraph is speaking */}
                      {showRepeatButton && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onParagraphRepeat?.(index);
                          }}
                          className={cn(
                            "p-1.5 rounded-full transition-colors shadow-md",
                            repeatMode
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-400 text-white hover:bg-gray-500"
                          )}
                          title={repeatMode ? "Turn off repeat mode" : "Turn on repeat mode"}
                        >
                          <Repeat1 size={14} />
                        </motion.button>
                      )}
                    </div>
                  )}

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

                  {/* Overlay for dimmed paragraphs to prevent interaction */}
                  {dimOthers && currentParagraph !== index && (
                    <div
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onParagraphClick?.(index);
                      }}
                      aria-label="Dimmed paragraph - click to focus"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}