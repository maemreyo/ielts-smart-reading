"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Highlighter } from "lucide-react";
import { SelectedWord } from "../types";

interface FloatingToolbarProps {
  show: boolean;
  position: { x: number; y: number };
  selectedWords: SelectedWord[];
  onHighlight: () => void;
  onCancel: () => void;
}

export function FloatingToolbar({
  show,
  position,
  selectedWords,
  onHighlight,
  onCancel
}: FloatingToolbarProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2 }}
      className="fixed z-[9999] bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, 0)",
      }}
      data-floating-toolbar="true"
    >
      {/* Selection indicator */}
      <div className="text-xs text-muted-foreground px-2 py-1 border-r border-border">
        {selectedWords.length} word{selectedWords.length !== 1 ? "s" : ""} selected
      </div>

      {/* Highlight button */}
      <Button
        size="sm"
        variant="default"
        onClick={() => {
          console.log('🔘 Highlight button clicked!');
          onHighlight();
        }}
        className="flex items-center gap-2"
      >
        <Highlighter className="w-4 h-4" />
        Highlight
      </Button>

      {/* Cancel button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          console.log('❌ Cancel button clicked!');
          onCancel();
        }}
        className="p-2"
      >
        ×
      </Button>
    </motion.div>
  );
}