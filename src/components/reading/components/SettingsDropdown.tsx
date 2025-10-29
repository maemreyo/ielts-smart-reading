"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  PanelLeft,
  Columns,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Focus,
  Keyboard,
  Eye,
  EyeOff,
  Globe,
  Brain,
  Sun,
  Moon,
  BookOpen
} from "lucide-react";

interface SettingsDropdownProps {
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;
  showAnimations: boolean;
  setShowAnimations: (show: boolean) => void;
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
}

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

export function SettingsDropdown({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  columnCount,
  setColumnCount,
  lineSpacing,
  setLineSpacing,
  showAnimations,
  setShowAnimations,
  // Advanced controls
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
}: SettingsDropdownProps) {

  // Theme options
  const themes = [
    { name: "Light", value: "light", icon: <Sun size={16} /> },
    { name: "Sepia", value: "sepia", icon: <BookOpen size={16} /> },
    { name: "Dark", value: "dark", icon: <Moon size={16} /> }
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-muted"
          title="Settings"
        >
          <Settings size={18} />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Family Settings */}
        <div className="space-y-3 mb-4">
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
        <div className="space-y-3 mb-4">
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
        <div className="space-y-3 mb-4">
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
        <div className="space-y-3 mb-4">
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

        {/* Theme Settings */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium">Theme</label>
          <div className="flex gap-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  theme === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
                title={t.name}
              >
                {React.cloneElement(t.icon, { size: 14 })}
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Reading Modes */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium">Reading Modes</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span className="text-sm">Dim Other Paragraphs</span>
              </div>
              <button
                onClick={() => setDimOthers(!dimOthers)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  dimOthers
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {dimOthers ? "On" : "Off"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Focus size={16} />
                <span className="text-sm">Focus Mode</span>
              </div>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  focusMode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {focusMode ? "On" : "Off"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span className="text-sm">Hide Translations</span>
              </div>
              <button
                onClick={() => setHideTranslations(!hideTranslations)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  hideTranslations
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {hideTranslations ? "On" : "Off"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} />
                <span className="text-sm">Guess Mode</span>
              </div>
              <button
                onClick={() => setGuessMode(!guessMode)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  guessMode
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {guessMode ? "On" : "Off"}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard size={16} />
            <span className="text-sm font-medium">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={toggleShortcuts}
            className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
          >
            Show (Shift + ?)
          </button>
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show Animations</span>
          <Switch
            checked={showAnimations}
            onCheckedChange={setShowAnimations}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}