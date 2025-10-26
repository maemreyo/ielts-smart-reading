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
  AlignJustify
} from "lucide-react";

interface MobileSettingsContentProps {
  readingSpeed: number;
  setReadingSpeed: (speed: number) => void;
  sentimentFilter: string | null;
  setSentimentFilter: (filter: string | null) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  dimOthers: boolean;
  setDimOthers: (dim: boolean) => void;
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

export function MobileSettingsContent({
  readingSpeed,
  setReadingSpeed,
  sentimentFilter,
  setSentimentFilter,
  focusMode,
  setFocusMode,
  dimOthers,
  setDimOthers,
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
  return (
    <div className="space-y-6">
      {/* Reading Speed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reading Speed</label>
          <span className="text-sm text-muted-foreground">{readingSpeed} WPM</span>
        </div>
        <Slider
          value={[readingSpeed]}
          onValueChange={([value]) => setReadingSpeed(value)}
          max={400}
          min={100}
          step={25}
          className="w-full"
        />
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