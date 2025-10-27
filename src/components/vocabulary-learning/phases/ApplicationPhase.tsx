import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { type LexicalItem } from "../../reading/utils/textProcessing";

interface ApplicationPhaseProps {
  cleanTargetWord: string;
  lexicalItem: LexicalItem;
  onSpeakText: (text: string) => void;
}

export function ApplicationPhase({
  cleanTargetWord,
  lexicalItem,
  onSpeakText
}: ApplicationPhaseProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center overflow-hidden relative">
      {/* Epic Application Background */}
      <div className="absolute inset-0">
        {/* Power Waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-orange-500/20 animate-power-wave"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-red-500/20 via-transparent to-amber-500/20 animate-power-wave-reverse"></div>

        {/* Success Stars */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-400 animate-success-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${12 + Math.random() * 8}px`,
            }}
          >
            ⭐
          </div>
        ))}

        {/* Victory Rays */}
        <div className="absolute inset-0 bg-gradient-radial from-yellow-500/10 via-transparent to-transparent animate-victory-rays"></div>
      </div>

      <Card className="p-20 bg-gradient-to-br from-white via-amber-50 to-orange-50 backdrop-blur-xl border-0 shadow-[0_0_250px_rgba(245,158,11,0.8)] max-w-6xl mx-auto text-center transform animate-application-mastery relative overflow-hidden">
        {/* Victory Fireworks */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-firework"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              🎆
            </div>
          ))}
        </div>

        <div className="space-y-12 relative z-10">
          <div className="text-7xl font-black text-transparent bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text animate-word-mastery drop-shadow-2xl">
            {cleanTargetWord}
          </div>

          {lexicalItem.phase3Production?.content && (
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-12 rounded-3xl border-4 border-amber-400 shadow-2xl animate-example-showcase relative overflow-hidden">
              {/* Example Spotlight */}
              <div className="absolute inset-0 bg-gradient-radial from-yellow-300/20 via-transparent to-transparent animate-example-spotlight"></div>

              <div className="text-3xl text-gray-800 mb-8 leading-relaxed font-semibold p-6 bg-white/70 rounded-2xl border-2 border-amber-300 animate-example-text relative">
                <div className="absolute -top-4 -left-4 text-6xl animate-quote-mark">"</div>
                {lexicalItem.phase3Production.content}
                <div className="absolute -bottom-4 -right-4 text-6xl animate-quote-mark-reverse">"</div>
              </div>

              <div className="text-2xl text-gray-700 italic font-medium p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl border-2 border-orange-300 animate-translation-reveal">
                🇻🇳 Tôi đang theo đuổi một lý tưởng cứ mãi xa tầm với.
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => onSpeakText(lexicalItem.phase3Production?.content || '')}
                className="mt-10 text-3xl p-10 bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-125 transform transition-all duration-500 shadow-2xl animate-mega-listen-button"
              >
                <Volume2 className="w-12 h-12 mr-6 animate-sound-wave" />
                🔊 NGHE VÍ DỤ SIÊU ĐẲNG 🔊
              </Button>
            </div>
          )}

          {/* Success Indicators */}
          <div className="flex justify-center gap-8 mt-12">
            <div className="text-6xl animate-success-icon">🎉</div>
            <div className="text-6xl animate-success-icon" style={{ animationDelay: '0.5s' }}>🏆</div>
            <div className="text-6xl animate-success-icon" style={{ animationDelay: '1s' }}>💫</div>
            <div className="text-6xl animate-success-icon" style={{ animationDelay: '1.5s' }}>🌟</div>
          </div>
        </div>
      </Card>
    </div>
  );
}