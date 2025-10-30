"use client";

import { motion } from "framer-motion";
import { MobileToolbar } from "./MobileToolbar";
import { DesktopToolbar } from "./DesktopToolbar";
import { SettingsDialog } from "./SettingsDialog";

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
  speechRate: number;
  setSpeechRate: (rate: number) => void;

  // Speech controls
  speechSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  onStartSpeech: () => void;
  onPauseSpeech: () => void;
  onResumeSpeech: () => void;
  onStopSpeech: () => void;

  // Voice selection controls
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voiceName: string) => void;
  favoriteVoices: string[];
  setFavoriteVoices: (voices: string[]) => void;
  voiceRotation: boolean;
  setVoiceRotation: (enabled: boolean) => void;
  voiceRotationFavoritesOnly: boolean;
  setVoiceRotationFavoritesOnly: (enabled: boolean) => void;

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

  // Timer controls
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  timerRemaining: number;
  timerActive: boolean;
  formatTimer: (seconds: number) => string;
}

export function ReadingToolbar({
  toolbarVisible,
  theme,
  setTheme,
  isPlaying,
  startAutoScroll,
  stopAutoScroll,
  resetReading,
  speechRate,
  setSpeechRate,
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
  // Timer controls
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  timerRemaining,
  timerActive,
  formatTimer,

  // Voice selection controls
  voices,
  currentVoice,
  onVoiceChange,
  favoriteVoices,
  setFavoriteVoices,
  voiceRotation,
  setVoiceRotation,
  voiceRotationFavoritesOnly,
  setVoiceRotationFavoritesOnly,
}: ReadingToolbarProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: toolbarVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-[60px] p-3 bg-background/95 backdrop-blur-md sticky top-16 z-30 border-b shadow-sm"
    >
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        {/* Mobile Compact View */}
        <MobileToolbar
          theme={theme}
          setTheme={setTheme}
          isPlaying={isPlaying}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
          guessMode={guessMode}
          setGuessMode={setGuessMode}
          // Speech props
          speechSupported={speechSupported}
          isSpeaking={isSpeaking}
          isPaused={isPaused}
          onStartSpeech={onStartSpeech}
          onPauseSpeech={onPauseSpeech}
          onResumeSpeech={onResumeSpeech}
          onStopSpeech={onStopSpeech}
          // Settings props
          speechRate={speechRate}
          setSpeechRate={setSpeechRate}
          sentimentFilter={sentimentFilter}
          setSentimentFilter={setSentimentFilter}
          // Advanced controls moved from main toolbar
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          toggleShortcuts={toggleShortcuts}
          dimOthers={dimOthers}
          setDimOthers={setDimOthers}
          hideTranslations={hideTranslations}
          setHideTranslations={setHideTranslations}
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
          // Timer controls
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerDuration={timerDuration}
          setTimerDuration={setTimerDuration}
          timerRemaining={timerRemaining}
          timerActive={timerActive}
          formatTimer={formatTimer}
        />

        {/* Desktop Full View */}
        <DesktopToolbar
          theme={theme}
          setTheme={setTheme}
          isPlaying={isPlaying}
          startAutoScroll={startAutoScroll}
          stopAutoScroll={stopAutoScroll}
          resetReading={resetReading}
          speechRate={speechRate}
          setSpeechRate={setSpeechRate}
          // Timer controls
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerDuration={timerDuration}
          setTimerDuration={setTimerDuration}
          timerRemaining={timerRemaining}
          timerActive={timerActive}
          formatTimer={formatTimer}
          // Speech props
          speechSupported={speechSupported}
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
          <SettingsDialog
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
            // Timer controls
            timerEnabled={timerEnabled}
            setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration}
            setTimerDuration={setTimerDuration}
            // Voice selection controls
            voices={voices}
            currentVoice={currentVoice}
            onVoiceChange={onVoiceChange}
            favoriteVoices={favoriteVoices}
            setFavoriteVoices={setFavoriteVoices}
            voiceRotation={voiceRotation}
            setVoiceRotation={setVoiceRotation}
            voiceRotationFavoritesOnly={voiceRotationFavoritesOnly}
            setVoiceRotationFavoritesOnly={setVoiceRotationFavoritesOnly}
          />
        </div>
      </div>
    </motion.div>
  );
}