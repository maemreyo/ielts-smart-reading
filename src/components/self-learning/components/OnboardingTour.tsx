"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTourProps {
  hasHighlights: boolean;
  onStartTour: () => void;
}

export function OnboardingTour({ hasHighlights, onStartTour }: OnboardingTourProps) {
  const [showHelpHint, setShowHelpHint] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const seen = localStorage.getItem('self-learning-onboarding-seen');
    setHasSeenOnboarding(!!seen);

    // Show help hint after 3 seconds if no highlights and hasn't seen onboarding
    if (!hasHighlights && !seen) {
      const timer = setTimeout(() => {
        setShowHelpHint(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasHighlights]);

  const handleStartTour = () => {
    setShowHelpHint(false);
    onStartTour();
    localStorage.setItem('self-learning-onboarding-seen', 'true');
    setHasSeenOnboarding(true);
  };

  const handleDismissHint = () => {
    setShowHelpHint(false);
    localStorage.setItem('self-learning-onboarding-dismissed', 'true');
  };

  if (hasHighlights && hasSeenOnboarding) return null;

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={handleStartTour}
          className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Onboarding Hint Popup */}
      <AnimatePresence>
        {showHelpHint && !hasHighlights && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-foreground">
                🎯 Ready to learn vocabulary?
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissHint}
                className="p-1 h-6 w-6 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              I notice you haven't started highlighting yet. Would you like a quick tour to see how the vocabulary learning works?
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleStartTour}
                size="sm"
                className="flex-1"
              >
                Show me how! 🚀
              </Button>
              <Button
                onClick={handleDismissHint}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Maybe later
              </Button>
            </div>

            {/* Pointer arrow */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}