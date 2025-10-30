"use client";

import React from "react";
import { Volume2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
  favoriteVoices: string[];
  onToggleFavorite: (voiceName: string) => void;
  className?: string;
}

export function VoiceSelection({
  voices,
  currentVoice,
  onVoiceChange,
  favoriteVoices = [],
  onToggleFavorite,
  className,
}: VoiceSelectionProps) {
  // Filter for English voices only
  const englishVoices = React.useMemo(() => {
    return voices.filter(voice => voice.lang.startsWith('en'));
  }, [voices]);

  // Separate favorites and non-favorites
  const { favorites, nonFavorites } = React.useMemo(() => {
    const favs: SpeechSynthesisVoice[] = [];
    const nonFavs: SpeechSynthesisVoice[] = [];

    englishVoices.forEach(voice => {
      if (favoriteVoices?.includes(voice.name)) {
        favs.push(voice);
      } else {
        nonFavs.push(voice);
      }
    });

    return { favorites: favs, nonFavorites: nonFavs };
  }, [englishVoices, favoriteVoices]);

  // Group voices by language for better organization
  const groupVoicesByLanguage = (voiceList: SpeechSynthesisVoice[]) => {
    const groups: { [key: string]: SpeechSynthesisVoice[] } = {};

    voiceList.forEach(voice => {
      const langKey = voice.lang;
      if (!groups[langKey]) {
        groups[langKey] = [];
      }
      groups[langKey].push(voice);
    });

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
        const preferredNames = ['Daniel', 'Karen', 'Alex', 'Samantha', 'Karen', 'Moira'];
        const aPreferred = preferredNames.includes(a.name) ? 0 : 1;
        const bPreferred = preferredNames.includes(b.name) ? 0 : 1;

        if (aPreferred !== bPreferred) {
          return aPreferred - bPreferred;
        }

        return a.name.localeCompare(b.name);
      }),
    }));
  };

  const favoriteGroups = React.useMemo(() => groupVoicesByLanguage(favorites), [favorites]);
  const nonFavoriteGroups = React.useMemo(() => groupVoicesByLanguage(nonFavorites), [nonFavorites]);

  const currentVoiceName = currentVoice?.name || "";

  const formatVoiceLabel = (voice: SpeechSynthesisVoice) => {
    const displayName = voice.name.split(' ')[0];
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

  const isFavorite = (voiceName: string) => favoriteVoices.includes(voiceName);

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
                {isFavorite(currentVoice.name) && (
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                )}
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
        <SelectContent className="max-h-[400px]">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-500 uppercase tracking-wide flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-yellow-500" />
                Favorites
              </div>
              {favoriteGroups.map((group) => (
                <div key={`fav-${group.language}`}>
                  <div className="px-6 py-1 text-xs font-medium text-muted-foreground">
                    {getLanguageDisplayName(group.language)}
                  </div>
                  {group.voices.map((voice) => (
                    <div className="relative group/item">
                      <SelectItem
                        key={`fav-${voice.name}`}
                        value={voice.name}
                        className="group"
                      >
                        <div className="flex items-center justify-between w-full gap-2 pr-8">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>{formatVoiceLabel(voice)}</span>
                            <span className="text-xs text-muted-foreground">
                              {voice.lang}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleFavorite(voice.name);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-muted rounded z-10 bg-background"
                        title="Remove from favorites"
                      >
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <div className="h-px bg-border my-2" />
            </>
          )}

          {/* All Other Voices Section */}
          {nonFavorites.length > 0 && (
            <>
              {favorites.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  All Voices
                </div>
              )}
              {nonFavoriteGroups.map((group) => (
                <div key={group.language}>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {getLanguageDisplayName(group.language)}
                  </div>
                  {group.voices.map((voice) => (
                    <div className="relative group/item">
                      <SelectItem
                        key={voice.name}
                        value={voice.name}
                        className="group"
                      >
                        <div className="flex items-center justify-between w-full gap-2 pr-8">
                          <div className="flex items-center gap-2">
                            <span>{formatVoiceLabel(voice)}</span>
                            <span className="text-xs text-muted-foreground">
                              {voice.lang}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleFavorite(voice.name);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-muted rounded z-10 bg-background"
                        title="Add to favorites"
                      >
                        <Star className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {/* {currentVoice && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Currently using: {currentVoice.name} ({currentVoice.lang})</span>
          <button
            onClick={() => onToggleFavorite(currentVoice.name)}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              isFavorite(currentVoice.name) && "text-yellow-500"
            )}
            title={isFavorite(currentVoice.name) ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                isFavorite(currentVoice.name) && "fill-yellow-500"
              )}
            />
          </button>
        </div>
      )} */}
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