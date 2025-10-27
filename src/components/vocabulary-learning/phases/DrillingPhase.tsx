import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Volume2 } from "lucide-react";
import { DrillingCard } from '../components/DrillingCard';
import { type DrillingInstance, type IntensityPhase } from '../patterns/CardPatternGenerator';

interface DrillingPhaseProps {
  drillingInstances: DrillingInstance[];
  intensityPhase: IntensityPhase;
  drillingTime: number;
  progress: number;
  showCentralCard: boolean;
  isElectricShock: boolean;
  cleanTargetWord: string;
  translationVI?: string;
  phonetic?: string;
  onSpeakText: (text: string) => void;
}

export function DrillingPhase({
  drillingInstances,
  intensityPhase,
  drillingTime,
  progress,
  showCentralCard,
  isElectricShock,
  cleanTargetWord,
  translationVI,
  phonetic,
  onSpeakText
}: DrillingPhaseProps) {
  // Dynamic background based on intensity phase
  const getBackgroundConfig = () => {
    switch (intensityPhase) {
      case 'low':
        return {
          bgGradient: 'from-slate-800 via-blue-900 to-purple-800',
          lightningOpacity: 'opacity-20',
          particleCount: 30,
          particleSize: 'w-1 h-1',
          particleColors: 'from-blue-400 to-purple-400'
        };
      case 'medium':
        return {
          bgGradient: 'from-purple-900 via-pink-900 to-red-800',
          lightningOpacity: 'opacity-40',
          particleCount: 80,
          particleSize: 'w-2 h-2',
          particleColors: 'from-purple-400 to-pink-500'
        };
      case 'high':
        return {
          bgGradient: 'from-red-900 via-orange-900 to-yellow-800',
          lightningOpacity: 'opacity-70',
          particleCount: 150,
          particleSize: 'w-3 h-3',
          particleColors: 'from-orange-400 to-red-500'
        };
    }
  };

  const bgConfig = getBackgroundConfig();

  return (
    <div className={`relative min-h-screen ${isElectricShock ? 'bg-black' : `bg-gradient-to-br ${bgConfig.bgGradient}`} flex items-center justify-center overflow-hidden transition-all duration-150`}>
      {/* Ultra Dynamic Background */}
      <div className="absolute inset-0">
        {/* Lightning Effects */}
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 animate-lightning ${bgConfig.lightningOpacity}`}></div>
        <div className={`absolute inset-0 bg-gradient-to-l from-blue-500/20 via-transparent to-orange-500/20 animate-lightning-reverse ${bgConfig.lightningOpacity}`}></div>

        {/* Chaos Lightning for High Intensity */}
        {intensityPhase === 'high' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 via-transparent to-red-500/30 animate-chaos-lightning opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/25 via-transparent to-yellow-500/25 animate-chaos-lightning-reverse opacity-70"></div>
          </>
        )}

        {/* Energy Particles */}
        {[...Array(bgConfig.particleCount)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${bgConfig.particleSize} bg-gradient-to-r ${bgConfig.particleColors} rounded-full animate-energy-particle`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${intensityPhase === 'high' ? 0.5 : intensityPhase === 'medium' ? 1.5 : 2.5} + ${Math.random()}s`,
            }}
          />
        ))}

        {/* Explosive Background Effects for High Intensity */}
        {intensityPhase === 'high' && (
          <div className="absolute inset-0 bg-gradient-radial from-yellow-500/10 via-orange-500/5 to-transparent animate-explosive-pulse"></div>
        )}
      </div>

      {/* Pattern-Based Drilling Instances */}
      {drillingInstances.map((instance) => (
        <DrillingCard
          key={instance.id}
          instance={instance}
          cleanTargetWord={cleanTargetWord}
          translationVI={translationVI}
          phonetic={phonetic}
          isElectricShock={isElectricShock}
        />
      ))}

      {/* DYNAMIC Central Learning Block */}
      {showCentralCard && (
        <CentralCard
          intensityPhase={intensityPhase}
          isElectricShock={isElectricShock}
          cleanTargetWord={cleanTargetWord}
          translationVI={translationVI}
          phonetic={phonetic}
          drillingTime={drillingTime}
          onSpeakText={onSpeakText}
        />
      )}

      {/* Epic Progress Bar */}
      <div className="fixed bottom-8 left-8 right-8">
        <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl">
          <div className="flex items-center gap-6 mb-4">
            <Target className="w-8 h-8 text-yellow-400 animate-spin" />
            <span className="font-black text-2xl text-white">NẠP TỪ VÀO TRÍ NHỚ: {Math.round(progress)}%</span>
            <div className="text-4xl animate-bounce">🧠💥</div>
          </div>
          <Progress value={progress} className="h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full shadow-inner" />
        </div>
      </div>
    </div>
  );
}

// Central Card Component
function CentralCard({
  intensityPhase,
  isElectricShock,
  cleanTargetWord,
  translationVI,
  phonetic,
  drillingTime,
  onSpeakText
}: {
  intensityPhase: IntensityPhase;
  isElectricShock: boolean;
  cleanTargetWord: string;
  translationVI?: string;
  phonetic?: string;
  drillingTime: number;
  onSpeakText: (text: string) => void;
}) {
  const getCardConfig = () => {
    switch (intensityPhase) {
      case 'low':
        return {
          cardClass: 'p-12 max-w-3xl transform scale-95',
          shadowColor: 'shadow-[0_0_100px_rgba(59,130,246,0.6)]',
          wordSize: 'text-7xl',
          wordColors: 'from-blue-600 via-purple-600 to-indigo-600',
          meaningSize: 'text-4xl',
          meaningColors: 'from-green-600 via-teal-600 to-blue-600',
        };
      case 'medium':
        return {
          cardClass: 'p-14 max-w-4xl transform scale-100',
          shadowColor: 'shadow-[0_0_200px_rgba(147,51,234,0.8)]',
          wordSize: 'text-8xl',
          wordColors: 'from-purple-600 via-pink-600 to-red-600',
          meaningSize: 'text-5xl',
          meaningColors: 'from-green-600 via-blue-600 to-purple-600',
        };
      case 'high':
        return {
          cardClass: 'p-20 max-w-6xl transform scale-110',
          shadowColor: 'shadow-[0_0_300px_rgba(239,68,68,0.9)]',
          wordSize: 'text-9xl',
          wordColors: 'from-red-600 via-orange-500 to-yellow-500',
          meaningSize: 'text-6xl',
          meaningColors: 'from-orange-600 via-red-600 to-yellow-600',
        };
    }
  };

  const config = getCardConfig();

  return (
    <Card className={`${config.cardClass} ${isElectricShock ? 'bg-black border-white border-4' : 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-0'} backdrop-blur-xl ${config.shadowColor} mx-auto text-center animate-mega-pulse transition-all duration-150`}>
      <div className="space-y-8">
        {/* DYNAMIC Word Display */}
        <div className={`${config.wordSize} font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)]' : `text-transparent bg-gradient-to-r ${config.wordColors} bg-clip-text`} animate-mega-word-pulse drop-shadow-2xl mb-6 transition-all duration-150`}>
          {cleanTargetWord}
        </div>

        {/* DYNAMIC Translation */}
        <div className={`${config.meaningSize} font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)]' : `bg-gradient-to-r ${config.meaningColors} bg-clip-text text-transparent`} animate-rainbow-text mb-8 transition-all duration-150`}>
          {translationVI}
        </div>

        {/* Timing Display */}
        <div className={`text-xl font-bold ${isElectricShock ? 'text-white bg-black' : 'text-white bg-black/50'} px-4 py-2 rounded-full inline-block transition-all duration-150`}>
          {intensityPhase.toUpperCase()} PHASE: {drillingTime.toFixed(1)}s
        </div>

        {/* Phonetic */}
        <div className={`text-xl ${isElectricShock ? 'text-white bg-black' : 'text-blue-600 bg-white/30 border-blue-200'} font-mono px-6 py-3 rounded-full border-2 opacity-60 mb-6 transition-all duration-150`}>
          {phonetic}
        </div>

        {/* Listen Button */}
        <Button
          variant="ghost"
          size="lg"
          onClick={() => onSpeakText(cleanTargetWord)}
          className="mt-6 text-lg p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 transform transition-all duration-300 shadow-xl opacity-70"
        >
          <Volume2 className="w-6 h-6 mr-3" />
          NGHE PHÁT ÂM
        </Button>
      </div>
    </Card>
  );
}