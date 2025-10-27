"use client";

import { useEffect, useState } from "react";
import { ReadingToolbar } from "./reading/components/ReadingToolbar";
import { ReadingContent } from "./reading/components/ReadingContent";
import { ShortcutsModal } from "./reading/components/ShortcutsModal";
import { VocabularyLearningScreen } from "./vocabulary-learning/VocabularyLearningScreen";
import { useReadingState } from "./reading/hooks/useReadingState";
import { useAutoScroll } from "./reading/hooks/useAutoScroll";
import { useKeyboardShortcuts } from "./reading/hooks/useKeyboardShortcuts";
import { useToolbarAutoHide } from "./reading/hooks/useToolbarAutoHide";
import { createTextProcessor, type LexicalItem } from "./reading/utils/textProcessing";

interface EnhancedReadingViewProps {
  title?: string;
  paragraphs: string[];
  lexicalItems: LexicalItem[];
}

export function EnhancedReadingViewV2({
  title,
  paragraphs,
  lexicalItems,
}: EnhancedReadingViewProps) {
  // Vocabulary learning state
  const [learningItem, setLearningItem] = useState<LexicalItem | null>(null);
  const [showLearningScreen, setShowLearningScreen] = useState(false);

  // All state management
  const readingState = useReadingState();
  
  // Auto-scroll functionality
  const autoScrollActions = useAutoScroll({
    isPlaying: readingState.isPlaying,
    setIsPlaying: readingState.setIsPlaying,
    currentParagraph: readingState.currentParagraph,
    setCurrentParagraph: readingState.setCurrentParagraph,
    readingSpeed: readingState.readingSpeed,
    totalParagraphs: paragraphs.length,
    autoScrollRef: readingState.autoScrollRef,
  });

  // Keyboard shortcuts
  const { toggleShortcuts } = useKeyboardShortcuts({
    setTheme: readingState.setTheme,
    startAutoScroll: autoScrollActions.startAutoScroll,
    stopAutoScroll: autoScrollActions.stopAutoScroll,
    isPlaying: readingState.isPlaying,
    resetReading: readingState.resetReading,
    nextParagraph: autoScrollActions.nextParagraph,
    prevParagraph: autoScrollActions.prevParagraph,
    setFocusMode: readingState.setFocusMode,
    focusMode: readingState.focusMode,
    setDimOthers: readingState.setDimOthers,
    dimOthers: readingState.dimOthers,
    setHideTranslations: readingState.setHideTranslations,
    hideTranslations: readingState.hideTranslations,
    setGuessMode: readingState.setGuessMode,
    guessMode: readingState.guessMode,
    toggleBookmark: readingState.toggleBookmark,
    currentParagraph: readingState.currentParagraph,
    setShortcutsOpen: readingState.setShortcutsOpen,
    shortcutsOpen: readingState.shortcutsOpen,
  });

  // Toolbar auto-hide
  useToolbarAutoHide({
    toolbarVisible: readingState.toolbarVisible,
    setToolbarVisible: readingState.setToolbarVisible,
    lastScrollY: readingState.lastScrollY,
    setLastScrollY: readingState.setLastScrollY,
  });

  // Vocabulary learning handlers
  const handleLearnVocabulary = (item: LexicalItem) => {
    setLearningItem(item);
    setShowLearningScreen(true);
  };

  const handleCloseLearning = () => {
    setShowLearningScreen(false);
    setLearningItem(null);
  };

  const handleCompleteLearning = () => {
    // Optional: Add completion tracking logic here
    console.log('Vocabulary learning completed for:', learningItem?.targetLexeme);
  };

  // Text processing function
  const processParagraph = createTextProcessor(
    lexicalItems,
    readingState.sentimentFilter,
    readingState.hideTranslations,
    readingState.guessMode,
    readingState.theme,
    handleLearnVocabulary
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (readingState.autoScrollRef.current) {
        clearTimeout(readingState.autoScrollRef.current);
      }
    };
  }, [readingState.autoScrollRef]);

  return (
    <div className="min-h-screen">
      {/* Vocabulary Learning Screen - Full overlay */}
      {showLearningScreen && learningItem && (
        <VocabularyLearningScreen
          lexicalItem={learningItem}
          onBack={handleCloseLearning}
          onComplete={handleCompleteLearning}
        />
      )}

      {/* Toolbar */}
      <ReadingToolbar
        toolbarVisible={readingState.toolbarVisible}
        theme={readingState.theme}
        setTheme={readingState.setTheme}
        isPlaying={readingState.isPlaying}
        startAutoScroll={autoScrollActions.startAutoScroll}
        stopAutoScroll={autoScrollActions.stopAutoScroll}
        resetReading={readingState.resetReading}
        readingSpeed={readingState.readingSpeed}
        setReadingSpeed={readingState.setReadingSpeed}
        sentimentFilter={readingState.sentimentFilter}
        setSentimentFilter={readingState.setSentimentFilter}
        dimOthers={readingState.dimOthers}
        setDimOthers={readingState.setDimOthers}
        focusMode={readingState.focusMode}
        setFocusMode={readingState.setFocusMode}
        hideTranslations={readingState.hideTranslations}
        setHideTranslations={readingState.setHideTranslations}
        guessMode={readingState.guessMode}
        setGuessMode={readingState.setGuessMode}
        showAnimations={readingState.showAnimations}
        setShowAnimations={readingState.setShowAnimations}
        fontFamily={readingState.fontFamily}
        setFontFamily={readingState.setFontFamily}
        fontSize={readingState.fontSize}
        setFontSize={readingState.setFontSize}
        columnCount={readingState.columnCount}
        setColumnCount={readingState.setColumnCount}
        lineSpacing={readingState.lineSpacing}
        setLineSpacing={readingState.setLineSpacing}
        toggleShortcuts={toggleShortcuts}
      />

      {/* Main Reading Content */}
      <ReadingContent
        title={title}
        paragraphs={paragraphs}
        lexicalItems={lexicalItems}
        currentParagraph={readingState.currentParagraph}
        theme={readingState.theme}
        fontFamily={readingState.fontFamily}
        fontSize={readingState.fontSize}
        lineSpacing={readingState.lineSpacing}
        columnCount={readingState.columnCount}
        focusMode={readingState.focusMode}
        dimOthers={readingState.dimOthers}
        sentimentFilter={readingState.sentimentFilter}
        hideTranslations={readingState.hideTranslations}
        guessMode={readingState.guessMode}
        showAnimations={readingState.showAnimations}
        bookmarks={readingState.bookmarks}
        processParagraph={processParagraph}
        onParagraphClick={readingState.setCurrentParagraph}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        open={readingState.shortcutsOpen}
        onOpenChange={readingState.setShortcutsOpen}
      />
    </div>
  );
}