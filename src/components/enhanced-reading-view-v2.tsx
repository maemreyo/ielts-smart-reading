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
import { useSpeech } from "@/hooks/useSpeech";
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

  // Speech functionality
  const {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    currentCharIndex,
    isSupported: speechSupported,
  } = useSpeech({ rate: 1.0 });

  // Speech reading state
  const [speechMode, setSpeechMode] = useState(false);
  const [wasDimmedBeforeSpeech, setWasDimmedBeforeSpeech] = useState(false);

  // Combine all paragraphs into full text for speech
  const fullText = paragraphs.join(' ');

  // Speech control functions
  const handleStartSpeech = () => {
    if (!speechSupported) return;

    // If auto-scroll is playing, stop it first
    if (readingState.isPlaying) {
      autoScrollActions.stopAutoScroll();
    }

    // Auto-enable dim mode if not already enabled
    if (!readingState.dimOthers) {
      setWasDimmedBeforeSpeech(true);
      readingState.setDimOthers(true);
    }

    setSpeechMode(true);
    speak({
      text: fullText,
      lang: 'en-US',
      onBoundary: () => {
        // Handle speech boundary events if needed
      },
      onEnd: () => {
        setSpeechMode(false);
        // Restore dim state if it was auto-enabled
        if (wasDimmedBeforeSpeech) {
          readingState.setDimOthers(false);
          setWasDimmedBeforeSpeech(false);
        }
      },
      onError: () => {
        setSpeechMode(false);
        // Restore dim state on error
        if (wasDimmedBeforeSpeech) {
          readingState.setDimOthers(false);
          setWasDimmedBeforeSpeech(false);
        }
      },
    });
  };

  const handlePauseSpeech = () => {
    if (isSpeaking) {
      pause();
    }
  };

  const handleResumeSpeech = () => {
    if (isPaused) {
      resume();
    }
  };

  const handleStopSpeech = () => {
    stop();
    setSpeechMode(false);
    // Restore dim state when stopped
    if (wasDimmedBeforeSpeech) {
      readingState.setDimOthers(false);
      setWasDimmedBeforeSpeech(false);
    }
  };

  // Calculate current paragraph based on character index
  const getCurrentSpeechParagraph = () => {
    if (!speechMode || currentCharIndex === 0) return null;

    let charCount = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      charCount += paragraphs[i].length + 1; // +1 for space
      if (charCount >= currentCharIndex) {
        return i;
      }
    }
    return null;
  };

  // Auto-scroll to current paragraph during speech
  useEffect(() => {
    if (speechMode && isSpeaking) {
      const currentParagraph = getCurrentSpeechParagraph();
      if (currentParagraph !== null && currentParagraph !== readingState.currentParagraph) {
        readingState.setCurrentParagraph(currentParagraph);
      }
    }
  }, [currentCharIndex, speechMode, isSpeaking, readingState]);

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
        // Speech controls
        speechSupported={speechSupported}
        speechMode={speechMode}
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        onStartSpeech={handleStartSpeech}
        onPauseSpeech={handlePauseSpeech}
        onResumeSpeech={handleResumeSpeech}
        onStopSpeech={handleStopSpeech}
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