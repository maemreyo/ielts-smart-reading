"use client";

import { motion } from "framer-motion";
import { MobileToolbar } from "./MobileToolbar";
import { DesktopToolbar } from "./DesktopToolbar";
import { SettingsDropdown } from "./SettingsDropdown";

interface ReadingToolbarProps {
  toolbarVisible: boolean;
  // Theme controls
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
  showAnimations: boolean;
  setShowAnimations: (show: boolean) => void;

  // Font and layout
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  lineSpacing: string;
  setLineSpacing: (spacing: string) => void;

  // Shortcuts
  toggleShortcuts: () => void;
}

export function ReadingToolbar({
  toolbarVisible,
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
  toggleShortcuts,
}: ReadingToolbarProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: toolbarVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-3 bg-background/95 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm"
    >
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        {/* Mobile Compact View */}
        <MobileToolbar
          theme={theme}
          setTheme={setTheme}
          isPlaying={isPlaying}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
          hideTranslations={hideTranslations}
          setHideTranslations={setHideTranslations}
          guessMode={guessMode}
          setGuessMode={setGuessMode}
          // Speech props
          speechSupported={speechSupported}
          speechMode={speechMode}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          onStartSpeech={onStartSpeech}
          onPauseSpeech={onPauseSpeech}
          onResumeSpeech={onResumeSpeech}
          onStopSpeech={onStopSpeech}
          // Settings props
          readingSpeed={readingSpeed}
          setReadingSpeed={setReadingSpeed}
          sentimentFilter={sentimentFilter}
          setSentimentFilter={setSentimentFilter}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          dimOthers={dimOthers}
          setDimOthers={setDimOthers}
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

        {/* Desktop Full View */}
        <DesktopToolbar
          theme={theme}
          setTheme={setTheme}
          isPlaying={isPlaying}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
          resetReading={resetReading}
          readingSpeed={readingSpeed}
          setReadingSpeed={setReadingSpeed}
          // Speech props
          speechSupported={speechSupported}
          speechMode={speechMode}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          onStartSpeech={onStartSpeech}
          onPauseSpeech={onPauseSpeech}
          onResumeSpeech={onResumeSpeech}
          onStopSpeech={onStopSpeech}
          sentimentFilter={sentimentFilter}
          setSentimentFilter={setSentimentFilter}
          dimOthers={dimOthers}
          setDimOthers={setDimOthers}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          hideTranslations={hideTranslations}
          setHideTranslations={setHideTranslations}
          guessMode={guessMode}
          setGuessMode={setGuessMode}
          toggleShortcuts={toggleShortcuts}
        />

        {/* Desktop Settings */}
        <div className="hidden md:block">
          <SettingsDropdown
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            columnCount={columnCount}
            setColumnCount={setColumnCount}
            lineSpacing={lineSpacing}
            setLineSpacing={setLineSpacing}
            showAnimations={showAnimations}
            setShowAnimations={setShowAnimations}
          />
        </div>
      </div>
    </motion.div>
  );
}