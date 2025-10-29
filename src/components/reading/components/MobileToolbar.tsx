"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Eye,
  EyeOff,
  Settings,
  Volume2,
  VolumeX
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

  return (
    <div className="md:hidden flex items-center gap-1">
      {/* Unified Speech Control - Only show if speech is supported */}
      {speechSupported ? (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSpeaking ? (isPaused ? onResumeSpeech : onPauseSpeech) : onStartSpeech}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isSpeaking && !isPaused
                ? "bg-orange-500 text-white hover:bg-orange-600" // Speaking
                : isSpeaking && isPaused
                ? "bg-yellow-500 text-white hover:bg-yellow-600" // Paused
                : "bg-green-500 text-white hover:bg-green-600" // Ready to speak
            )}
            title={isSpeaking ? (isPaused ? "Resume Speech (S)" : "Pause Speech (S)") : "Start Speech (S)"}
          >
            {isSpeaking && !isPaused ? (
              <Pause size={16} />
            ) : isSpeaking && isPaused ? (
              <Play size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </motion.button>

          {/* Stop Button - Only show when speaking */}
          {isSpeaking && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStopSpeech}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              title="Stop Speech (Shift+S)"
            >
              <VolumeX size={16} />
            </motion.button>
          )}
        </>
      ) : (
        // Fallback for non-speech-supported browsers (original auto-scroll)
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? stopAutoScroll : startAutoScroll}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isPlaying
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          )}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
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