import { useHotkeys } from "react-hotkeys-hook";

interface UseKeyboardShortcutsProps {
  // Theme controls
  setTheme: (theme: string) => void;
  
  // Reading controls
  startAutoScroll: () => void;
  stopAutoScroll: () => void;
  isPlaying: boolean;
  resetReading: () => void;
  nextParagraph: () => void;
  prevParagraph: () => void;
  
  // View modes
  setFocusMode: (focus: boolean) => void;
  focusMode: boolean;
  setDimOthers: (dim: boolean) => void;
  dimOthers: boolean;
  setHideTranslations: (hide: boolean) => void;
  hideTranslations: boolean;
  setGuessMode: (guess: boolean) => void;
  guessMode: boolean;
  
  // UI controls
  toggleBookmark: (paragraph: number) => void;
  currentParagraph: number;
  setShortcutsOpen: (open: boolean) => void;
  shortcutsOpen: boolean;
}

export function useKeyboardShortcuts({
  setTheme,
  startAutoScroll,
  stopAutoScroll,
  isPlaying,
  resetReading,
  nextParagraph,
  prevParagraph,
  setFocusMode,
  focusMode,
  setDimOthers,
  dimOthers,
  setHideTranslations,
  hideTranslations,
  setGuessMode,
  guessMode,
  toggleBookmark,
  currentParagraph,
  setShortcutsOpen,
  shortcutsOpen,
}: UseKeyboardShortcutsProps) {
  
  // Theme shortcuts
  useHotkeys("1", () => setTheme("light"));
  useHotkeys("2", () => setTheme("sepia"));
  useHotkeys("3", () => setTheme("dark"));

  // Reading control shortcuts
  useHotkeys("space", (e) => {
    e.preventDefault();
    isPlaying ? stopAutoScroll() : startAutoScroll();
  });
  useHotkeys("escape", resetReading);
  useHotkeys("arrowup", (e) => {
    e.preventDefault();
    prevParagraph();
  });
  useHotkeys("arrowdown", (e) => {
    e.preventDefault();
    nextParagraph();
  });

  // View mode shortcuts
  useHotkeys("f", () => setFocusMode(!focusMode));
  useHotkeys("d", () => setDimOthers(!dimOthers));
  useHotkeys("t", () => setHideTranslations(!hideTranslations));
  useHotkeys("g", () => setGuessMode(!guessMode));
  useHotkeys("b", () => toggleBookmark(currentParagraph));

  // UI shortcuts
  useHotkeys("shift+?", () => setShortcutsOpen(!shortcutsOpen));

  const toggleShortcuts = () => setShortcutsOpen(!shortcutsOpen);

  return {
    toggleShortcuts,
  };
}