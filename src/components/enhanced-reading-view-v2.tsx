"use client";

import { useEffect, useState, useRef } from "react";
import { ReadingToolbar } from "./reading/components/ReadingToolbar";
import { ReadingContent } from "./reading/components/ReadingContent";
import { ShortcutsModal } from "./reading/components/ShortcutsModal";
import { VocabularyLearningScreen } from "./vocabulary-learning/VocabularyLearningScreen";
import { useReadingState } from "./reading/hooks/useReadingState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Confirmation dialog state
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingParagraphIndex, setPendingParagraphIndex] = useState<number | null>(null);
  const [dontShowConfirmation, setDontShowConfirmation] = useState(() => {
    // Initialize from sessionStorage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('dontShowParagraphSwitchConfirmation');
      return saved === 'true';
    }
    return false;
  });

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
    isSupported: speechSupported,
    updateSettings,
  } = useSpeech({ rate: speechRate });

  // Timer functionality
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(10); // Default 10 minutes
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update speech rate when it changes
  useEffect(() => {
    if (speechSupported) {
      updateSettings({ rate: speechRate });
    }
  }, [speechRate, speechSupported, updateSettings]);

  // Timer control functions
  const startTimer = () => {
    if (!timerEnabled || timerDuration <= 0) return;

    setTimerRemaining(timerDuration * 60); // Convert minutes to seconds
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerRemaining(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timerRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished
            setTimerActive(false);
            if (isSpeaking) {
              handleStopSpeech();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerActive, timerRemaining, isSpeaking]);

  // Auto-start timer when speech starts
  useEffect(() => {
    if (isSpeaking && timerEnabled && !timerActive) {
      startTimer();
    }
  }, [isSpeaking, timerEnabled, timerActive]);

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to start speaking a paragraph
  const speakParagraph = (paragraphIndex: number) => {
    setCurrentSpeechParagraph(paragraphIndex);
    readingState.setCurrentParagraph(paragraphIndex);
    setIsSpeakingCurrentParagraph(true);
    setIsParagraphPaused(false);
    isManuallyStoppedRef.current = false; // Reset manual stop flag for new speech

    speak({
      text: paragraphs[paragraphIndex],
      lang: 'en-US',
      rate: speechRate,
            onEnd: () => {
        setIsSpeakingCurrentParagraph(false);
        setIsParagraphPaused(false);
        setCurrentSpeechParagraph(-1);

        // Check if speech was manually stopped before deciding what to do
        if (!isManuallyStoppedRef.current) {
          // Check repeat mode using ref to get latest value
          if (repeatModeRef.current) {
            // Repeat the same paragraph
            setTimeout(() => {
              speakParagraph(paragraphIndex);
            }, 200);
          } else {
            // Auto-advance to next paragraph
            if (paragraphIndex < paragraphs.length - 1) {
              setTimeout(() => {
                speakParagraph(paragraphIndex + 1);
              }, 200);
            }
          }
        }
      },
      onError: () => {
        setIsSpeakingCurrentParagraph(false);
        setIsParagraphPaused(false);
        setCurrentSpeechParagraph(-1);
      },
    });
  };

  // Per-paragraph control functions
  const handlePlayParagraph = (paragraphIndex: number) => {
    if (!speechSupported) return;

    // Stop current speech if playing
    if (isSpeaking) {
      stop();
    }

    // Auto-enable dim mode if not already enabled
    if (!readingState.dimOthers) {
      setWasDimmedBeforeSpeech(true);
      readingState.setDimOthers(true);
    }

    setSpeechMode(true);

    // Start speaking the specific paragraph
    speakParagraph(paragraphIndex);
  };

  const handleRepeatParagraph = (paragraphIndex: number) => {
    if (!speechSupported) return;

    // Toggle repeat mode
    setRepeatMode(!repeatMode);
  };

  const handlePauseParagraph = (paragraphIndex: number) => {
    if (!speechSupported || !isSpeakingCurrentParagraph || currentSpeechParagraph !== paragraphIndex) return;

    if (isPaused) {
      // Resume from where we left off
      resume();
      setIsParagraphPaused(false);
    } else {
      // Pause at current position
      pause();
      setIsParagraphPaused(true);
    }
  };

  // Speech reading state
  const [speechMode, setSpeechMode] = useState(false);
  const [wasDimmedBeforeSpeech, setWasDimmedBeforeSpeech] = useState(false);
  const [currentSpeechParagraph, setCurrentSpeechParagraph] = useState(-1); // -1 means no paragraph is currently speaking
  const [isSpeakingCurrentParagraph, setIsSpeakingCurrentParagraph] = useState(false);

  // Per-paragraph speech state
  const [isParagraphPaused, setIsParagraphPaused] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false); // Global repeat mode
  const repeatModeRef = useRef(repeatMode); // Ref to store latest repeatMode value
  const isManuallyStoppedRef = useRef(false); // Flag to prevent repeat after manual stop

  // Update ref whenever repeatMode changes
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Sync dontShowConfirmation with sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dontShowParagraphSwitchConfirmation', dontShowConfirmation.toString());
    }
  }, [dontShowConfirmation]);

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

    // Start from current paragraph instead of always resetting to first
    const startParagraph = readingState.currentParagraph;
    setCurrentSpeechParagraph(startParagraph);
    setSpeechMode(true);

    // Calculate text from current paragraph onwards and new boundaries
    const remainingParagraphs = paragraphs.slice(startParagraph);
    const textFromCurrentParagraph = remainingParagraphs.join(' ');

    // Calculate new boundaries for the sliced text
    const newBoundaries: Array<{ start: number; end: number; originalIndex: number; text: string }> = [];
    let charCount = 0;

    remainingParagraphs.forEach((paragraph, index) => {
      const start = charCount;
      const end = charCount + paragraph.length;
      const originalIndex = startParagraph + index;
      newBoundaries.push({ start, end, originalIndex, text: paragraph });
      charCount = end + 1; // +1 for space between paragraphs
    });

    // Start speech with synchronized timing
    speak({
      text: textFromCurrentParagraph,
      lang: 'en-US',
      rate: speechRate,
      onBoundary: (event) => {
        // Check which paragraph is currently being spoken
        const currentCharPosition = event.charIndex;

        // Find current paragraph based on character position in the sliced text
        for (let i = 0; i < newBoundaries.length; i++) {
          const boundary = newBoundaries[i];
          if (currentCharPosition >= boundary.start && currentCharPosition <= boundary.end) {
            const actualParagraphIndex = boundary.originalIndex;
            if (currentSpeechParagraph !== actualParagraphIndex) {
              // Moved to a new paragraph - synchronize scroll
              setCurrentSpeechParagraph(actualParagraphIndex);
              readingState.setCurrentParagraph(actualParagraphIndex);
              setIsSpeakingCurrentParagraph(true);
            }
            break;
          }
        }
      },
      onEnd: () => {
        setSpeechMode(false);
        setCurrentSpeechParagraph(-1);
        setIsSpeakingCurrentParagraph(false);
        // Restore dim state if it was auto-enabled
        if (wasDimmedBeforeSpeech) {
          readingState.setDimOthers(false);
          setWasDimmedBeforeSpeech(false);
        }
      },
      onError: () => {
        setSpeechMode(false);
        setCurrentSpeechParagraph(-1);
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
    isManuallyStoppedRef.current = true; // Set manual stop flag
    stop();
    setSpeechMode(false);
    setCurrentSpeechParagraph(-1);
    setIsSpeakingCurrentParagraph(false);
    stopTimer(); // Also stop the timer
    // Restore dim state when stopped
    if (wasDimmedBeforeSpeech) {
      readingState.setDimOthers(false);
      setWasDimmedBeforeSpeech(false);
    }
  };

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

  // Enhanced paragraph click handler with confirmation dialog
  const handleParagraphClick = (paragraphIndex: number) => {
    // If speech is active, check if we should show confirmation dialog
    if (isSpeaking) {
      if (dontShowConfirmation) {
        // User has chosen not to show confirmation, switch immediately
        stop();
        handlePlayParagraph(paragraphIndex);
      } else {
        // Show confirmation dialog
        setPendingParagraphIndex(paragraphIndex);
        setShowSwitchDialog(true);
      }
    } else {
      // Just change focus if no speech is active
      readingState.setCurrentParagraph(paragraphIndex);
    }
  };

  // Confirm paragraph switch
  const confirmParagraphSwitch = () => {
    if (pendingParagraphIndex !== null) {
      stop(); // Stop current speech
      handlePlayParagraph(pendingParagraphIndex); // Start new paragraph
      setShowSwitchDialog(false);
      setPendingParagraphIndex(null);
    }
  };

  // Cancel paragraph switch
  const cancelParagraphSwitch = () => {
    setShowSwitchDialog(false);
    setPendingParagraphIndex(null);
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
        // Timer controls
        timerEnabled={timerEnabled}
        setTimerEnabled={setTimerEnabled}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
        timerRemaining={timerRemaining}
        timerActive={timerActive}
        formatTimer={formatTimer}
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
        onParagraphPlay={handlePlayParagraph}
        onParagraphRepeat={handleRepeatParagraph}
        onParagraphPause={handlePauseParagraph}
        currentSpeakingParagraph={currentSpeechParagraph}
        isPlaying={isSpeakingCurrentParagraph}
        isPaused={isPaused}
        repeatMode={repeatMode}
        speechSupported={speechSupported}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        open={readingState.shortcutsOpen}
        onOpenChange={readingState.setShortcutsOpen}
      />

      {/* Paragraph Switch Confirmation Dialog */}
      <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Paragraph?</AlertDialogTitle>
            <AlertDialogDescription>
              You are currently listening to a paragraph. Would you like to stop the current audio and switch to the selected paragraph?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Checkbox for "Don't show this again" */}
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="dont-show-again"
              checked={dontShowConfirmation}
              onCheckedChange={(checked) => setDontShowConfirmation(checked as boolean)}
            />
            <label
              htmlFor="dont-show-again"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this again in this session
            </label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelParagraphSwitch}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmParagraphSwitch}>
              Switch Paragraph
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}