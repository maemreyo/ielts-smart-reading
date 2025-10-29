"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Smile,
  Frown,
  Meh,
  Heart,
  PanelLeft,
  Columns,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Sun,
  Moon,
  BookOpen,
  Focus,
  Keyboard,
  Eye,
  EyeOff,
  Globe,
  Brain,
  Turtle,
  Rabbit,
  Zap,
  Gauge
} from "lucide-react";

interface MobileSettingsContentProps {
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  sentimentFilter: string | null;
  setSentimentFilter: (filter: string | null) => void;
  // Advanced controls moved from main toolbar
  theme: string;
  setTheme: (theme: string) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  toggleShortcuts: () => void;
  dimOthers: boolean;
  setDimOthers: (dim: boolean) => void;
  hideTranslations: boolean;
  setHideTranslations: (hide: boolean) => void;
  guessMode: boolean;
  setGuessMode: (guess: boolean) => void;
  showAnimations: boolean;
  setShowAnimations: (show: boolean) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
}

const sentimentFilters = [
  { name: "All", value: null, icon: <Heart size={16} />, color: "" },
  { name: "Positive", value: "positive", icon: <Smile size={16} />, color: "text-green-600" },
  { name: "Negative", value: "negative", icon: <Frown size={16} />, color: "text-red-600" },
  { name: "Neutral", value: "neutral", icon: <Meh size={16} />, color: "text-gray-600" }
];

const fontFamilies = [
  { name: "Serif", class: "font-serif" },
  { name: "Sans", class: "font-sans" },
  { name: "Mono", class: "font-mono" }
];

const lineSpacings = [
  { name: "Tight", class: "leading-tight", icon: <AlignLeft size={16} /> },
  { name: "Normal", class: "leading-normal", icon: <AlignCenter size={16} /> },
  { name: "Relaxed", class: "leading-relaxed", icon: <AlignJustify size={16} /> }
];

// Speech rate presets for mobile - stacked layout
const speechRatePresetsMobile = [
  { name: "Slow", rate: 0.85, icon: <Turtle size={16} /> },
  { name: "Normal", rate: 1.00, icon: <Gauge size={16} /> },
  { name: "Fast", rate: 1.15, icon: <Rabbit size={16} /> }
];

// Function to cycle through speech rate presets for mobile
const cycleSpeechRatePresetMobile = (currentRate: number, setRate: (rate: number) => void) => {
  const currentIndex = speechRatePresetsMobile.findIndex(p => p.rate === currentRate);
  const nextIndex = (currentIndex + 1) % speechRatePresetsMobile.length;
  setRate(speechRatePresetsMobile[nextIndex].rate);
};

export function MobileSettingsContent({
  speechRate,
  setSpeechRate,
  sentimentFilter,
  setSentimentFilter,
  // Advanced controls moved from main toolbar
  theme,
  setTheme,
  focusMode,
  setFocusMode,
  toggleShortcuts,
  dimOthers,
  setDimOthers,
  hideTranslations,
  setHideTranslations,
  guessMode,
  setGuessMode,
  showAnimations,
  setShowAnimations,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  columnCount,
  setColumnCount,
  lineSpacing,
  setLineSpacing,
}: MobileSettingsContentProps) {
  // Get current speech rate preset info for mobile
  const currentSpeechRatePresetMobile = speechRatePresetsMobile.find(p => p.rate === speechRate) || speechRatePresetsMobile[0];

  return (
    <div className="space-y-6">
      {/* Speech Rate */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Speech Rate</label>
          <span className="text-sm text-muted-foreground">{speechRate.toFixed(2)}x</span>
        </div>
        <Slider
          value={[speechRate]}
          onValueChange={([value]) => setSpeechRate(value)}
          max={2.0}
          min={0.5}
          step={0.05}
          className="w-full"
        />

        {/* Speech Rate Presets - Stacked Layout */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Rate Presets</label>
          <button
            onClick={() => cycleSpeechRatePresetMobile(speechRate, setSpeechRate)}
            className={cn(
              "w-full p-3 rounded-md transition-colors flex flex-col items-center gap-2",
              speechRate === currentSpeechRatePresetMobile.rate
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            title={`${currentSpeechRatePresetMobile.name} Speech Rate (${currentSpeechRatePresetMobile.rate}x) - Click to cycle`}
          >
            {currentSpeechRatePresetMobile.icon}
            <span className="text-sm font-medium">{currentSpeechRatePresetMobile.name}</span>
            <span className="text-xs opacity-75">{currentSpeechRatePresetMobile.rate}x</span>
          </button>
        </div>
      </div>

      {/* Sentiment Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Sentiment Filter</label>
        <div className="grid grid-cols-2 gap-2">
          {sentimentFilters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setSentimentFilter(filter.value)}
              className={cn(
                "p-2 rounded-md transition-colors flex items-center gap-2 text-sm",
                sentimentFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : `bg-muted hover:bg-muted/80 ${filter.color}`
              )}
            >
              {React.cloneElement(filter.icon, { size: 16 })}
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Advanced Options</label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Focus Mode</span>
            <Switch
              checked={focusMode}
              onCheckedChange={setFocusMode}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dim Other Paragraphs</span>
            <Switch
              checked={dimOthers}
              onCheckedChange={setDimOthers}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Animations</span>
            <Switch
              checked={showAnimations}
              onCheckedChange={setShowAnimations}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4" />

      {/* Font Family Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Font Family</label>
        <div className="flex gap-1">
          {fontFamilies.map((font) => (
            <button
              key={font.name}
              onClick={() => setFontFamily(font.class)}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                fontFamily === font.class
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Font Size</label>
          <span className="text-sm text-muted-foreground">
            {fontSize}px
          </span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={([value]) => setFontSize(value)}
          max={40}
          min={16}
          step={2}
          className="w-full"
        />
      </div>

      {/* Column Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Columns</label>
        <div className="flex gap-1">
          <button
            onClick={() => setColumnCount(1)}
            className={cn(
              "p-2 rounded-md transition-colors",
              columnCount === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            title="1 Column"
          >
            <PanelLeft size={16} />
          </button>
          <button
            onClick={() => setColumnCount(2)}
            className={cn(
              "p-2 rounded-md transition-colors",
              columnCount === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            title="2 Columns"
          >
            <Columns size={16} />
          </button>
          <button
            onClick={() => setColumnCount(3)}
            className={cn(
              "p-2 rounded-md transition-colors",
              columnCount === 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            title="3 Columns"
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Line Spacing Settings */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Line Spacing</label>
        <div className="flex gap-1">
          {lineSpacings.map((spacing) => (
            <button
              key={spacing.name}
              onClick={() => setLineSpacing(spacing.class)}
              className={cn(
                "p-2 rounded-md transition-colors",
                lineSpacing === spacing.class
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
              title={spacing.name}
            >
              {React.cloneElement(spacing.icon, { size: 16 })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}