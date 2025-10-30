"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { SpeechControls } from './speech-controls';
import { SpeechHighlightedText } from './speech-highlighted-text';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';

interface SpeechPlayerProps {
  title?: string;
  text: string;
  className?: string;
  variant?: 'compact' | 'standard' | 'detailed';
  defaultLanguage?: 'en' | 'vi' | 'auto';
  autoHighlight?: boolean;
  showText?: boolean;
  showSettings?: boolean;
  showSleepTimer?: boolean;
}

export function SpeechPlayer({
  title = "Text to Speech",
  text,
  className,
  variant = 'standard',
  defaultLanguage = 'en',
  autoHighlight = true,
  showText = true,
  showSettings = true,
  showSleepTimer = false,
}: SpeechPlayerProps) {
  const [currentWord, setCurrentWord] = useState({ index: 0, word: '' });

  const speech = useSpeech({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });

  const {
    isSpeaking,
    isPaused,
    currentCharIndex,
    settings,
    voices,
    getVoicesByLanguage,
    updateSettings,
  } = speech;

  // Get language voices for display and filter English voices
  const allowedVoices = ["Daniel", "Karen", "Rishi", "Tessa", "Moira"];
  const languageVoices = defaultLanguage === 'auto'
    ? voices
    : (() => {
        const langVoices = getVoicesByLanguage(defaultLanguage === 'en' ? 'en' : 'vi');
        if (defaultLanguage === 'en') {
          return langVoices.filter(voice =>
            allowedVoices.some(allowedName => voice.name.includes(allowedName))
          );
        }
        return langVoices;
      })();

  const handleWordHighlight = (index: number, word: string) => {
    if (autoHighlight) {
      setCurrentWord({ index, word });
    }
  };

  // Variant-specific rendering
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        {title && (
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        )}
        <SpeechControls
          text={text}
          variant="minimal"
          size="sm"
          defaultLanguage={defaultLanguage}
          onWordHighlight={autoHighlight ? handleWordHighlight : undefined}
        />
        {showText && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {text}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          {title}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSpeaking && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {isPaused ? 'Paused' : 'Speaking...'}
              </span>
            )}
            {currentWord.word && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                "{currentWord.word}"
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Text display with highlighting */}
        {showText && (
          <div className="min-h-[100px] p-4 bg-muted/30 rounded-lg">
            <SpeechHighlightedText
              text={text}
              currentCharIndex={currentCharIndex}
              isSpeaking={isSpeaking}
              className="text-base leading-relaxed"
            />
          </div>
        )}

        {/* Speech controls */}
        <SpeechControls
          text={text}
          variant={showSettings ? "full" : "standard"}
          defaultLanguage={defaultLanguage}
          showSleepTimer={showSleepTimer}
          onWordHighlight={autoHighlight ? handleWordHighlight : undefined}
        />

        {/* Detailed information */}
        {variant === 'detailed' && (
          <div className="space-y-3 pt-3 border-t">
            {/* Voice info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Voice:</span>
              <span className="font-medium">
                {settings.voice?.name || 'Auto-select'}
                {settings.voice && (
                  <span className="text-muted-foreground ml-1">
                    ({settings.voice.lang})
                  </span>
                )}
              </span>
            </div>

            {/* Available voices count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Voices:</span>
              <span className="font-medium">
                {languageVoices.length} {defaultLanguage === 'en' ? 'English' : defaultLanguage === 'vi' ? 'Vietnamese' : ''} voices
              </span>
            </div>

            {/* Current settings */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">Speed</div>
                <div className="font-medium">{settings.rate.toFixed(1)}x</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Pitch</div>
                <div className="font-medium">{settings.pitch.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Volume</div>
                <div className="font-medium">{Math.round(settings.volume * 100)}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured variants for common use cases
export function EnglishSpeechPlayer(props: Omit<SpeechPlayerProps, 'defaultLanguage'>) {
  return <SpeechPlayer {...props} defaultLanguage="en" />;
}

export function VietnameseSpeechPlayer(props: Omit<SpeechPlayerProps, 'defaultLanguage'>) {
  return <SpeechPlayer {...props} defaultLanguage="vi" />;
}

export function CompactSpeechPlayer(props: Omit<SpeechPlayerProps, 'variant'>) {
  return <SpeechPlayer {...props} variant="compact" />;
}

// Hook-based usage example
export function useSpeechPlayer(text: string) {
  const speech = useSpeech({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });

  const speak = () => {
    speech.speak({ text });
  };

  const pause = () => {
    speech.pause();
  };

  const resume = () => {
    speech.resume();
  };

  const stop = () => {
    speech.stop();
  };

  return {
    ...speech,
    speak,
    pause,
    resume,
    stop,
  };
}