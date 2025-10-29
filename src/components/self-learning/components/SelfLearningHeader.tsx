"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Highlighter, Settings } from "lucide-react";
import Link from "next/link";

interface SelfLearningHeaderProps {
  book: string;
  test: string;
  passage: string;
  highlightCount: number;
  onSettingsClick: () => void;
}

export function SelfLearningHeader({
  book,
  test,
  passage,
  highlightCount,
  onSettingsClick
}: SelfLearningHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/reading/${book}/${test}/${passage}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Reading
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <Highlighter className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Learn by Myself Mode</h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {highlightCount} item{highlightCount !== 1 ? "s" : ""} highlighted
            </div>

            {highlightCount > 0 && (
              <Link href={`/vocabulary-learning/${book}/${test}/${passage}`}>
                <Button size="sm" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Start Learning
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}