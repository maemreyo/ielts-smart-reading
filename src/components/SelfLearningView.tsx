"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReadingState } from "./reading/hooks/useReadingState";
import { SelfLearningViewProps } from "./self-learning/types";
import { useSelfLearningHighlights } from "./self-learning/hooks/useSelfLearningHighlights";
import { useTextSelection } from "./self-learning/hooks/useTextSelection";
import { useExportFunctions } from "./self-learning/hooks/useExportFunctions";
import { SelfLearningHeader } from "./self-learning/components/SelfLearningHeader";
import { InstructionsBanner } from "./self-learning/components/InstructionsBanner";
import { ReadingContent } from "./self-learning/components/ReadingContent";
import { FloatingToolbar } from "./self-learning/components/FloatingToolbar";
import { VocabularySidebar } from "./self-learning/components/VocabularySidebar";

export function SelfLearningView({
  title,
  paragraphs,
  book,
  test,
  passage,
}: SelfLearningViewProps) {
  const readingState = useReadingState();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isClient] = useState(typeof window !== 'undefined');

  // Highlights management
  const { highlightedRanges, setHighlightedRanges, clearHighlightedItems, removeHighlight } = 
    useSelfLearningHighlights(paragraphs);

  // Text selection functionality
  const {
    selectedWords,
    showFloatingToolbar,
    toolbarPosition,
    handleWordClick,
    finalizeHighlight,
    cancelSelection,
    setToolbarPosition
  } = useTextSelection({
    isClient,
    paragraphs,
    highlightedRanges,
    setHighlightedRanges,
    contentRef
  });

  // Export functionality
  const {
    exportAsText,
    exportAsCSV,
    exportAsJSON,
    copyToClipboard,
    downloadFile
  } = useExportFunctions(highlightedRanges);

  // Theme classes for background
  const themeClasses = {
    light: "bg-white text-gray-900",
    sepia: "bg-amber-50 text-amber-900",
    dark: "bg-gray-900 text-gray-100",
  };

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-300", 
        themeClasses[readingState.theme as keyof typeof themeClasses], 
        readingState.fontFamily
      )} 
      style={{ fontSize: `${readingState.fontSize}px` }}
    >
      {/* Header */}
      <SelfLearningHeader
        book={book}
        test={test}
        passage={passage}
        highlightCount={highlightedRanges.length}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Instructions */}
      <InstructionsBanner />

      {/* Main Content */}
      <div className={cn(
        "max-w-7xl mx-auto px-4 py-8 transition-all duration-300",
        highlightedRanges.length > 0 && "mr-80"
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h1>
              <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
            </div>
          )}

          {/* Reading Content */}
          <ReadingContent
            paragraphs={paragraphs}
            highlightedRanges={highlightedRanges}
            selectedWords={selectedWords}
            onWordClick={handleWordClick}
            onRemoveHighlight={removeHighlight}
            lineSpacing={readingState.lineSpacing}
            contentRef={contentRef}
            onToolbarPositionUpdate={setToolbarPosition}
          />
        </motion.div>
      </div>

      {/* Floating Toolbar */}
      <FloatingToolbar
        show={showFloatingToolbar}
        position={toolbarPosition}
        selectedWords={selectedWords}
        onHighlight={finalizeHighlight}
        onCancel={cancelSelection}
      />

      {/* Vocabulary Sidebar */}
      <VocabularySidebar
        highlightedRanges={highlightedRanges}
        isPanelCollapsed={isPanelCollapsed}
        onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
        onClearAll={clearHighlightedItems}
        onCopyToClipboard={copyToClipboard}
        onDownloadFile={downloadFile}
        exportAsText={exportAsText}
        exportAsCSV={exportAsCSV}
        exportAsJSON={exportAsJSON}
        book={book}
        test={test}
        passage={passage}
      />

      {/* Settings Modal - Commented out as in original */}
      {/* <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        globalHighlightEnabled={globalHighlightEnabled}
        onGlobalHighlightChange={setGlobalHighlightEnabled}
        highlightedCount={highlightedItems.length}
        onClearAllHighlights={clearHighlightedItems}
      /> */}
    </div>
  );
}