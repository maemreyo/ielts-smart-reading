"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Highlighter, Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { HighlightedRange } from "../types";

interface VocabularySidebarProps {
  highlightedRanges: HighlightedRange[];
  isPanelCollapsed: boolean;
  onToggleCollapse: () => void;
  onClearAll: () => void;
  onCopyToClipboard: (format: 'simple' | 'json') => void;
  onDownloadFile: (content: string, filename: string, type: string) => void;
  exportAsText: () => string;
  exportAsCSV: () => string;
  exportAsJSON: () => string;
  book: string;
  test: string;
  passage: string;
}

export function VocabularySidebar({
  highlightedRanges,
  isPanelCollapsed,
  onToggleCollapse,
  onClearAll,
  onCopyToClipboard,
  onDownloadFile,
  exportAsText,
  exportAsCSV,
  exportAsJSON,
  book,
  test,
  passage
}: VocabularySidebarProps) {
  if (highlightedRanges.length === 0) return null;

  return (
    <div className={cn(
      "fixed right-0 top-20 bg-card border-l border-border shadow-lg z-30 transition-all duration-300",
      isPanelCollapsed ? "w-12" : "w-80 bottom-0"
    )}>
      <div className="p-4">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-4">
          {!isPanelCollapsed && (
            <h3 className="font-semibold flex items-center gap-2">
              <Highlighter className="w-5 h-5" />
              Vocabulary ({highlightedRanges.length})
            </h3>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="p-1 h-8 w-8"
            title={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {isPanelCollapsed ? (
              <span className="text-lg">›</span>
            ) : (
              <span className="text-lg">‹</span>
            )}
          </Button>
        </div>

        {!isPanelCollapsed && (
          <>
            {/* Copy and Export buttons */}
            <div className="mb-4 space-y-2">
              {/* Copy Section */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Copy to Clipboard</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopyToClipboard('simple')}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Simple
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopyToClipboard('json')}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy JSON
                  </Button>
                </div>
              </div>

              {/* Export Section */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Export as File</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadFile(exportAsText(), `vocabulary-${book}-${test}-${passage}.txt`, 'text/plain')}
                    className="flex-1 flex items-center gap-1 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    .txt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadFile(exportAsCSV(), `vocabulary-${book}-${test}-${passage}.csv`, 'text/csv')}
                    className="flex-1 flex items-center gap-1 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    .csv
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadFile(exportAsJSON(), `vocabulary-${book}-${test}-${passage}.json`, 'application/json')}
                    className="flex-1 flex items-center gap-1 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    .json
                  </Button>
                </div>
              </div>
            </div>

            {/* Vocabulary list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {highlightedRanges.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-sm text-foreground leading-relaxed">
                    {item.displayText}
                  </div>
                  {item.type === 'collocation' && (
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      Phrase
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Clear button at bottom */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearAll}
                className="w-full"
              >
                Clear All Highlights
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}