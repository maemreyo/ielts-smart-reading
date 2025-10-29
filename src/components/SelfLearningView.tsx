"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FloatingToolbar } from "./reading/components/FloatingToolbar";
import { SettingsModal } from "./reading/components/SettingsModal";
import { useSelfLearningState } from "./reading/hooks/useSelfLearningState";
import { useReadingState } from "./reading/hooks/useReadingState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Highlighter, Settings } from "lucide-react";
import Link from "next/link";
import HighlightWords from "react-highlight-words";

interface SelfLearningViewProps {
  title?: string;
  paragraphs: string[];
  book: string;
  test: string;
  passage: string;
}

export function SelfLearningView({
  title,
  paragraphs,
  book,
  test,
  passage,
}: SelfLearningViewProps) {
  // Reading state for font settings
  const readingState = useReadingState();

  const {
    highlightedItems,
    selectionState,
    showFloatingToolbar,
    toolbarPosition,
    globalHighlightEnabled,
    handleWordClick,
    finalizeHighlight,
    cancelSelection,
    updateToolbarPosition,
    clearHighlightedItems,
    setGlobalHighlightEnabled,
  } = useSelfLearningState();

  const [isClient, setIsClient] = useState(typeof window !== 'undefined');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get search words for highlighting from highlighted items
  const getHighlightWords = useCallback(() => {
    const words: string[] = [];
    highlightedItems.forEach(item => {
      if (item.isNonContiguous) {
        // For non-contiguous selections, add individual words
        words.push(...item.targetLexeme.split(' '));
      } else {
        // For contiguous phrases, add the full phrase
        words.push(item.targetLexeme);
      }
    });
    return words;
  }, [highlightedItems]);

  // Process paragraph with react-highlight-words
  const processParagraphForSelfLearning = useCallback((paragraph: string, paragraphIndex: number) => {
    if (!isClient) return <p>{paragraph}</p>;

    const highlightWords = getHighlightWords();
    const selectedWordsInThisParagraph = selectionState.selectedWordElements.filter(
      el => el.paragraphIndex === paragraphIndex
    ).map(el => el.word);

    // Custom highlight renderer to add click handlers
    const customHighlightRenderer = ({
      children
    }: {
      children: React.ReactNode;
    }) => {
      // Check if this highlighted text is currently selected
      const textContent = typeof children === 'string' ? children : '';
      const isSelected = selectedWordsInThisParagraph.some(selectedWord =>
        textContent.toLowerCase().includes(selectedWord.toLowerCase())
      );

      return (
        <span
          className={cn(
            "bg-yellow-200 dark:bg-yellow-800/50 px-0.5 py-0.5 -mx-0.5 rounded cursor-pointer",
            "hover:bg-yellow-300 dark:hover:bg-yellow-700/50",
            isSelected && "ring-2 ring-blue-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            // Could show highlight details here
          }}
        >
          {children}
        </span>
      );
    };

    // Custom text renderer to add click handlers to all words
    const customTextRenderer = ({
      children,
      index
    }: {
      children: React.ReactNode;
      index: number;
    }) => {
      if (typeof children !== 'string') {
        return <span key={index}>{children}</span>;
      }

      // Split text into words and non-words
      const parts = children.split(/(\s+|[.,!?;:"'\(\)\[\]{}])/);

      return (
        <span key={index}>
          {parts.map((part, partIndex) => {
            const isWord = part.trim().length > 0 && !/^\s+$/.test(part) && !/^[.,!?;:"'\(\)\[\]{}]+$/.test(part);
            const isSelected = selectedWordsInThisParagraph.includes(part);

            if (!isWord) {
              return <span key={`${index}-${partIndex}`}>{part}</span>;
            }

            return (
              <span
                key={`${index}-${partIndex}`}
                className={cn(
                  "inline cursor-pointer transition-all duration-200 rounded",
                  "hover:bg-blue-100 dark:hover:bg-blue-900/30",
                  "px-0.5 py-0.5 -mx-0.5",
                  isSelected && "bg-blue-200 dark:bg-blue-800/50 ring-2 ring-blue-500 px-1"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  const isCtrlPressed = e.ctrlKey || e.metaKey;

                  // Calculate word position by counting words before this one
                  const textBefore = children.substring(0, children.indexOf(part));
                  const wordsBefore = textBefore.split(/\s+/).filter(w => w.trim()).length;

                  handleWordClick(part, e.currentTarget as HTMLElement, wordsBefore, paragraphIndex, isCtrlPressed);

                  // Update toolbar position to be below the word
                  const rect = e.currentTarget.getBoundingClientRect();
                  updateToolbarPosition(
                    rect.left + rect.width / 2,
                    rect.bottom + 10
                  );
                }}
              >
                {part}
              </span>
            );
          })}
        </span>
      );
    };

    return (
      <p key={paragraphIndex} className="break-inside-avoid mb-4 leading-relaxed">
        <HighlightWords
          searchWords={highlightWords}
          textToHighlight={paragraph}
          highlightClassName="bg-yellow-200 dark:bg-yellow-800/50"
          highlightTag="span"
          highlightStyle={{
            padding: '2px 4px',
            margin: '0 -2px',
            borderRadius: '4px'
          }}
          renderHighlight={customHighlightRenderer}
          textRenderer={customTextRenderer}
        />
      </p>
    );
  }, [isClient, getHighlightWords, highlightedItems, selectionState.selectedWordElements, handleWordClick, updateToolbarPosition]);

  // Handle click outside to cancel selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
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
                {highlightedItems.length} item{highlightedItems.length !== 1 ? "s" : ""} highlighted
              </div>

              {highlightedItems.length > 0 && (
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
            <strong>How to use:</strong> Click on any word to highlight it.
            Hold <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl</kbd> or <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Cmd</kbd> and click multiple words to create a phrase.
            Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Esc</kbd> to cancel selection.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={contentRef}
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
          <div className={cn("prose prose-lg max-w-none", readingState.lineSpacing)}>
            {paragraphs.map((paragraph, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8"
              >
                {processParagraphForSelfLearning(paragraph, index)}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Toolbar */}
      <FloatingToolbar
        position={toolbarPosition}
        isVisible={showFloatingToolbar}
        selectedWordsCount={selectionState.selectedWords.length}
        onHighlight={finalizeHighlight}
        onCancel={cancelSelection}
        highlightedItemsCount={highlightedItems.length}
      />

      {/* Highlighted Items Sidebar (shown when there are items) */}
      {highlightedItems.length > 0 && (
        <div className="fixed right-0 top-20 bottom-0 w-80 bg-card border-l border-border shadow-lg z-30 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Highlighter className="w-5 h-5" />
              Highlighted Vocabulary ({highlightedItems.length})
            </h3>

            <div className="space-y-3">
              {highlightedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="font-medium text-sm mb-1">
                    {item.targetLexeme}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {item.isNonContiguous ? item.originalContext : item.sourceContext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        globalHighlightEnabled={globalHighlightEnabled}
        onGlobalHighlightChange={setGlobalHighlightEnabled}
        highlightedCount={highlightedItems.length}
        onClearAllHighlights={clearHighlightedItems}
      />
    </div>
  );
}