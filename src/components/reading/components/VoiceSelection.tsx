"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceSelectionProps {
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voiceName: string) => void;
  className?: string;
}

export function VoiceSelection({
  voices,
  currentVoice,
  onVoiceChange,
  className,
}: VoiceSelectionProps) {
  // Filter for English voices only
  const englishVoices = React.useMemo(() => {
    return voices.filter(voice => voice.lang.startsWith('en'));
  }, [voices]);

  // Group voices by language for better organization
  const groupedVoices = React.useMemo(() => {
    const groups: { [key: string]: SpeechSynthesisVoice[] } = {};

    englishVoices.forEach(voice => {
      const langKey = voice.lang; // e.g., "en-US", "en-GB", "en-AU"
      if (!groups[langKey]) {
        groups[langKey] = [];
      }
      groups[langKey].push(voice);
    });

    // Sort languages: en-GB, en-US, then others alphabetically
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const priority = { 'en-GB': 0, 'en-US': 1 };
      const aPriority = priority[a as keyof typeof priority] ?? 2;
      const bPriority = priority[b as keyof typeof priority] ?? 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return a.localeCompare(b);
    });

    return sortedKeys.map(lang => ({
      language: lang,
      voices: groups[lang].sort((a, b) => {
        // Put preferred voices first within each language group
        const preferredNames = ['Daniel', 'Karen', 'Alex', 'Samantha', 'Karen', 'Moira'];
        const aPreferred = preferredNames.includes(a.name) ? 0 : 1;
        const bPreferred = preferredNames.includes(b.name) ? 0 : 1;

        if (aPreferred !== bPreferred) {
          return aPreferred - bPreferred;
        }

        return a.name.localeCompare(b.name);
      }),
    }));
  }, [englishVoices]);

  const currentVoiceName = currentVoice?.name || "";

  const formatVoiceLabel = (voice: SpeechSynthesisVoice) => {
    // Create a user-friendly label
    const displayName = voice.name.split(' ')[0]; // Use first name only for brevity
    const countryFlag = getCountryFlag(voice.lang);
    return `${displayName} ${countryFlag}`;
  };

  const getCountryFlag = (lang: string): string => {
    const flags: { [key: string]: string } = {
      'en-GB': '🇬🇧',
      'en-US': '🇺🇸',
      'en-AU': '🇦🇺',
      'en-CA': '🇨🇦',
      'en-IE': '🇮🇪',
      'en-ZA': '🇿🇦',
      'en-IN': '🇮🇳',
    };
    return flags[lang] || '🌍';
  };

  if (englishVoices.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No English voices available
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Volume2 className="h-4 w-4" />
        Voice Selection
      </div>
      <Select
        value={currentVoiceName}
        onValueChange={onVoiceChange}
        disabled={englishVoices.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice">
            {currentVoice ? (
              <div className="flex items-center gap-2">
                <span>{formatVoiceLabel(currentVoice)}</span>
                <span className="text-xs text-muted-foreground">
                  ({currentVoice.lang})
                </span>
              </div>
            ) : (
              "Select voice"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {groupedVoices.map((group) => (
            <div key={group.language}>
              {/* Language group separator */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getLanguageDisplayName(group.language)}
              </div>
              {group.voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  <div className="flex items-center gap-2">
                    <span>{formatVoiceLabel(voice)}</span>
                    <span className="text-xs text-muted-foreground">
                      {voice.lang}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      {currentVoice && (
        <div className="text-xs text-muted-foreground">
          Currently using: {currentVoice.name} ({currentVoice.lang})
        </div>
      )}
    </div>
  );
}

function getLanguageDisplayName(lang: string): string {
  const displayNames: { [key: string]: string } = {
    'en-GB': 'British English',
    'en-US': 'American English',
    'en-AU': 'Australian English',
    'en-CA': 'Canadian English',
    'en-IE': 'Irish English',
    'en-ZA': 'South African English',
    'en-IN': 'Indian English',
  };
  return displayNames[lang] || lang;
}