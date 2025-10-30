"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { ReadingToolbar } from "./reading/components/ReadingToolbar";
import { ReadingContent } from "./reading/components/ReadingContent";
import { ShortcutsModal } from "./reading/components/ShortcutsModal";
import { SpeechConfirmationDialog } from "./reading/components/SpeechConfirmationDialog";
import { VocabularyLearningScreen } from "./vocabulary-learning/VocabularyLearningScreen";
import { useReadingState } from "./reading/hooks/useReadingState";
import { useAutoScroll } from "./reading/hooks/useAutoScroll";
import { useKeyboardShortcuts } from "./reading/hooks/useKeyboardShortcuts";
import { useToolbarAutoHide } from "./reading/hooks/useToolbarAutoHide";
import { useSpeech } from "@/hooks/use-speech";
import { useParagraphSpeech } from "./reading/hooks/useParagraphSpeech";
import { useReadingTimer } from "./reading/hooks/useReadingTimer";
import { useSpeechConfirmationDialog } from "./reading/hooks/useSpeechConfirmationDialog";
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

  // Favorite voices state
  const [favoriteVoices, setFavoriteVoices] = useState<string[]>(() => {
    // Load favorite voices from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('favoriteVoices');
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error('Failed to load favorite voices:', error);
        return [];
      }
    }
    return [];
  });

  // Voice rotation state
  const [voiceRotation, setVoiceRotation] = useState(() => {
    // Load voice rotation preference from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceRotation');
        return saved ? JSON.parse(saved) : false;
      } catch (error) {
        console.error('Failed to load voice rotation preference:', error);
        return false;
      }
    }
    return false;
  });

  const [voiceRotationFavoritesOnly, setVoiceRotationFavoritesOnly] = useState(() => {
    // Load voice rotation favorites only preference from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('voiceRotationFavoritesOnly');
        return saved ? JSON.parse(saved) : false;
      } catch (error) {
        console.error('Failed to load voice rotation favorites only preference:', error);
        return false;
      }
    }
    return false;
  });

  // All state management
  const readingState = useReadingState();

  // Speech functionality with direct speech rate control
  const [speechRate, setSpeechRate] = useState(1.0); // Default to 1.0x speed

  const useSpeechInstance = useSpeech({ rate: speechRate });

  // Update speech rate when it changes
  useEffect(() => {
    if (useSpeechInstance.isSupported) {
      useSpeechInstance.updateSettings({ rate: speechRate });
    }
  }, [speechRate, useSpeechInstance.isSupported]);

  // Handle voice change
  const handleVoiceChange = useCallback((voiceName: string) => {
    const englishVoices = useSpeechInstance.getVoicesByLanguage('en');
    const selectedVoice = englishVoices.find(v => v.name === voiceName);
    if (selectedVoice) {
      useSpeechInstance.updateSettings({ voice: selectedVoice });
    }
  }, [useSpeechInstance]);

  // Save voice rotation preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('voiceRotation', JSON.stringify(voiceRotation));
      } catch (error) {
        console.error('Failed to save voice rotation preference:', error);
      }
    }
  }, [voiceRotation]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('voiceRotationFavoritesOnly', JSON.stringify(voiceRotationFavoritesOnly));
      } catch (error) {
        console.error('Failed to save voice rotation favorites only preference:', error);
      }
    }
  }, [voiceRotationFavoritesOnly]);

  // Use custom hooks
  const paragraphSpeech = useParagraphSpeech({
    paragraphs,
    speechRate,
    voiceRotation,
    voiceRotationFavoritesOnly,
    favoriteVoices,
    speechInstance: useSpeechInstance,
    onParagraphChange: readingState.setCurrentParagraph,
  });

  const readingTimer = useReadingTimer({
    onTimerEnd: paragraphSpeech.actions.stop,
  });

  const confirmationDialog = useSpeechConfirmationDialog({
    onConfirm: (paragraphIndex: number) => {
      if (useSpeechInstance.isSpeaking) {
        // Stop current speech and start new paragraph
        paragraphSpeech.actions.stop();
        paragraphSpeech.actions.play(paragraphIndex);
      } else {
        // Just focus the paragraph
        readingState.setCurrentParagraph(paragraphIndex);
      }
    },
  });

  // Auto-start timer when speech starts
  useEffect(() => {
    if (paragraphSpeech.isPlaying && readingTimer.timer.enabled && !readingTimer.timer.active) {
      readingTimer.actions.start();
    }
  }, [paragraphSpeech.isPlaying, readingTimer.timer.enabled, readingTimer.timer.active, readingTimer.actions.start]);

  // Auto-scroll functionality - modify to pause when speech is active
  const autoScrollActions = useAutoScroll({
    isPlaying: readingState.isPlaying && !useSpeechInstance.isSpeaking, // Pause auto-scroll when speech is active
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

  // Enhanced paragraph click handler using confirmation dialog
  const handleParagraphClick = (paragraphIndex: number) => {
    confirmationDialog.checkAndHandleParagraphClick(paragraphIndex, useSpeechInstance.isSpeaking);
  };

  // Global speech control functions for toolbar
  const handleStartSpeech = () => {
    if (!useSpeechInstance.isSupported) return;

    // If auto-scroll is playing, stop it first
    if (readingState.isPlaying) {
      autoScrollActions.stopAutoScroll();
    }

    // Auto-enable dim mode if not already enabled
    if (!readingState.dimOthers) {
      readingState.setDimOthers(true);
    }

    // Start from current paragraph
    paragraphSpeech.actions.play(readingState.currentParagraph);
  };

  const handleStopSpeech = () => {
    paragraphSpeech.actions.stop();
    readingTimer.actions.stop(); // Also stop the timer
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

      {/* Back to Reading Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/reading">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Reading
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">
                {title || `Cambridge Reading - Passage`}
              </h1>
            </div>
          </div>
        </div>
      </div>

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
        speechSupported={useSpeechInstance.isSupported}
        isSpeaking={useSpeechInstance.isSpeaking}
        isPaused={useSpeechInstance.isPaused}
        onStartSpeech={handleStartSpeech}
        onPauseSpeech={useSpeechInstance.pause}
        onResumeSpeech={useSpeechInstance.resume}
        onStopSpeech={handleStopSpeech}
        // Timer controls
        timerEnabled={readingTimer.timer.enabled}
        setTimerEnabled={readingTimer.actions.setEnabled}
        timerDuration={readingTimer.timer.duration}
        setTimerDuration={readingTimer.actions.setDuration}
        timerRemaining={readingTimer.timer.remaining}
        timerActive={readingTimer.timer.active}
        formatTimer={readingTimer.formatTimer}
        // Voice selection controls
        voices={useSpeechInstance.voices}
        currentVoice={useSpeechInstance.settings.voice}
        onVoiceChange={handleVoiceChange}
        favoriteVoices={favoriteVoices}
        setFavoriteVoices={setFavoriteVoices}
        voiceRotation={voiceRotation}
        setVoiceRotation={setVoiceRotation}
        voiceRotationFavoritesOnly={voiceRotationFavoritesOnly}
        setVoiceRotationFavoritesOnly={setVoiceRotationFavoritesOnly}
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
        onParagraphClick={handleParagraphClick}
        // Per-paragraph controls
        onParagraphPlay={paragraphSpeech.actions.play}
        onParagraphRepeat={paragraphSpeech.actions.repeat}
        onParagraphPause={paragraphSpeech.actions.pause}
        currentSpeakingParagraph={paragraphSpeech.currentSpeakingParagraph}
        isPlaying={paragraphSpeech.isPlaying}
        isPaused={paragraphSpeech.isPaused}
        repeatMode={paragraphSpeech.repeatMode}
        speechSupported={useSpeechInstance.isSupported}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        open={readingState.shortcutsOpen}
        onOpenChange={readingState.setShortcutsOpen}
      />

      {/* Paragraph Switch Confirmation Dialog */}
      <SpeechConfirmationDialog {...confirmationDialog.dialogProps} />
    </div>
  );
}