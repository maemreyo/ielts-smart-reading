"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Highlighter,
  X,
  Copy,
  Download,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelfLearningState } from "../hooks/useSelfLearningState";

interface FloatingToolbarProps {
  position: { x: number; y: number };
  isVisible: boolean;
  selectedWordsCount: number;
  onHighlight: () => void;
  onCancel: () => void;
  highlightedItemsCount: number;
}

export function FloatingToolbar({
  position,
  isVisible,
  selectedWordsCount,
  onHighlight,
  onCancel,
  highlightedItemsCount,
}: FloatingToolbarProps) {
  const {
    copyToClipboard,
    downloadFile,
    exportAsText,
    exportAsCSV,
    exportAsJSON,
  } = useSelfLearningState();

  const [copySuccess, setCopySuccess] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);

  // Reset success states after 2 seconds
  React.useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  React.useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => setExportSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  const handleCopy = (format: "simple" | "json") => {
    copyToClipboard(format);
    setCopySuccess(true);
  };

  const handleExport = (format: "text" | "csv" | "json") => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case "text":
        content = exportAsText();
        filename = "highlighted-vocabulary.txt";
        mimeType = "text/plain";
        break;
      case "csv":
        content = exportAsCSV();
        filename = "highlighted-vocabulary.csv";
        mimeType = "text/csv";
        break;
      case "json":
        content = exportAsJSON();
        filename = "highlighted-vocabulary.json";
        mimeType = "application/json";
        break;
    }

    downloadFile(content, filename, mimeType);
    setExportSuccess(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-2"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, 0)",
          }}
        >
          {/* Selection indicator */}
          <div className="text-xs text-muted-foreground px-2 py-1 border-r border-border">
            {selectedWordsCount} word{selectedWordsCount !== 1 ? "s" : ""} selected
          </div>

          {/* Highlight button */}
          <Button
            size="sm"
            variant="default"
            onClick={onHighlight}
            className="flex items-center gap-2"
          >
            <Highlighter className="w-4 h-4" />
            Highlight
          </Button>

          {/* Cancel button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Copy dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="p-2">
                <Copy className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCopy("simple")}>
                Copy All (Simple)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopy("json")}>
                Copy All (JSON)
              </DropdownMenuItem>
              {copySuccess && (
                <DropdownMenuItem disabled className="text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="p-2">
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("text")}>
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              {exportSuccess && (
                <DropdownMenuItem disabled className="text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Exported!
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Highlighted items count */}
          {highlightedItemsCount > 0 && (
            <div className="text-xs text-muted-foreground px-2 py-1 border-l border-border">
              {highlightedItemsCount} highlighted
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}