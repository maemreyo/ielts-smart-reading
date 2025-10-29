"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  Sun,
  Moon,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Smile,
  Frown,
  Meh,
  Heart,
  Eye,
  EyeOff,
  Focus,
  Globe,
  Brain,
  Keyboard,
  Volume2,
  VolumeX,
  Zap, // Using Zap for the main play button
} from "lucide-react";

interface DesktopToolbarProps {
  // Theme
  theme: string;
  setTheme: (theme: string) => void;

  // Reading controls
  isPlaying: boolean;
  startAutoScroll: () => void;
  stopAutoScroll: () => void;
  resetReading: () => void;
  readingSpeed: number;
  setReadingSpeed: (speed: number) => void;

  // Speech controls
  speechSupported: boolean;
  speechMode: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  onStartSpeech: () => void;
  onPauseSpeech: () => void;
  onResumeSpeech: () => void;
  onStopSpeech: () => void;

  // View modes
  sentimentFilter: string | null;
  setSentimentFilter: (filter: string | null) => void;
  dimOthers: boolean;
  setDimOthers: (dim: boolean) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  hideTranslations: boolean;
  setHideTranslations: (hide: boolean) => void;
  guessMode: boolean;
  setGuessMode: (guess: boolean) => void;

  // UI
  toggleShortcuts: () => void;
}

const sentimentFilters = [
  { name: "All", value: null, icon: <Heart size={18} />, color: "" },
  { name: "Positive", value: "positive", icon: <Smile size={18} />, color: "text-green-600" },
  { name: "Negative", value: "negative", icon: <Frown size={18} />, color: "text-red-600" },
  { name: "Neutral", value: "neutral", icon: <Meh size={18} />, color: "text-gray-600" }
];

export function DesktopToolbar({
  theme,
  setTheme,
  isPlaying,
  startAutoScroll,
  stopAutoScroll,
  resetReading,
  readingSpeed,
  setReadingSpeed,
  // Speech controls
  speechSupported,
  speechMode,
  isSpeaking,
  isPaused,
  onStartSpeech,
  onPauseSpeech,
  onResumeSpeech,
  onStopSpeech,
  sentimentFilter,
  setSentimentFilter,
  dimOthers,
  setDimOthers,
  focusMode,
  setFocusMode,
  hideTranslations,
  setHideTranslations,
  guessMode,
  setGuessMode,
  toggleShortcuts,
}: DesktopToolbarProps) {
  return (
    <div className="hidden md:flex items-center gap-3 flex-wrap">
      {/* Theme Controls */}
      <div className="flex items-center gap-1">
        {[
          { theme: "light", icon: <Sun size={18} />, title: "Light (1)" },
          { theme: "sepia", icon: <BookOpen size={18} />, title: "Sepia (2)" },
          { theme: "dark", icon: <Moon size={18} />, title: "Dark (3)" },
        ].map(({ theme: t, icon, title }) => (
          <motion.button
            key={t}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(t)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === t
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            title={title}
          >
            {icon}
          </motion.button>
        ))}
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Reading Controls */}
      <div className="flex items-center gap-1">
        {/* Unified Play/Pause Button */}
        {speechSupported ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSpeaking ? (isPaused ? onResumeSpeech : onPauseSpeech) : onStartSpeech}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isSpeaking && !isPaused
                ? "bg-orange-500 text-white hover:bg-orange-600" // Speaking
                : "bg-green-500 text-white hover:bg-green-600" // Paused or stopped
            )}
            title={isSpeaking ? (isPaused ? "Resume (S)" : "Pause (S)") : "Read Aloud (S)"}
          >
            {isSpeaking && !isPaused ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        ) : (
          // Fallback for non-speech-supported browsers (original auto-scroll)
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
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        )}

        {isSpeaking && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopSpeech}
            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            title="Stop (Shift+S)"
          >
            <VolumeX size={18} />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetReading}
          className="p-2 rounded-lg hover:bg-muted"
          title="Reset (Esc)"
        >
          <RotateCcw size={18} />
        </motion.button>
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Reading Speed Control */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-xs">WPM</span>
        <Slider
          value={[readingSpeed]}
          onValueChange={([value]) => setReadingSpeed(value)}
          max={400}
          min={100}
          step={25}
          className="flex-1"
        />
        <span className="text-xs w-8">{readingSpeed}</span>
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Sentiment Controls */}
      <div className="flex items-center gap-1">
        {sentimentFilters.map((filter) => (
          <motion.button
            key={filter.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSentimentFilter(filter.value)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              sentimentFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : `hover:bg-muted ${filter.color}`
            )}
            title={`${filter.name} sentiment (${filter.name
              .charAt(0)
              .toUpperCase()})`}
          >
            {filter.icon}
          </motion.button>
        ))}
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Advanced Controls */}
      <div className="flex items-center gap-1">
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
          {dimOthers ? <EyeOff size={18} /> : <Eye size={18} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFocusMode(!focusMode)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            focusMode
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          title="Focus Mode (F)"
        >
          <Focus size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setHideTranslations(!hideTranslations)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            hideTranslations
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          title="Hide Vietnamese translations (T)"
        >
          {hideTranslations ? <EyeOff size={18} /> : <Globe size={18} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setGuessMode(!guessMode)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            guessMode
              ? "bg-blue-500 text-white"
              : "hover:bg-muted"
          )}
          title="Guess Mode (G)"
        >
          <Brain size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleShortcuts}
          className="p-2 rounded-lg hover:bg-muted"
          title="Shortcuts (Shift + ?)"
        >
          <Keyboard size={18} />
        </motion.button>
      </div>
    </div>
  );
}