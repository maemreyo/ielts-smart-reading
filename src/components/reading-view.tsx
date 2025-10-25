"use client";

import React, { useState, useEffect } from "react";
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
  Smile,
  Frown,
  Meh,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Minus as MinusIcon,
  Focus,
  Keyboard,
} from "lucide-react";
import { ReadingProgressBar } from "./reading-progress-bar";
import useLocalStorage from "@/hooks/use-local-storage";
import { LexicalItem } from "./lexical-item";
import { useHotkeys } from "react-hotkeys-hook";
import { useToggle, useLocalStorage as useLocalStorageToggle } from "react-use";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReadingViewProps {
  passageText: string;
  lexicalData: any;
}

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
      lexeme = lexeme
        .replace(/\s*\((adj|n|v|adv|prep|conj|pl)\.?\)/gi, "")
        .trim();
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
          <LexicalItem key={`${item.id}-${matchIndex}`} item={item}>
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

export function ReadingView({ passageText, lexicalData }: ReadingViewProps) {
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

  // Keyboard shortcuts
  useHotkeys("1", () => setTheme("light"));
  useHotkeys("2", () => setTheme("sepia"));
  useHotkeys("3", () => setTheme("dark"));
  useHotkeys("q", () => setSentimentFilter("all"));
  useHotkeys("w", () => setSentimentFilter("positive"));
  useHotkeys("e", () => setSentimentFilter("negative"));
  useHotkeys("r", () => setSentimentFilter("neutral"));
  useHotkeys("f", () => setFocusMode(!focusMode));
  useHotkeys("shift+/", () => toggleShortcuts());
  useHotkeys("=", () => setFontSize(Math.min(40, fontSize + 2)));
  useHotkeys("-", () => setFontSize(Math.max(16, fontSize - 2)));

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
      <div className="p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="flex items-center justify-center space-x-2 md:space-x-4">
          {/* Theme Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTheme("light")}
              className={`p-2 rounded-md ${
                theme === "light"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Sun size={20} />
            </button>
            <button
              onClick={() => setTheme("sepia")}
              className={`p-2 rounded-md ${
                theme === "sepia"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <BookOpen size={20} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-2 rounded-md ${
                theme === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Moon size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Sentiment Controls */}
          <div className="flex items-center space-x-1">
            {sentimentFilters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => setSentimentFilter(filter.value)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  sentimentFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : `hover:bg-muted ${filter.color}`
                )}
                title={`Show ${filter.name.toLowerCase()} sentiment words`}
              >
                {filter.icon}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Font Family Controls */}
          <div>
            <div className="inline-flex rounded-md shadow-sm">
              {fontFamilies.map((font, index) => (
                <button
                  key={font.name}
                  onClick={() => setFontFamily(font.class)}
                  className={`px-3 py-2 text-sm ${
                    fontFamily === font.class
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground"
                  } border ${index === 0 ? "rounded-l-lg" : ""} ${
                    index === fontFamilies.length - 1
                      ? "rounded-r-lg"
                      : "border-l-0"
                  } hover:bg-muted`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Font Size Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">A-</span>
            <input
              type="range"
              min="16"
              max="40"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-lg">A+</span>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border"></div>

          {/* Column Controls */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setColumnCount(1)}
              className={`p-2 rounded-md ${
                columnCount === 1
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <PanelLeft size={20} />
            </button>
            <button
              onClick={() => setColumnCount(2)}
              className={`p-2 rounded-md ${
                columnCount === 2
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Columns size={20} />
            </button>
            <button
              onClick={() => setColumnCount(3)}
              className={`p-2 rounded-md ${
                columnCount === 3
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Grid size={20} />
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-border"></div>

          {/* Line Spacing Controls */}
          <div className="hidden md:flex items-center space-x-1">
            {lineSpacings.map((spacing) => (
              <button
                key={spacing.name}
                onClick={() => setLineSpacing(spacing.class)}
                className={`p-2 rounded-md ${
                  lineSpacing === spacing.class
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {spacing.icon}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border"></div>

          {/* Focus Mode & Shortcuts */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-md ${
                focusMode
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              title="Focus Mode (F)"
            >
              <Focus size={20} />
            </button>
            <button
              onClick={toggleShortcuts}
              className="p-2 rounded-md hover:bg-muted"
              title="Show Shortcuts (Shift + ?)"
            >
              <Keyboard size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn("container mx-auto p-4 md:p-8", focusMode && "max-w-4xl")}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {readingTime} min read
          </p>
        </div>
        <div
          className={cn("max-w-none", focusMode && "max-w-prose mx-auto")}
          style={{
            columnCount: focusMode ? 1 : columnCount,
            columnGap: "2.5rem",
          }}
        >
          {paragraphs.map((p, index) => (
            <p
              key={index}
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
          ))}
        </div>
      </div>

      {/* Shortcuts Help Modal */}
      <Dialog open={showShortcuts} onOpenChange={toggleShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate and control the reading experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Themes</h4>
              <div className="space-y-1 text-sm">
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
              <h4 className="font-semibold mb-2">Sentiment Filters</h4>
              <div className="space-y-1 text-sm">
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
              <h4 className="font-semibold mb-2">Controls</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Focus mode</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
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
