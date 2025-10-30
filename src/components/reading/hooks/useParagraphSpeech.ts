import { useState, useRef, useCallback } from "react";

interface UseParagraphSpeechProps {
  paragraphs: string[];
  speechRate: number;
  voiceRotation: boolean;
  voiceRotationFavoritesOnly: boolean;
  favoriteVoices: string[];
  speechInstance: {
    isSpeaking: boolean;
    isPaused: boolean;
    speak: (options: any) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    isSupported: boolean;
    getVoicesByLanguage: (lang: string) => SpeechSynthesisVoice[];
    updateSettings: (settings: any) => void;
    settings: {
      voice: SpeechSynthesisVoice | null;
    };
  };
  onParagraphChange?: (paragraphIndex: number) => void;
}

interface UseParagraphSpeechReturn {
  currentSpeakingParagraph: number;
  isPlaying: boolean;
  isPaused: boolean;
  repeatMode: boolean;
  actions: {
    play: (paragraphIndex: number) => void;
    pause: (paragraphIndex: number) => void;
    repeat: (paragraphIndex: number) => void;
    stop: () => void;
    toggleRepeatMode: () => void;
  };
}

export function useParagraphSpeech({
  paragraphs,
  speechRate,
  voiceRotation,
  voiceRotationFavoritesOnly,
  favoriteVoices,
  speechInstance,
  onParagraphChange,
}: UseParagraphSpeechProps): UseParagraphSpeechReturn {
  // State management
  const [currentSpeakingParagraph, setCurrentSpeakingParagraph] = useState(-1); // -1 = no active paragraph
  const [isSpeakingCurrentParagraph, setIsSpeakingCurrentParagraph] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  // Refs for stale closure prevention
  const repeatModeRef = useRef(repeatMode);
  const isManuallyStoppedRef = useRef(false);
  const lastUsedVoiceIndex = useRef(-1);

  // Update ref whenever repeatMode changes
  const updateRepeatModeRef = useCallback(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  // Update ref when repeatMode changes
  updateRepeatModeRef();

  // Function to get a random voice
  const getRandomVoice = useCallback((): SpeechSynthesisVoice | null => {
    let availableVoices: SpeechSynthesisVoice[];

    if (voiceRotationFavoritesOnly && favoriteVoices.length > 0) {
      // Use only favorite voices
      const allEnglishVoices = speechInstance.getVoicesByLanguage('en');
      availableVoices = allEnglishVoices.filter(voice => favoriteVoices.includes(voice.name));
    } else {
      // Use all English voices
      availableVoices = speechInstance.getVoicesByLanguage('en');
    }

    if (availableVoices.length === 0) return null;

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * availableVoices.length);
    } while (randomIndex === lastUsedVoiceIndex.current && availableVoices.length > 1);

    lastUsedVoiceIndex.current = randomIndex;
    return availableVoices[randomIndex];
  }, [voiceRotationFavoritesOnly, favoriteVoices, speechInstance.getVoicesByLanguage]);

  // Core function to speak a paragraph
  const speakParagraph = useCallback((paragraphIndex: number) => {
    if (!speechInstance.isSupported) return;

    setCurrentSpeakingParagraph(paragraphIndex);
    onParagraphChange?.(paragraphIndex);
    setIsSpeakingCurrentParagraph(true);
    isManuallyStoppedRef.current = false; // Reset manual stop flag for new speech

    // Handle voice rotation
    let voiceToUse = speechInstance.settings.voice;
    if (voiceRotation && !voiceToUse) {
      // If rotation is enabled but no voice is selected, pick a random one
      voiceToUse = getRandomVoice();
      if (voiceToUse) {
        speechInstance.updateSettings({ voice: voiceToUse });
      }
    } else if (voiceRotation) {
      // If rotation is enabled and a voice is already selected, pick a new random one
      voiceToUse = getRandomVoice();
      if (voiceToUse) {
        speechInstance.updateSettings({ voice: voiceToUse });
      }
    }

    speechInstance.speak({
      text: paragraphs[paragraphIndex],
      lang: 'en-US',
      rate: speechRate,
      voice: voiceToUse,
      onEnd: () => {
        setIsSpeakingCurrentParagraph(false);
        setCurrentSpeakingParagraph(-1);

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
        setCurrentSpeakingParagraph(-1);
      },
    });
  }, [paragraphs, speechRate, voiceRotation, speechInstance.speak, speechInstance.settings.voice, speechInstance.getVoicesByLanguage, speechInstance.updateSettings, getRandomVoice, onParagraphChange, speechInstance.isSupported]);

  // Play a specific paragraph
  const playParagraph = useCallback((paragraphIndex: number) => {
    if (!speechInstance.isSupported) return;

    // Stop current speech if playing
    if (speechInstance.isSpeaking) {
      speechInstance.stop();
    }

    // Start speaking the specific paragraph
    speakParagraph(paragraphIndex);
  }, [speechInstance.isSpeaking, speechInstance.stop, speakParagraph, speechInstance.isSupported]);

  // Pause/Resume a specific paragraph
  const pauseParagraph = useCallback((paragraphIndex: number) => {
    if (!speechInstance.isSupported || !isSpeakingCurrentParagraph || currentSpeakingParagraph !== paragraphIndex) return;

    if (speechInstance.isPaused) {
      // Resume from where we left off
      speechInstance.resume();
    } else {
      // Pause at current position
      speechInstance.pause();
    }
  }, [speechInstance.isSupported, isSpeakingCurrentParagraph, currentSpeakingParagraph, speechInstance.isPaused, speechInstance.resume, speechInstance.pause]);

  // Toggle repeat mode
  const toggleRepeatMode = useCallback(() => {
    setRepeatMode(prev => !prev);
  }, []);

  // Stop all speech
  const stopAllSpeech = useCallback(() => {
    isManuallyStoppedRef.current = true; // Set manual stop flag
    speechInstance.stop();
    setCurrentSpeakingParagraph(-1);
    setIsSpeakingCurrentParagraph(false);
  }, [speechInstance.stop]);

  // Repeat current paragraph (for backward compatibility)
  const repeatParagraph = useCallback((_paragraphIndex: number) => {
    if (!speechInstance.isSupported) return;
    toggleRepeatMode();
  }, [speechInstance.isSupported, toggleRepeatMode]);

  return {
    currentSpeakingParagraph,
    isPlaying: isSpeakingCurrentParagraph,
    isPaused: speechInstance.isPaused,
    repeatMode,
    actions: {
      play: playParagraph,
      pause: pauseParagraph,
      repeat: repeatParagraph,
      stop: stopAllSpeech,
      toggleRepeatMode,
    },
  };
}