"use client";

import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Smile,
  Frown,
  Meh,
  Heart,
  Eye,
  EyeOff,
  VolumeX,
  Volume2,
  Turtle,
  Rabbit,
  Gauge,
  Clock,
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
  speechRate: number;
  setSpeechRate: (rate: number) => void;

  // Timer controls
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  timerRemaining: number;
  timerActive: boolean;
  formatTimer: (seconds: number) => string;

  // Speech controls
  speechSupported: boolean;
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
  { name: "All", value: null, icon: <Heart size={18} />, color: "", colorClass: "bg-muted" },
  { name: "Positive", value: "positive", icon: <Smile size={18} />, color: "text-green-600", colorClass: "bg-green-500" },
  { name: "Negative", value: "negative", icon: <Frown size={18} />, color: "text-red-600", colorClass: "bg-red-500" },
  { name: "Neutral", value: "neutral", icon: <Meh size={18} />, color: "text-gray-600", colorClass: "bg-gray-500" }
];


// Speech rate presets
const speechRatePresets = [
  { name: "Very Slow", rate: 0.65, icon: <Turtle size={14} /> },
  { name: "Slow", rate: 0.75, icon: <Turtle size={16} /> },
  { name: "Normal", rate: 0.85, icon: <Gauge size={14} /> },
  { name: "Standard", rate: 0.95, icon: <Gauge size={16} /> },
  { name: "Fast", rate: 1.05, icon: <Rabbit size={14} /> },
  { name: "Very Fast", rate: 1.15, icon: <Rabbit size={16} /> }
];

export function DesktopToolbar({
  isPlaying,
  startAutoScroll,
  stopAutoScroll,
  resetReading,
  speechRate,
  setSpeechRate,
  // Timer controls
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  timerRemaining,
  timerActive,
  formatTimer,
  // Speech controls
  speechSupported,
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
}: DesktopToolbarProps) {

  // Function to cycle through sentiment filters
  const cycleSentimentFilter = () => {
    const currentIndex = sentimentFilters.findIndex(f => f.value === sentimentFilter);
    const nextIndex = (currentIndex + 1) % sentimentFilters.length;
    setSentimentFilter(sentimentFilters[nextIndex].value);
  };

  // Get current sentiment filter info
  const currentSentiment = sentimentFilters.find(f => f.value === sentimentFilter) || sentimentFilters[0];

  // Function to cycle through speech rate presets
  const cycleSpeechRatePreset = () => {
    const currentIndex = speechRatePresets.findIndex(p => p.rate === speechRate);
    const nextIndex = (currentIndex + 1) % speechRatePresets.length;
    setSpeechRate(speechRatePresets[nextIndex].rate);
  };

  // Get current speech rate preset info
  const currentSpeechRatePreset = speechRatePresets.find(p => p.rate === speechRate) || speechRatePresets[0];

  // Memoize the speech rate value array to prevent infinite re-renders
  const speechRateValue = useMemo(() => [speechRate], [speechRate]);

  // Memoize the speech rate change handler to prevent infinite re-renders
  const handleSpeechRateChange = useCallback((value: number[]) => {
    setSpeechRate(value[0]);
  }, [setSpeechRate]);

  return (
    <div className="hidden md:flex items-center gap-3 flex-wrap">

      {/* Reading Controls */}
      <div className="flex items-center gap-1">
        {/* Unified Speech Control Button */}
        {speechSupported ? (
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
            title={isSpeaking ? (isPaused ? "Resume Speech (S)" : "Pause Speech (S)") : "Start Reading Aloud (S)"}
          >
            {isSpeaking && !isPaused ? (
              <Pause size={18} />
            ) : isSpeaking && isPaused ? (
              <Play size={18} />
            ) : (
              <Volume2 size={18} />
            )}
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
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            )}
            title={isPlaying ? "Pause Auto-scroll (Space)" : "Start Auto-scroll (Space)"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        )}

        {/* Stop Button - Only show when speaking */}
        {speechSupported && isSpeaking && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopSpeech}
            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            title="Stop Speech (Shift+S)"
          >
            <VolumeX size={18} />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetReading}
          className="p-2 rounded-lg hover:bg-muted"
          title="Reset Reading Position (Esc)"
        >
          <RotateCcw size={18} />
        </motion.button>
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Speech Rate Control */}
      <div className="flex items-center gap-2 min-w-[120px]">
        {/* <span className="text-xs">Rate</span> */}
        <Slider
          value={speechRateValue}
          onValueChange={handleSpeechRateChange}
          max={2.0}
          min={0.5}
          step={0.05}
          className="flex-1"
        />
        <span className="text-xs w-8">{speechRate.toFixed(2)}</span>
      </div>

      {/* Speech Rate Presets - Stacked Layout */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
          onClick={cycleSpeechRatePreset}
          className={cn(
            "p-2 rounded-lg transition-colors",
            speechRate === currentSpeechRatePreset.rate
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
          title={`${currentSpeechRatePreset.name} Speech Rate (${currentSpeechRatePreset.rate}x) - Click to cycle`}
        >
          <div className="flex flex-col items-center gap-0.5">
            {currentSpeechRatePreset.icon}
            <div className="w-1 h-1 bg-current rounded-full opacity-50"></div>
          </div>
        </motion.button>
      </div>

      {/* Timer Display */}
      {timerEnabled && (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <span className={cn(
            "text-sm font-mono min-w-[3rem]",
            timerActive && timerRemaining <= 60 && "text-red-500"
          )}>
            {formatTimer(timerRemaining)}
          </span>
          {timerActive && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      )}

      <div className="h-5 w-px bg-border"></div>

      {/* Sentiment Filter - Single Cycling Button */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 180 }}
          onClick={cycleSentimentFilter}
          className={cn(
            "p-2 rounded-lg transition-colors",
            sentimentFilter === null
              ? "bg-primary text-primary-foreground"
              : currentSentiment.colorClass + " text-white"
          )}
          title={`${currentSentiment.name} Sentiment (${currentSentiment.name.charAt(0).toUpperCase()}) - Click to cycle`}
        >
          {currentSentiment.icon}
        </motion.button>
      </div>

      <div className="h-5 w-px bg-border"></div>

      {/* Essential Control - Only Dim Others */}
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
      </div>
    </div>
  );
}