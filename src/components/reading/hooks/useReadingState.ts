import { useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useReadingState() {
  // Theme and display settings
  const [theme, setTheme] = useLocalStorage("reading-theme", "light");
  const [fontFamily, setFontFamily] = useLocalStorage("font-family", "font-serif");
  const [fontSize, setFontSize] = useLocalStorage("font-size", 18);
  const [lineSpacing, setLineSpacing] = useLocalStorage("line-spacing", "leading-relaxed");
  const [columnCount, setColumnCount] = useLocalStorage("column-count", 1);
  
  // Reading controls
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingSpeed, setReadingSpeed] = useLocalStorage("reading-speed", 200);
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("bookmarks", []);
  
  // View modes
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useLocalStorage("focus-mode", false);
  const [dimOthers, setDimOthers] = useLocalStorage("dim-others", false);
  const [showAnimations, setShowAnimations] = useLocalStorage("show-animations", true);
  const [hideTranslations, setHideTranslations] = useLocalStorage("hide-translations", false);
  const [guessMode, setGuessMode] = useLocalStorage("guess-mode", false);
  
  // UI state
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  // Refs
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const toggleBookmark = (paragraphIndex: number) => {
    setBookmarks(prev => 
      prev.includes(paragraphIndex)
        ? prev.filter(i => i !== paragraphIndex)
        : [...prev, paragraphIndex]
    );
  };

  const resetReading = () => {
    setCurrentParagraph(0);
    setIsPlaying(false);
    if (autoScrollRef.current) {
      clearTimeout(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  return {
    // Theme and display
    theme, setTheme,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineSpacing, setLineSpacing,
    columnCount, setColumnCount,
    
    // Reading controls
    currentParagraph, setCurrentParagraph,
    isPlaying, setIsPlaying,
    readingSpeed, setReadingSpeed,
    bookmarks, setBookmarks,
    toggleBookmark,
    resetReading,
    
    // View modes
    sentimentFilter, setSentimentFilter,
    focusMode, setFocusMode,
    dimOthers, setDimOthers,
    showAnimations, setShowAnimations,
    hideTranslations, setHideTranslations,
    guessMode, setGuessMode,
    
    // UI state
    toolbarVisible, setToolbarVisible,
    lastScrollY, setLastScrollY,
    shortcutsOpen, setShortcutsOpen,
    
    // Refs
    autoScrollRef,
  };
}