"use client";

import React, { useState, useMemo } from 'react';
import { Button } from './button';
import { Volume2, VolumeX, Play, Pause, Square, Settings, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeech, type UseSpeechReturn } from '@/hooks/use-speech';

interface SpeechControlsProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'standard' | 'full';
  defaultLanguage?: string;
  autoPlay?: boolean;
  showSleepTimer?: boolean;
  onWordHighlight?: (index: number, word: string) => void;
}

export function SpeechControls({
  text,
  className,
  size = 'md',
  variant = 'standard',
  defaultLanguage = 'en',
  autoPlay = false,
  showSleepTimer = false,
  onWordHighlight,
}: SpeechControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);

  const speech = useSpeech({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });

  const {
    isSupported,
    isSpeaking,
    isPaused,
    isLoading,
    settings,
    voices,
    getVoicesByLanguage,
    speak,
    pause,
    resume,
    stop,
    setSleepTimer,
    clearSleepTimer,
    updateSettings,
  } = speech;

  // Filter voices by language
  const availableVoices = useMemo(() => {
    if (defaultLanguage === 'en') {
      return voices.filter(v => v.lang.startsWith('en'));
    } else if (defaultLanguage === 'vi') {
      return voices.filter(v => v.lang.startsWith('vi'));
    }
    return voices;
  }, [voices, defaultLanguage]);

  // Size classes (mapping to Button component sizes)
  const sizeClasses = {
    sm: 'text-xs px-2',
    md: 'text-sm px-3',
    lg: 'text-base px-4',
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPaused) {
      resume();
    } else {
      speak({
        text,
        onStart: () => {
          if (autoPlay) {
            // Auto-play logic here if needed
          }
        },
        onBoundary: (event) => {
          if (onWordHighlight) {
            // Get the current word based on char index
            const words = text.substring(0, event.charIndex).split(/\s+/);
            const currentWord = words[words.length - 1] || '';
            onWordHighlight(event.charIndex, currentWord);
          }
        },
      });
    }
  };

  // Handle sleep timer
  const handleSleepTimerChange = (minutes: number) => {
    setSleepMinutes(minutes);
    if (minutes > 0) {
      setSleepTimer(minutes);
    } else {
      clearSleepTimer();
    }
  };

  if (!isSupported) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Speech not supported in this browser
      </div>
    );
  }

  // Minimal variant - just play/pause button
  if (variant === 'minimal') {
    return (
      <Button
        size={size === 'md' ? 'default' : size}
        variant="ghost"
        onClick={handlePlayPause}
        disabled={isLoading || !text}
        className={cn(sizeClasses[size], className)}
      >
        {isSpeaking ? (
          isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main controls */}
      <div className="flex items-center gap-2">
        <Button
          size={size === 'md' ? 'default' : size}
          onClick={handlePlayPause}
          disabled={isLoading || !text}
          className={cn(sizeClasses[size])}
        >
          {isSpeaking ? (
            isPaused ? (
              <>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            )
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-1" />
              Play
            </>
          )}
        </Button>

        {(isSpeaking || isPaused) && (
          <Button
            size={size === 'md' ? 'default' : size}
            variant="outline"
            onClick={stop}
            className={cn(sizeClasses[size])}
          >
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        )}

        {variant === 'full' && (
          <Button
            size={size === 'md' ? 'default' : size}
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(sizeClasses[size])}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && variant === 'full' && (
        <div className="p-4 border rounded-lg space-y-4">
          {/* Voice selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Voice</label>
            <select
              value={settings.voice?.name || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.name === e.target.value);
                if (voice) updateSettings({ voice });
              }}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">Auto-select</option>
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate control */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Speed: {settings.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Pitch control */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Pitch: {settings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Volume control */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Sleep timer */}
          {showSleepTimer && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Sleep Timer (minutes, 0 = off)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={sleepMinutes}
                onChange={(e) => handleSleepTimerChange(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {isLoading && (
        <div className="text-xs text-muted-foreground">
          Loading voices...
        </div>
      )}
    </div>
  );
}