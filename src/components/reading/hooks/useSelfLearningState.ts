"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export interface HighlightedItem {
  id: string;
  targetLexeme: string;
  sourceContext: string;
  // Enhanced data for non-contiguous selections
  isNonContiguous: boolean;
  selectedWordPositions: Array<{
    position: number; // Position within the paragraph
    paragraphIndex: number; // Which paragraph this word belongs to
  }>; // Positions of selected words with paragraph context
  originalContext: string; // Full context with ellipsis for display
  phase1Inference: {
    contextualGuessVI: string;
  };
  phase2Annotation: {
    phonetic: string;
    sentiment: string;
    definitionEN: string;
    translationVI: string;
    relatedCollocates: string[];
    wordForms: Record<string, Array<{ form: string; meaning: string }>>;
  };
  phase3Production: {
    taskType: string;
    content: string;
  };
}

export interface SelectionState {
  selectedWords: string[];
  selectedWordElements: Array<{
    word: string;
    element: HTMLElement;
    position: number; // Word position in paragraph for accurate highlighting
    paragraphIndex: number; // Which paragraph this word belongs to
  }>;
  isSelecting: boolean;
}

export function useSelfLearningState() {
  // Settings
  const [globalHighlightEnabled, setGlobalHighlightEnabled] = useLocalStorage(
    "global-highlight-enabled",
    false
  );

  // Highlighted items with localStorage persistence
  const [highlightedItems, setHighlightedItems] = useState<HighlightedItem[]>([]);

  // Load highlighted items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("highlighted-items");
      if (stored) {
        const parsed = JSON.parse(stored);
        setHighlightedItems(parsed);
      }
    } catch (error) {
      console.error("Error loading highlighted items:", error);
    }
  }, []);

  // Save highlighted items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("highlighted-items", JSON.stringify(highlightedItems));
    } catch (error) {
      console.error("Error saving highlighted items:", error);
    }
  }, [highlightedItems]);

  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedWords: [],
    selectedWordElements: [],
    isSelecting: false,
  });
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Add highlighted item with enhanced non-contiguous support
  const addHighlightedItem = useCallback((
    targetLexeme: string,
    sourceContext: string,
    selectedWordElements?: Array<{ word: string; element: HTMLElement; position: number; paragraphIndex: number }>
  ) => {
    // Determine if this is a non-contiguous selection
    const isNonContiguous = selectedWordElements && selectedWordElements.length > 1;

    // Extract word positions with paragraph context
    const selectedWordPositions = selectedWordElements ?
      selectedWordElements.map(el => ({
        position: el.position,
        paragraphIndex: el.paragraphIndex
      })) : [];

    // Create context with ellipsis for non-contiguous selections
    let originalContext = sourceContext;
    if (isNonContiguous && selectedWordElements && selectedWordElements.length > 1) {
      // For non-contiguous selections, show the first word ... last word
      const firstWord = selectedWordElements[0].word;
      const lastWord = selectedWordElements[selectedWordElements.length - 1].word;
      originalContext = `${firstWord} ... ${lastWord}`;
    }

    const newItem: HighlightedItem = {
      id: Date.now().toString(),
      targetLexeme,
      sourceContext: sourceContext.length > 100
        ? sourceContext.substring(0, 100) + "..."
        : sourceContext,
      isNonContiguous: isNonContiguous || false,
      selectedWordPositions,
      originalContext,
      phase1Inference: {
        contextualGuessVI: "",
      },
      phase2Annotation: {
        phonetic: "",
        sentiment: "",
        definitionEN: "",
        translationVI: "",
        relatedCollocates: [],
        wordForms: {},
      },
      phase3Production: {
        taskType: "",
        content: "",
      },
    };

    setHighlightedItems(prev => [...prev, newItem]);
  }, []);

  // Remove highlighted item
  const removeHighlightedItem = useCallback((id: string) => {
    setHighlightedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear all highlighted items
  const clearHighlightedItems = useCallback(() => {
    setHighlightedItems([]);
  }, []);

  // Handle word selection
  const handleWordClick = useCallback((word: string, element: HTMLElement, position: number, paragraphIndex: number, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      // Multi-word selection mode
      setSelectionState(prev => {
        const isAlreadySelected = prev.selectedWords.includes(word);

        if (isAlreadySelected) {
          // Remove word from selection
          const newSelectedElements = prev.selectedWordElements.filter(el => el.word !== word);
          const newSelectedWords = prev.selectedWords.filter(w => w !== word);

          // Sort by position to maintain text order
          newSelectedElements.sort((a, b) => {
            if (a.paragraphIndex !== b.paragraphIndex) {
              return a.paragraphIndex - b.paragraphIndex;
            }
            return a.position - b.position;
          });

          return {
            ...prev,
            selectedWords: newSelectedWords,
            selectedWordElements: newSelectedElements,
          };
        } else {
          // Add word to selection
          const newElement = { word, element, position, paragraphIndex };
          const newSelectedElements = [...prev.selectedWordElements, newElement];

          // Sort by position to maintain text order (paragraph first, then position within paragraph)
          newSelectedElements.sort((a, b) => {
            if (a.paragraphIndex !== b.paragraphIndex) {
              return a.paragraphIndex - b.paragraphIndex;
            }
            return a.position - b.position;
          });

          // Extract words in the correct text order
          const newSelectedWords = newSelectedElements.map(el => el.word);

          return {
            ...prev,
            selectedWords: newSelectedWords,
            selectedWordElements: newSelectedElements,
            isSelecting: true,
          };
        }
      });

      setShowFloatingToolbar(true);
    } else {
      // Single word selection
      setSelectionState({
        selectedWords: [word],
        selectedWordElements: [{ word, element, position, paragraphIndex }],
        isSelecting: true,
      });

      setShowFloatingToolbar(true);
    }
  }, []);

  // Finalize selection and create highlight
  const finalizeHighlight = useCallback(() => {
    if (selectionState.selectedWords.length === 0) return;

    const targetLexeme = selectionState.selectedWords.join(" ");
    const sourceContext = selectionState.selectedWordElements[0]?.element.parentElement?.textContent || "";

    addHighlightedItem(targetLexeme, sourceContext, selectionState.selectedWordElements);

    // Reset selection
    setSelectionState({
      selectedWords: [],
      selectedWordElements: [],
      isSelecting: false,
    });
    setShowFloatingToolbar(false);
  }, [selectionState, addHighlightedItem]);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setSelectionState({
      selectedWords: [],
      selectedWordElements: [],
      isSelecting: false,
    });
    setShowFloatingToolbar(false);
  }, []);

  // Update toolbar position
  const updateToolbarPosition = useCallback((x: number, y: number) => {
    setToolbarPosition({ x, y });
  }, []);

  // Clean up old highlights (older than 7 days)
  useEffect(() => {
    const cleanupOldHighlights = () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      setHighlightedItems(prev => {
        const filtered = prev.filter(item => {
          const itemTimestamp = parseInt(item.id);
          return itemTimestamp > sevenDaysAgo;
        });

        // Only update if items were removed
        if (filtered.length < prev.length) {
          console.log(`Cleaned up ${prev.length - filtered.length} old highlights`);
        }

        return filtered;
      });
    };

    // Run cleanup on mount and then every hour
    cleanupOldHighlights();
    const interval = setInterval(cleanupOldHighlights, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setHighlightedItems]);

  // Export functions
  const exportAsText = useCallback(() => {
    const text = highlightedItems.map(item => item.targetLexeme).join("\n");
    return text;
  }, [highlightedItems]);

  const exportAsCSV = useCallback(() => {
    const headers = ["targetLexeme", "sourceContext"];
    const rows = highlightedItems.map(item => [
      `"${item.targetLexeme}"`,
      `"${item.sourceContext}"`
    ]);
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  }, [highlightedItems]);

  const exportAsJSON = useCallback(() => {
    return JSON.stringify(highlightedItems, null, 2);
  }, [highlightedItems]);

  const copyToClipboard = useCallback((format: "simple" | "json") => {
    if (format === "simple") {
      const text = highlightedItems.map(item => item.targetLexeme).join(", ");
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(exportAsJSON());
    }
  }, [highlightedItems, exportAsJSON]);

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    // State
    highlightedItems,
    selectionState,
    showFloatingToolbar,
    toolbarPosition,
    globalHighlightEnabled,

    // Actions
    addHighlightedItem,
    removeHighlightedItem,
    clearHighlightedItems,
    handleWordClick,
    finalizeHighlight,
    cancelSelection,
    updateToolbarPosition,
    setGlobalHighlightEnabled,

    // Export functions
    exportAsText,
    exportAsCSV,
    exportAsJSON,
    copyToClipboard,
    downloadFile,
  };
}