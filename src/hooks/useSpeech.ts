"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

// Types for the speech hook
export interface SpeakOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

export interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
}

export interface SpeechState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentText: string;
  currentCharIndex: number;
}

export interface SpeechControls {
  speak: (options: SpeakOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cancel: () => void;
}

export interface SpeechUtils {
  voices: SpeechSynthesisVoice[];
  getVoicesByLanguage: (lang: string) => SpeechSynthesisVoice[];
  cleanText: (text: string) => string;
  setSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
}

export type UseSpeechReturn = SpeechState & SpeechControls & SpeechUtils & {
  settings: SpeechSettings;
  updateSettings: (settings: Partial<SpeechSettings>) => void;
};

// Default settings
const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  voice: null,
};

// Utility functions
const getSynth = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined') return null;
  return 'speechSynthesis' in window ? window.speechSynthesis : null;
};

const cleanText = (text: string): string => {
  return text
    .replace(/\s*\([^)]*\)/g, '') // Remove text in parentheses
    .replace(/\s*\[[^\]]*\]/g, '') // Remove text in brackets
    .replace(/\s*{[^}]*}/g, '') // Remove text in braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

const isSpeechSynthesisSupported = (): boolean => {
  return getSynth() !== null;
};

export const useSpeech = (defaultSettings?: Partial<SpeechSettings>): UseSpeechReturn => {
  const synth = getSynth();

  // Use localStorage to persist the selected voice name
  const [savedVoiceName, setSavedVoiceName] = useLocalStorage<string | null>('selected-voice-name', null);

  // Merge default settings with user defaults
  const [settings, setSettings] = useState<SpeechSettings>({
    ...DEFAULT_SETTINGS,
    ...defaultSettings,
  });

  // Speech state
  const [state, setState] = useState<SpeechState>({
    isSupported: isSpeechSynthesisSupported(),
    isSpeaking: false,
    isPaused: false,
    isLoading: true,
    currentText: '',
    currentCharIndex: 0,
  });

  // Voices state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs for timers and current utterance
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isInitializedRef = useRef(false);

  // Load voices
  const loadVoices = useCallback(() => {
    if (!synth) return;

    const availableVoices = synth.getVoices();
    setVoices(availableVoices);

    // Auto-select default voice if not set
    if (!settings.voice && availableVoices.length > 0) {
      let selectedVoice: SpeechSynthesisVoice | null = null;

      // First, try to find the saved voice from localStorage
      if (savedVoiceName) {
        selectedVoice = availableVoices.find(v => v.name === savedVoiceName) || null;
      }

      // If no saved voice found, use the default selection logic
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.name === 'Daniel' && v.lang === 'en-GB') ||
                       availableVoices.find(v => v.lang === 'en-GB') ||
                       availableVoices.find(v => v.lang === 'en-US') ||
                       availableVoices.find(v => v.lang.startsWith('en')) ||
                       availableVoices[0];
      }

      if (selectedVoice && !isInitializedRef.current) {
        setSettings(prev => ({ ...prev, voice: selectedVoice }));
        isInitializedRef.current = true;
      }
    }

    setState(prev => ({ ...prev, isLoading: false }));
  }, [synth, settings.voice, savedVoiceName]);

  // Initialize voices
  useEffect(() => {
    if (!synth) return;

    // Load voices immediately
    loadVoices();

    // Listen for voice changes
    const handleVoicesChanged = () => loadVoices();
    synth.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      synth.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [synth, loadVoices]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    // Save voice name to localStorage when voice changes
    if (newSettings.voice) {
      setSavedVoiceName(newSettings.voice.name);
    }
  }, [setSavedVoiceName]);

  // Voice utility functions
  const getVoicesByLanguage = useCallback((lang: string): SpeechSynthesisVoice[] => {
    return voices.filter(voice => voice.lang.startsWith(lang));
  }, [voices]);

  // Sleep timer functions
  const setSleepTimer = useCallback((minutes: number) => {
    clearSleepTimer();

    if (minutes > 0) {
      const ms = minutes * 60 * 1000;
      timerRef.current = setTimeout(() => {
        stop();
      }, ms);
    }
  }, []);

  const clearSleepTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Speech control functions
  const speak = useCallback((options: SpeakOptions) => {
    if (!synth || !state.isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Clean the text
    const cleanedText = cleanText(options.text);
    if (!cleanedText) {
      console.warn('No text to speak after cleaning');
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();
    clearSleepTimer();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    currentUtteranceRef.current = utterance;

    // Configure utterance
    utterance.rate = options.rate ?? settings.rate;
    utterance.pitch = options.pitch ?? settings.pitch;
    utterance.volume = options.volume ?? settings.volume;

    // Set voice with priority and fallback logic
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (settings.voice) {
      utterance.voice = settings.voice;
    } else if (options.lang) {
      const voiceForLang = getVoicesByLanguage(options.lang)[0];
      if (voiceForLang) utterance.voice = voiceForLang;
    } else {
      // Fallback: try to find the best English voice if no voice is set
      const currentVoices = synth.getVoices();
      if (currentVoices.length > 0 && !utterance.voice) {
        const bestEnglishVoice = currentVoices.find(v => v.name === 'Daniel' && v.lang === 'en-GB') ||
                               currentVoices.find(v => v.lang === 'en-GB') ||
                               currentVoices.find(v => v.lang === 'en-US') ||
                               currentVoices.find(v => v.lang.startsWith('en')) ||
                               currentVoices[0];
        if (bestEnglishVoice) {
          utterance.voice = bestEnglishVoice;
        }
      }
    }

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        isSpeaking: true,
        isPaused: false,
        currentText: cleanedText,
        currentCharIndex: 0,
      }));
      options.onStart?.();
    };

    utterance.onend = () => {
      // Use timeout to check if there's pending speech
      setTimeout(() => {
        if (!synth.speaking) {
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            isPaused: false,
            currentText: '',
            currentCharIndex: 0,
          }));
          options.onEnd?.();
        }
      }, 100);
    };

    utterance.onpause = () => {
      setState(prev => ({ ...prev, isPaused: true }));
    };

    utterance.onresume = () => {
      setState(prev => ({ ...prev, isPaused: false }));
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: '',
        currentCharIndex: 0,
      }));
      options.onError?.(error);
    };

    utterance.onboundary = (event) => {
      setState(prev => ({ ...prev, currentCharIndex: event.charIndex }));
      options.onBoundary?.(event);
    };

    // Start speaking
    try {
      synth.speak(utterance);
    } catch (error) {
      console.error('Failed to start speech:', error);
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
      }));
    }
  }, [synth, state.isSupported, settings, getVoicesByLanguage, clearSleepTimer]);

  const pause = useCallback(() => {
    if (!synth || !state.isSpeaking || state.isPaused) return;

    try {
      synth.pause();
    } catch (error) {
      console.error('Failed to pause speech:', error);
    }
  }, [synth, state.isSpeaking, state.isPaused]);

  const resume = useCallback(() => {
    if (!synth || !state.isPaused) return;

    try {
      synth.resume();
    } catch (error) {
      console.error('Failed to resume speech:', error);
    }
  }, [synth, state.isPaused]);

  const stop = useCallback(() => {
    if (!synth) return;

    try {
      synth.cancel();
      clearSleepTimer();
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        currentText: '',
        currentCharIndex: 0,
      }));
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }, [synth, clearSleepTimer]);

  const cancel = useCallback(() => {
    stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSleepTimer();
      if (synth) {
        try {
          synth.cancel();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [clearSleepTimer, synth]);

  return {
    // State
    ...state,
    settings,

    // Controls
    speak,
    pause,
    resume,
    stop,
    cancel,

    // Utils
    voices,
    getVoicesByLanguage,
    cleanText,
    setSleepTimer,
    clearSleepTimer,

    // Settings management
    updateSettings,
  };
};