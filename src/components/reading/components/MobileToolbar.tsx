"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  BookOpen,
  Play,
  Pause,
  Eye,
  EyeOff,
  Globe,
  Brain,
  Settings,
  Volume2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MobileSettingsContent } from "./MobileSettingsContent";

interface MobileToolbarProps {
  // Theme
  theme: string;
  setTheme: (theme: string) => void;

  // Reading controls
  isPlaying: boolean;
  startAutoScroll: () => void;
  stopAutoScroll: () => void;

  // Speech controls
  speechSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  onStartSpeech: () => void;
  onPauseSpeech: () => void;
  onResumeSpeech: () => void;
  onStopSpeech: () => void;

  // View modes
  hideTranslations: boolean;
  setHideTranslations: (hide: boolean) => void;
  guessMode: boolean;
  setGuessMode: (guess: boolean) => void;

  // Advanced controls moved from main toolbar
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  toggleShortcuts: () => void;
  dimOthers: boolean;
  setDimOthers: (dim: boolean) => void;

  // Settings props (for mobile dropdown)
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  sentimentFilter: string | null;
  setSentimentFilter: (filter: string | null) => void;
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

export function MobileToolbar({
  theme,
  setTheme,
  isPlaying,
  startAutoScroll,
  stopAutoScroll,
  // Speech controls
  speechSupported,
  isSpeaking,
  isPaused,
  onStartSpeech,
  onPauseSpeech,
  onResumeSpeech,
  onStopSpeech,
  hideTranslations,
  setHideTranslations,
  guessMode,
  setGuessMode,
  // Advanced controls moved from main toolbar
  focusMode,
  setFocusMode,
  toggleShortcuts,
  dimOthers,
  setDimOthers,
  // Settings props (for mobile dropdown)
  speechRate,
  setSpeechRate,
  sentimentFilter,
  setSentimentFilter,
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
}: MobileToolbarProps) {
  const handleThemeToggle = () => {
    const themes = ["light", "sepia", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <div className="md:hidden flex items-center gap-1">
      {/* Play/Pause */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isPlaying ? stopAutoScroll : startAutoScroll}
        className={cn(
          "p-2 rounded-lg transition-colors",
          isPlaying
            ? "bg-red-500 text-white"
            : "bg-green-500 text-white hover:bg-green-600"
        )}
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </motion.button>

      {/* Speech Controls */}
      {speechSupported && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isSpeaking ? (isPaused ? onResumeSpeech : onPauseSpeech) : onStartSpeech}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isSpeaking
              ? "bg-orange-500 text-white"
              : "bg-gray-500 text-white"
          )}
          title={
            isSpeaking
              ? isPaused
                ? "Resume Speech"
                : "Pause Speech"
              : "Start Speech"
          }
        >
          {isSpeaking ? (
            isPaused ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )
          ) : (
            <Volume2 size={16} />
          )}
        </motion.button>
      )}

          {/* Dim Others toggle - Kept as essential control */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDimOthers(!dimOthers)}
        className={cn(
          "p-2 rounded-lg transition-colors",
          dimOthers
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
        title="Dim other paragraphs (D)"
      >
        {dimOthers ? <EyeOff size={16} /> : <Eye size={16} />}
      </motion.button>

      {/* Mobile Settings Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-muted"
            title="Settings"
          >
            <Settings size={16} />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-4 max-h-[80vh] overflow-y-auto">
          <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <MobileSettingsContent
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            sentimentFilter={sentimentFilter}
            setSentimentFilter={setSentimentFilter}
            // Advanced controls moved from main toolbar
            theme={theme}
            setTheme={setTheme}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            toggleShortcuts={toggleShortcuts}
            dimOthers={dimOthers}
            setDimOthers={setDimOthers}
            hideTranslations={hideTranslations}
            setHideTranslations={setHideTranslations}
            guessMode={guessMode}
            setGuessMode={setGuessMode}
            showAnimations={showAnimations}
            setShowAnimations={setShowAnimations}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            columnCount={columnCount}
            setColumnCount={setColumnCount}
            lineSpacing={lineSpacing}
            setLineSpacing={setLineSpacing}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}