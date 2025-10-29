"use client";

import { useEffect, useState, useMemo } from "react";
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

  // Speech functionality with direct speech rate control
  const [speechRate, setSpeechRate] = useState(1.0); // Default to 1.0x speed

  const {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    currentCharIndex,
    isSupported: speechSupported,
    updateSettings,
  } = useSpeech({ rate: speechRate });

  // Update speech rate when it changes
  useEffect(() => {
    if (speechSupported) {
      updateSettings({ rate: speechRate });
    }
  }, [speechRate, speechSupported, updateSettings]);

  // Speech reading state
  const [speechMode, setSpeechMode] = useState(false);
  const [wasDimmedBeforeSpeech, setWasDimmedBeforeSpeech] = useState(false);
  const [currentSpeechParagraph, setCurrentSpeechParagraph] = useState(0);
  const [isSpeakingCurrentParagraph, setIsSpeakingCurrentParagraph] = useState(false);

  // Calculate paragraph boundaries for precise timing
  const paragraphBoundaries = useMemo(() => {
    const boundaries: Array<{ start: number; end: number; text: string }> = [];
    let charCount = 0;

    paragraphs.forEach((paragraph) => {
      const start = charCount;
      const end = charCount + paragraph.length;
      boundaries.push({ start, end, text: paragraph });
      charCount = end + 1; // +1 for space between paragraphs
    });

    return boundaries;
  }, [paragraphs]);

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

    // Reset to first paragraph
    setCurrentSpeechParagraph(0);
    readingState.setCurrentParagraph(0);
    setSpeechMode(true);

    // Start speech with synchronized timing
    speak({
      text: fullText,
      lang: 'en-US',
      rate: speechRate,
      onBoundary: (event) => {
        // Check which paragraph is currently being spoken
        const currentCharPosition = event.charIndex;

        // Find current paragraph based on character position
        for (let i = 0; i < paragraphBoundaries.length; i++) {
          const boundary = paragraphBoundaries[i];
          if (currentCharPosition >= boundary.start && currentCharPosition <= boundary.end) {
            if (currentSpeechParagraph !== i) {
              // Moved to a new paragraph - synchronize scroll
              setCurrentSpeechParagraph(i);
              readingState.setCurrentParagraph(i);
              setIsSpeakingCurrentParagraph(true);
            }
            break;
          }
        }
      },
      onEnd: () => {
        setSpeechMode(false);
        setCurrentSpeechParagraph(0);
        setIsSpeakingCurrentParagraph(false);
        // Restore dim state if it was auto-enabled
        if (wasDimmedBeforeSpeech) {
          readingState.setDimOthers(false);
          setWasDimmedBeforeSpeech(false);
        }
      },
      onError: () => {
        setSpeechMode(false);
        setCurrentSpeechParagraph(0);
        setIsSpeakingCurrentParagraph(false);
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

  // Auto-scroll functionality - modify to pause when speech is active
  const autoScrollActions = useAutoScroll({
    isPlaying: readingState.isPlaying && !speechMode, // Pause auto-scroll when speech is active
    setIsPlaying: readingState.setIsPlaying,
    currentParagraph: readingState.currentParagraph,
    setCurrentParagraph: readingState.setCurrentParagraph,
    readingSpeed: 200, // Fixed fallback speed for auto-scroll (not used anymore)
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
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
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