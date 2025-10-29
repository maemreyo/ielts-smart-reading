"use client";

import React from "react";

export function InstructionsBanner() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How to use:</strong> Click and drag to select text, or click on any word to highlight it.
          Hold <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl</kbd> or <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Cmd</kbd> and click multiple words to create a phrase.
          Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Esc</kbd> to cancel selection.
        </div>
      </div>
    </div>
  );
}