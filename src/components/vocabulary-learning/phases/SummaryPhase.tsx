import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SummaryPhaseProps {
  cleanTargetWord: string;
  translationVI?: string;
  onBack: () => void;
}

export function SummaryPhase({
  cleanTargetWord,
  translationVI,
  onBack
}: SummaryPhaseProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center overflow-hidden relative">
      {/* Celebration Background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-400 animate-celebration-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${16 + Math.random() * 12}px`,
            }}
          >
            {['🎉', '🌟', '⭐', '✨', '🎊', '🏆', '💫'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <Card className="p-20 bg-gradient-to-br from-white via-purple-50 to-blue-50 backdrop-blur-xl border-0 shadow-[0_0_300px_rgba(147,51,234,0.9)] max-w-4xl mx-auto text-center transform animate-summary-celebration relative overflow-hidden">
        <div className="space-y-10 relative z-10">
          {/* Final Word Display */}
          <div className="text-8xl font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text animate-final-word-celebration drop-shadow-2xl mb-6">
            {cleanTargetWord}
          </div>

          {/* Final Meaning */}
          <div className="text-4xl font-black text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text mb-8">
            {translationVI}
          </div>

          <Button onClick={onBack} size="lg" className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl px-8 py-4">
            <ArrowLeft className="w-6 h-6 mr-3" />
            Quay lại ngay
          </Button>
        </div>
      </Card>
    </div>
  );
}