"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Highlighter, Copy, Download, Package, CheckSquare } from "lucide-react";
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
  exportAsBatches: (batchSize: number, includeOriginal: boolean) => any;
  createBatches: (batchSize: number) => any;
  book: string;
  test: string;
  passage: string;
}

export const VocabularySidebar = React.forwardRef<HTMLDivElement, VocabularySidebarProps>((
  {
    highlightedRanges,
    isPanelCollapsed,
    onToggleCollapse,
    onClearAll,
    onCopyToClipboard,
    onDownloadFile,
    exportAsText,
    exportAsCSV,
    exportAsJSON,
    exportAsBatches,
    createBatches,
    book,
    test,
    passage
  },
  ref
) => {
  const hasHighlights = highlightedRanges.length > 0;

  // State for batch export options
  const [batchSize, setBatchSize] = React.useState(25);
  const [includeOriginal, setIncludeOriginal] = React.useState(true);
  const [showBatchOptions, setShowBatchOptions] = React.useState(false);

  return (
    <div ref={ref} className={cn(
      "fixed right-4 top-24 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-30 transition-all duration-500 ease-in-out",
      isPanelCollapsed
        ? "w-14 h-14"
        : hasHighlights
          ? "w-80 h-[calc(100vh-6rem)]"
          : "w-80 h-96"
    )}>
      <div className={cn(
        "p-4 h-full flex flex-col transition-all duration-300",
        isPanelCollapsed && "p-3"
      )}>
        {/* Header with collapse button */}
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isPanelCollapsed ? "mb-0" : "mb-4"
        )}>
          {!isPanelCollapsed && (
            <h3 className="font-semibold flex items-center gap-2">
              <Highlighter className={cn("w-5 h-5", hasHighlights ? "text-primary" : "text-muted-foreground")} />
              {hasHighlights ? `Vocabulary (${highlightedRanges.length})` : "Vocabulary"}
            </h3>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className={cn(
              "transition-all duration-300 hover:bg-primary/10",
              isPanelCollapsed
                ? "p-2 h-8 w-8 rounded-full"
                : "p-1 h-8 w-8"
            )}
            title={isPanelCollapsed ? "Expand vocabulary panel" : "Collapse panel"}
          >
            {isPanelCollapsed ? (
              <Highlighter className={cn("w-4 h-4", hasHighlights ? "text-primary" : "text-muted-foreground")} />
            ) : (
              <span className="text-lg">‹</span>
            )}
          </Button>
        </div>

        {!isPanelCollapsed && (
          <AnimatePresence mode="wait">
            {hasHighlights ? (
              <motion.div
                key="has-highlights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
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

                  {/* Batch Export Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-muted-foreground">Batch Export (25-30 items)</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowBatchOptions(!showBatchOptions)}
                        className="h-6 px-2 text-xs"
                      >
                        <Package className="w-3 h-3" />
                      </Button>
                    </div>

                    {showBatchOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/50"
                      >
                        {/* Batch Size Options */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Items per batch:</label>
                          <select
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full text-xs p-1 border border-border rounded bg-background"
                          >
                            <option value={20}>20 items</option>
                            <option value={25}>25 items (recommended)</option>
                            <option value={30}>30 items</option>
                          </select>
                        </div>

                        {/* Include Original File */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="includeOriginal"
                            checked={includeOriginal}
                            onChange={(e) => setIncludeOriginal(e.target.checked)}
                            className="w-3 h-3 rounded"
                          />
                          <label htmlFor="includeOriginal" className="text-xs">
                            Include master file
                          </label>
                        </div>

                        {/* Batch Preview */}
                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const batches = createBatches(batchSize);
                            return `Will create ${batches.length} batch${batches.length > 1 ? 'es' : ''} (~${batchSize} items each)`;
                          })()}
                        </div>

                        {/* Export Batches Button */}
                        <Button
                          size="sm"
                          onClick={() => {
                            const batchResult = exportAsBatches(batchSize, includeOriginal);

                            // Download all files
                            batchResult.files.forEach(file => {
                              onDownloadFile(file.content, file.filename, 'application/json');
                            });

                            // Show success message
                            alert(`Exported ${batchResult.files.length} files successfully!\n\nFiles created:\n${batchResult.files.map(f => `• ${f.filename}`).join('\n')}\n\nNext steps:\n1. Upload batch files to AI Studio for enrichment\n2. Run merge script to combine processed files\n3. Script: node scripts/merge-vocabulary-batches.js <batch-dir> <output-file>`);
                          }}
                          className="w-full flex items-center gap-1 text-xs"
                        >
                          <Package className="w-3 h-3" />
                          Export All Batches
                        </Button>
                      </motion.div>
                    )}
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
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex flex-col items-center justify-center py-12 px-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <Highlighter className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h4 className="font-medium text-sm text-foreground mb-2">
                  No Highlights Yet
                </h4>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  Select text or click words to start building your vocabulary list.
                </p>

                {/* Quick tips */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                    <span>Click & drag to select text</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                    <span>Hold Ctrl + click for phrases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                    <span>Click highlights to remove</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
});