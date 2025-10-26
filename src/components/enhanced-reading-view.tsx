"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import {
  PanelLeft,
  Columns,
  Grid,
  Minus,
  Equal,
  Plus,
  Sun,
  Moon,
  BookOpen,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Minus as MinusIcon,
  Focus,
  Keyboard,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Settings,
  Brain,
} from "lucide-react";
import { ReadingProgressBar } from "./reading-progress-bar";
import useLocalStorage from "@/hooks/use-local-storage";
import { LexicalItem } from "./lexical-item";
import { useHotkeys } from "react-hotkeys-hook";
import { useToggle } from "react-use";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface ReadingViewProps {
  passageText: string;
  lexicalData: any;
}

export function EnhancedReadingView({
  passageText,
  lexicalData,
}: ReadingViewProps) {
  // Existing states
  const [columnCount, setColumnCount] = useLocalStorage(
    "reading-columnCount",
    1
  );
  const [lineSpacing, setLineSpacing] = useLocalStorage(
    "reading-lineSpacing",
    "leading-loose"
  );
  const [fontSize, setFontSize] = useLocalStorage("reading-fontSize", 24);
  const [fontFamily, setFontFamily] = useLocalStorage(
    "reading-fontFamily",
    "font-sans"
  );
  const [theme, setTheme] = useLocalStorage("reading-theme", "light");
  const [sentimentFilter, setSentimentFilter] = useLocalStorage(
    "reading-sentimentFilter",
    "all"
  );
  const [focusMode, setFocusMode] = useLocalStorage("reading-focusMode", false);
  const [showShortcuts, toggleShortcuts] = useToggle(false);

  // Enhanced features
  const [readingSpeed, setReadingSpeed] = useLocalStorage("reading-speed", 200); // WPM
  const [autoScroll, setAutoScroll] = useLocalStorage("auto-scroll", false);
  const [dimOthers, setDimOthers] = useLocalStorage("dim-others", false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarkedParagraphs, setBookmarkedParagraphs] = useLocalStorage(
    "bookmarked-paragraphs",
    [] as number[]
  );
  const [showAnimations, setShowAnimations] = useLocalStorage(
    "show-animations",
    true
  );
  const [hideTranslations, setHideTranslations] = useLocalStorage(
    "hide-translations",
    false
  );
  const [guessMode, setGuessMode] = useLocalStorage("guess-mode", false);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const autoScrollRef = useRef<NodeJS.Timeout>(null);
  const paragraphRefs = useRef<(HTMLElement | null)[]>([]);

  // Auto-scroll functionality
  const startAutoScroll = () => {
    setIsPlaying(true);
    const scrollSpeed = 60000 / readingSpeed; // ms per word
    const wordsPerParagraph = passageText
      .split("\n\n")
      .map((p) => p.split(" ").length);

    let currentIndex = currentParagraph;
    const scrollThroughParagraphs = () => {
      if (currentIndex < wordsPerParagraph.length) {
        setCurrentParagraph(currentIndex);
        paragraphRefs.current[currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        const timeForThisParagraph =
          wordsPerParagraph[currentIndex] * scrollSpeed;
        autoScrollRef.current = setTimeout(() => {
          currentIndex++;
          scrollThroughParagraphs();
        }, timeForThisParagraph);
      } else {
        setIsPlaying(false);
      }
    };
    scrollThroughParagraphs();
  };

  const stopAutoScroll = () => {
    setIsPlaying(false);
    if (autoScrollRef.current) {
      clearTimeout(autoScrollRef.current);
    }
  };

  const resetReading = () => {
    stopAutoScroll();
    setCurrentParagraph(0);
    paragraphRefs.current[0]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleBookmark = (index: number) => {
    // @ts-ignore
    setBookmarkedParagraphs((prev) =>
      // @ts-ignore
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Enhanced keyboard shortcuts
  useHotkeys("1", () => setTheme("light"));
  useHotkeys("2", () => setTheme("sepia"));
  useHotkeys("3", () => setTheme("dark"));
  useHotkeys("q", () => setSentimentFilter("all"));
  useHotkeys("w", () => setSentimentFilter("positive"));
  useHotkeys("e", () => setSentimentFilter("negative"));
  useHotkeys("r", () => setSentimentFilter("neutral"));
  useHotkeys("f", () => setFocusMode(!focusMode));
  useHotkeys("space", (e) => {
    e.preventDefault();
    isPlaying ? stopAutoScroll() : startAutoScroll();
  });
  useHotkeys("escape", () => resetReading());
  useHotkeys("d", () => setDimOthers(!dimOthers));
  useHotkeys("a", () => setShowAnimations(!showAnimations));
  useHotkeys("shift+/", () => toggleShortcuts());
  useHotkeys("=", () => setFontSize(Math.min(40, fontSize + 2)));
  useHotkeys("-", () => setFontSize(Math.max(16, fontSize - 2)));
  useHotkeys("ArrowUp", () =>
    setCurrentParagraph(Math.max(0, currentParagraph - 1))
  );
  useHotkeys("ArrowDown", () =>
    setCurrentParagraph(
      Math.min(paragraphRefs.current.length - 1, currentParagraph + 1)
    )
  );
  useHotkeys("b", () => toggleBookmark(currentParagraph));
  useHotkeys("t", () => setHideTranslations(!hideTranslations));
  useHotkeys("g", () => setGuessMode(!guessMode));

  // Effects
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.removeAttribute("data-theme");
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "sepia") {
      root.setAttribute("data-theme", "sepia");
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
    };
  }, []);

  // Handle toolbar auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setToolbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setToolbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  // Process paragraph function with lexical highlighting
  function processParagraph(paragraph: string, lexicalItems: any[]) {
    lexicalItems.sort((a, b) => b.targetLexeme.length - a.targetLexeme.length);
    let finalNodes: React.ReactNode[] = [paragraph];

    lexicalItems.forEach((item) => {
      const newNodes: React.ReactNode[] = [];
      let lexeme = item.targetLexeme;
      let regex: RegExp;
      if (lexeme.includes(" ... ")) {
        const parts = lexeme
          .split(" ... ")
          .map((part: string) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        regex = new RegExp(`${parts[0]}(.*?)${parts[1]}`, "gi");
      } else {
        // Remove part-of-speech annotations like (n), (adj), (v), etc.
        lexeme = lexeme.replace(/\s*\([a-zA-Z]+\.?\)/gi, "").trim();
        lexeme = lexeme.replace(/[()]/g, "");
        const escapedLexeme = lexeme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        regex = new RegExp(escapedLexeme, "gi");
      }

      finalNodes.forEach((node) => {
        if (typeof node !== "string") {
          newNodes.push(node);
          return;
        }
        const matches = Array.from(node.matchAll(regex));
        if (matches.length === 0) {
          newNodes.push(node);
          return;
        }
        let lastIndex = 0;
        matches.forEach((match, matchIndex) => {
          const startIndex = match.index!;
          const matchedText = match[0];
          if (startIndex > lastIndex) {
            newNodes.push(node.substring(lastIndex, startIndex));
          }
          newNodes.push(
            <LexicalItem
              key={`${item.id}-${matchIndex}`}
              item={item}
              hideTranslation={hideTranslations}
              guessMode={guessMode}
            >
              {matchedText}
            </LexicalItem>
          );
          lastIndex = startIndex + matchedText.length;
        });
        if (lastIndex < node.length) {
          newNodes.push(node.substring(lastIndex));
        }
      });
      finalNodes = newNodes;
    });

    return finalNodes.map((node, index) => (
      <React.Fragment key={index}>{node}</React.Fragment>
    ));
  }

  // Constants
  const lines = passageText.split("\n");
  const title = lines[0].replace(/## /g, "");
  const paragraphs = lines.slice(1).join("\n").split("\n\n");
  const wordCount = passageText.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const filteredLexicalItems =
    sentimentFilter === "all"
      ? lexicalData.lexicalItems
      : lexicalData.lexicalItems.filter(
          (item: any) => item.phase2Annotation.sentiment === sentimentFilter
        );

  const lineSpacings = [
    { name: "Small", class: "leading-normal", icon: <Minus size={20} /> },
    { name: "Medium", class: "leading-relaxed", icon: <Equal size={20} /> },
    { name: "Large", class: "leading-loose", icon: <Plus size={20} /> },
  ];

  const fontFamilies = [
    { name: "Sans", class: "font-sans" },
    { name: "Serif", class: "font-serif" },
    { name: "Mono", class: "font-mono" },
  ];

  const sentimentFilters = [
    { name: "All", value: "all", icon: <Globe size={20} />, color: "" },
    {
      name: "Positive",
      value: "positive",
      icon: <ThumbsUp size={20} />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      name: "Negative",
      value: "negative",
      icon: <ThumbsDown size={20} />,
      color: "text-red-600 dark:text-red-400",
    },
    {
      name: "Neutral",
      value: "neutral",
      icon: <MinusIcon size={20} />,
      color: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <ReadingProgressBar />

      {/* Enhanced Toolbar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: toolbarVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="p-3 bg-background/95 backdrop-blur-md sticky top-0 z-40 border-b shadow-sm"
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          {/* Mobile Compact View - Only Essential Controls */}
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

            {/* Current theme indicator */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const themes = ["light", "sepia", "dark"];
                const currentIndex = themes.indexOf(theme);
                const nextIndex = (currentIndex + 1) % themes.length;
                setTheme(themes[nextIndex]);
              }}
              className="p-2 rounded-lg hover:bg-muted"
              title="Switch theme"
            >
              {theme === "light" && <Sun size={16} />}
              {theme === "sepia" && <BookOpen size={16} />}
              {theme === "dark" && <Moon size={16} />}
            </motion.button>

            {/* Hide translations toggle */}
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
              title="Hide translations (T)"
            >
              {hideTranslations ? <EyeOff size={16} /> : <Globe size={16} />}
            </motion.button>

            {/* Guess Mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGuessMode(!guessMode)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                guessMode ? "bg-blue-500 text-white" : "hover:bg-muted"
              )}
              title="Guess Mode (G)"
            >
              <Brain size={16} />
            </motion.button>

            {/* Mobile Settings Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-muted  block md:hidden lg:hidden"
                  title="Settings"
                >
                  <Settings size={16} />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 p-4 max-h-[80vh] overflow-y-auto"
              >
                <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Reading Speed */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Reading Speed</label>
                    <span className="text-sm text-muted-foreground">
                      {readingSpeed} WPM
                    </span>
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
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium">
                    Sentiment Filter
                  </label>
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
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium">
                    Advanced Options
                  </label>
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

                <DropdownMenuSeparator />

                {/* Font Family Settings */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium">Font Family</label>
                  <div className="flex gap-1">
                    {fontFamilies.map((font, index) => (
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Full View */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { theme: "light", icon: <Sun size={18} />, title: "Light (1)" },
              {
                theme: "sepia",
                icon: <BookOpen size={18} />,
                title: "Sepia (2)",
              },
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

          <div className="h-5 w-px bg-border hidden md:block"></div>

          {/* Desktop Reading Controls */}
          <div className="hidden md:flex items-center gap-1">
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

          <div className="h-5 w-px bg-border hidden md:block"></div>

          {/* Desktop Reading Speed Control */}
          <div className="hidden md:flex items-center gap-2 min-w-[120px]">
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

          <div className="h-5 w-px bg-border hidden md:block"></div>

          {/* Desktop Sentiment Controls */}
          <div className="hidden md:flex items-center gap-1">
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

          <div className="h-5 w-px bg-border hidden md:block"></div>

          {/* Desktop Advanced Controls */}
          <div className="hidden md:flex items-center gap-1">
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
                guessMode ? "bg-blue-500 text-white" : "hover:bg-muted"
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

            {/* Settings Dropdown */}
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
              <DropdownMenuContent
                align="end"
                className="w-80 p-4 max-h-[80vh] overflow-y-auto"
              >
                <DropdownMenuLabel>Reading Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Mobile Reading Controls */}
                <div className="md:hidden space-y-4 mb-6">
                  {/* Reading Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Reading Speed
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {readingSpeed} WPM
                      </span>
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
                    <label className="text-sm font-medium">
                      Sentiment Filter
                    </label>
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
                    <label className="text-sm font-medium">
                      Advanced Options
                    </label>
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Guess Mode</span>
                        <Switch
                          checked={guessMode}
                          onCheckedChange={setGuessMode}
                        />
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                </div>

                {/* Font Family Settings */}
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium">Font Family</label>
                  <div className="flex gap-1">
                    {fontFamilies.map((font, index) => (
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div
        className={cn("container mx-auto p-4 md:p-8", focusMode && "max-w-4xl")}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {readingTime} min read • {wordCount} words
          </p>
        </motion.div>

        <div
          className={cn("max-w-none", focusMode && "max-w-prose mx-auto")}
          style={{
            columnCount: focusMode ? 1 : columnCount,
            columnGap: "2.5rem",
          }}
        >
          <AnimatePresence>
            {paragraphs.map((p, index) => (
              <motion.div
                key={index}
                // @ts-ignore
                ref={(el) => (paragraphRefs.current[index] = el)}
                initial={showAnimations ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: showAnimations ? index * 0.1 : 0 }}
                className={cn(
                  "mb-8 relative group",
                  dimOthers && currentParagraph !== index && "dim-paragraph",
                  dimOthers &&
                    currentParagraph === index &&
                    "current-focus-paragraph",
                  currentParagraph === index &&
                    "ring-2 ring-primary/20 rounded-lg p-2"
                )}
              >
                {/* Paragraph bookmark */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleBookmark(index)}
                  className={cn(
                    "absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    bookmarkedParagraphs.includes(index) && "opacity-100"
                  )}
                >
                  {bookmarkedParagraphs.includes(index) ? (
                    <BookmarkCheck size={16} className="text-primary" />
                  ) : (
                    <Bookmark size={16} className="text-muted-foreground" />
                  )}
                </motion.button>

                <p
                  className={cn(
                    "mb-8",
                    lineSpacing,
                    fontFamily,
                    focusMode && "text-justify"
                  )}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {processParagraph(
                    p,
                    sentimentFilter === "all"
                      ? lexicalData.lexicalItems
                      : filteredLexicalItems
                  )}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Shortcuts Modal */}
      <Dialog open={showShortcuts} onOpenChange={toggleShortcuts}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enhanced Reading Shortcuts</DialogTitle>
            <DialogDescription>
              Master these shortcuts for optimal reading experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Themes</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Light theme</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">1</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Sepia theme</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">2</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Dark theme</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">3</kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">
                Reading Controls
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Play/Pause</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Space
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Reset reading</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous paragraph</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Next paragraph</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Bookmark paragraph</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Hide translations</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Guess Mode</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">G</kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">
                Sentiment Filters
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>All words</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Q</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Positive words</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">W</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Negative words</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">E</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Neutral words</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">R</kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">
                Display Controls
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Focus mode</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Dim others</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">D</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle animations</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">A</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Increase font</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">=</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Decrease font</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">-</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">
                    Shift + ?
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
