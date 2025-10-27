import React from 'react';
import { Card } from "@/components/ui/card";
import { type DrillingInstance } from '../patterns/CardPatternGenerator';

interface DrillingCardProps {
  instance: DrillingInstance;
  cleanTargetWord: string;
  translationVI?: string;
  phonetic?: string;
  isElectricShock: boolean;
}

export function DrillingCard({ 
  instance, 
  cleanTargetWord, 
  translationVI, 
  phonetic, 
  isElectricShock 
}: DrillingCardProps) {
  // Size configurations for high contrast
  const sizeConfigs = {
    normal: {
      padding: 'p-6',
      wordSize: 'text-3xl',
      meaningSize: 'text-2xl',
      phoneticSize: 'text-sm',
      cardScale: 'scale-100',
      shadow: 'shadow-[0_0_50px_rgba(255,255,255,0.5)]'
    },
    large: {
      padding: 'p-8',
      wordSize: 'text-4xl',
      meaningSize: 'text-3xl',
      phoneticSize: 'text-base',
      cardScale: 'scale-110',
      shadow: 'shadow-[0_0_80px_rgba(255,255,255,0.7)]'
    },
    mega: {
      padding: 'p-12',
      wordSize: 'text-6xl',
      meaningSize: 'text-4xl',
      phoneticSize: 'text-xl',
      cardScale: 'scale-125',
      shadow: 'shadow-[0_0_120px_rgba(255,255,255,0.9)]'
    }
  };

  const config = sizeConfigs[instance.size];
  
  return (
    <div
      className="absolute animate-explosive-appear transform-gpu"
      style={{
        left: `${instance.x}%`,
        top: `${instance.y}%`,
        opacity: instance.opacity,
        animation: "explosiveAppear 2s ease-out, megaFloat 2s ease-in-out infinite",
        animationDelay: `${Math.random() * 0.5}s`,
      }}
    >
      <Card className={`${config.padding} ${config.cardScale} ${
        isElectricShock 
          ? 'bg-black border-white border-4' 
          : 'bg-gradient-to-br from-gray-900 to-black border-white/80'
        } backdrop-blur-xl border-2 text-center transform rotate-3 hover:rotate-0 transition-all duration-150 ${config.shadow}`}>
        
        <div className={`font-black ${config.wordSize} ${
          isElectricShock 
            ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' 
            : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'
          } animate-text-glow mb-2`}>
          {cleanTargetWord}
        </div>
        
        <div className={`${config.meaningSize} font-black ${
          isElectricShock 
            ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' 
            : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,0,0.6)]'
          } animate-meaning-flash mb-2`}>
          {translationVI}
        </div>
        
        <div className={`${config.phoneticSize} mt-1 font-mono ${
          isElectricShock 
            ? 'text-white animate-flash-bright' 
            : 'text-cyan-300'
          } opacity-70`}>
          {phonetic}
        </div>
        
        {/* Pattern indicator for debugging (remove in production) */}
        <div className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white px-2 py-1 rounded opacity-50">
          {instance.pattern}
        </div>
      </Card>
    </div>
  );
}