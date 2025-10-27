"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { type LexicalItem } from "../reading/utils/textProcessing";
import { AudioEffectsManager } from "./audio/AudioEffects";
import { generateCardPattern, selectPattern, type DrillingInstance, type IntensityPhase } from "./patterns/CardPatternGenerator";
import { DrillingPhase } from "./phases/DrillingPhase";
import { ExpansionPhase } from "./phases/ExpansionPhase";
import { ApplicationPhase } from "./phases/ApplicationPhase";
import { SummaryPhase } from "./phases/SummaryPhase";
import { Progress } from "@radix-ui/react-progress";
import { Target, Badge, Volume2, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface VocabularyLearningScreenProps {
  lexicalItem: LexicalItem;
  onBack: () => void;
  onComplete?: () => void;
}

type LearningPhase = "priming" | "drilling" | "expansion" | "application" | "summary" | "completed";

export function VocabularyLearningScreen({
  lexicalItem,
  onBack,
  onComplete,
}: VocabularyLearningScreenProps) {
  const [phase, setPhase] = useState<LearningPhase>("drilling");
  const [progress, setProgress] = useState(0);
  const [drillingInstances, setDrillingInstances] = useState<DrillingInstance[]>([]);
  const [showCentralCard, setShowCentralCard] = useState(true);
  const [currentSpeechRate, setCurrentSpeechRate] = useState(0.6);
  const [intensityPhase, setIntensityPhase] = useState<IntensityPhase>('low');
  const [drillingTime, setDrillingTime] = useState(0);
  const [isElectricShock, setIsElectricShock] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioManager = useRef<AudioEffectsManager>(new AudioEffectsManager());
  const summaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const instanceCounterRef = useRef(0);

  // Clean vocabulary text by removing grammar annotations
  const cleanVocabularyText = (text: string) => {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Electric shock effect for brain impact with bright flash
  const triggerElectricShock = () => {
    setIsElectricShock(true);
    setTimeout(() => {
      setIsElectricShock(false);
    }, 150); // Short electric shock duration for maximum brain impact
  };

  // Get clean word for display
  const cleanTargetWord = cleanVocabularyText(lexicalItem.targetLexeme);

  // Speech function with completion tracking
  const speakText = (text: string, rate?: number, onComplete?: () => void) => {
    if ('speechSynthesis' in window) {
      const cleanText = cleanVocabularyText(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = rate || currentSpeechRate;
      utterance.volume = 0.8;

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onComplete) onComplete();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onComplete) onComplete();
      };

      speechSynthesis.speak(utterance);
    }
  };



  // Main Drilling Phase - Speech-Synchronized Learning
  useEffect(() => {
    if (phase === "drilling") {
      setDrillingTime(0);
      setIntensityPhase('low');
      setProgress(0);

      let speechCount = 0;
      let localIntensity: IntensityPhase = 'low';
      const totalSpeechCycles = 12; // Total number of speech cycles

      const nextSpeechCycle = () => {
        speechCount++;

        // Update intensity based on speech count
        if (speechCount <= 4) {
          localIntensity = 'low';
          setIntensityPhase('low');
        } else if (speechCount <= 8) {
          localIntensity = 'medium';
          setIntensityPhase('medium');
        } else {
          localIntensity = 'high';
          setIntensityPhase('high');
        }

        // Update progress based on completed speech cycles
        const progressValue = Math.round((speechCount / totalSpeechCycles) * 100);
        setProgress(Math.min(progressValue, 100));
        setDrillingTime(speechCount * 1.2); // Approximate time

        // Time-lapse effect activation (9s-15s period)
        const isTimeLapseActive = speechCount >= 7 && speechCount <= 12;

        // Card visibility control
        if ((speechCount >= 2 && speechCount <= 4) || (speechCount >= 6 && speechCount <= 9)) {
          setShowCentralCard(false);
        } else {
          setShowCentralCard(true);
        }

        // Generate pattern-based cards
        const count = localIntensity === 'low' ? 2 : localIntensity === 'medium' ? 3 : 5;
        const duration = localIntensity === 'low' ? 3000 : localIntensity === 'medium' ? 2500 : 2000;
        const currentPattern = selectPattern(speechCount, localIntensity);
        const positions = generateCardPattern(currentPattern, count, localIntensity);

        positions.forEach((position, i) => {
          setTimeout(() => {
            const newInstance: DrillingInstance = {
              id: instanceCounterRef.current++,
              x: Math.max(5, Math.min(90, position.x)),
              y: Math.max(5, Math.min(90, position.y)),
              opacity: 1,
              pattern: currentPattern,
              size: position.size,
            };

            setDrillingInstances(prev => [...prev, newInstance]);
            setTimeout(() => {
              setDrillingInstances(prev => prev.filter(instance => instance.id !== newInstance.id));
            }, duration);
          }, i * 150);
        });

        // Electric shock triggers
        if (Math.random() < 0.4) {
          setTimeout(() => triggerElectricShock(), Math.random() * 800);
        }
        if (localIntensity === 'high' && Math.random() < 0.3) {
          setTimeout(() => triggerElectricShock(), Math.random() * 400 + 300);
        }

        // Continue or complete
        if (speechCount >= totalSpeechCycles) {
          // Learning complete - return to reading screen
          setTimeout(() => {
            onBack();
          }, 1500);
        } else {
          // Speak next cycle after a brief pause
          setTimeout(() => {
            // Dynamic speech rate: faster at beginning, slower at end
            let rate;
            if (speechCount <= 4) {
              rate = 1.005; // Fast start
            } else if (speechCount <= 7) {
              rate = 1.01; // Peak speed
            } else if (speechCount <= 10) {
              rate = 1.15; // Medium speed during time-lapse
            } else {
              rate = 1.07; // Slow down at end for memory consolidation
            }
            setCurrentSpeechRate(rate);
            speakText(lexicalItem.targetLexeme, rate, nextSpeechCycle);
          }, 200);
        }
      };

      // Start first speech cycle
      setTimeout(() => {
        const rate = 0.6;
        setCurrentSpeechRate(rate);
        speakText(lexicalItem.targetLexeme, rate, nextSpeechCycle);
      }, 500);
    }
  }, [phase, lexicalItem.targetLexeme, onBack]);


  const renderPrimingPhase = () => (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60"></div>

      <div className="relative z-10 max-w-4xl mx-auto p-8 transform animate-dramatic-zoom">
        <Card className="p-12 bg-white/95 backdrop-blur-lg border-0 shadow-[0_0_100px_rgba(147,51,234,0.5)] animate-glow-pulse">
          <div className="text-2xl text-gray-700 leading-relaxed text-center">
            <span className="blur-md opacity-50 transition-all duration-1000">...{lexicalItem.sourceContext?.split(lexicalItem.targetLexeme)[0]?.slice(-20) || "London's population"}</span>
            <span className="mx-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-6 py-3 rounded-lg font-black text-white text-3xl relative transform animate-word-highlight shadow-2xl">
              {cleanTargetWord}
              <span className="absolute -top-4 -right-4 text-red-400 text-4xl animate-question-bounce">❓</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-50 blur-xl animate-pulse"></div>
            </span>
            <span className="blur-md opacity-50 transition-all duration-1000">{lexicalItem.sourceContext?.split(lexicalItem.targetLexeme)[1]?.slice(0, 20) || "and the central area became"}...</span>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDrillingPhase = () => {
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
        {/* Time-lapse Dynamic Background - Only Active During 9s-15s */}
        <div className={`absolute inset-0 transition-all duration-1000 ${drillingTime >= 9 && drillingTime <= 15
            ? 'animate-time-lapse-bg opacity-100'
            : 'opacity-30'
          }`}>
          {/* Lightning Effects - 2x-4x Speed During Time-lapse */}
          <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/30 via-transparent to-pink-500/30 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-ultra-fast-lightning' : 'animate-super-fast-lightning'
            } ${bgConfig.lightningOpacity}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-l from-blue-500/30 via-transparent to-orange-500/30 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-ultra-fast-lightning-reverse' : 'animate-super-fast-lightning-reverse'
            } ${bgConfig.lightningOpacity}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-br from-green-500/25 via-transparent to-purple-500/25 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-ultra-diagonal-lightning' : 'animate-diagonal-lightning'
            } ${bgConfig.lightningOpacity}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-tl from-red-500/25 via-transparent to-blue-500/25 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-ultra-diagonal-lightning-reverse' : 'animate-diagonal-lightning-reverse'
            } ${bgConfig.lightningOpacity}`}></div>

          {/* Chaos Lightning - Mega Speed During Time-lapse */}
          {(intensityPhase === 'high' || (drillingTime >= 9 && drillingTime <= 15)) && (
            <>
              <div className={`absolute inset-0 bg-gradient-to-tr from-yellow-500/40 via-transparent to-red-500/40 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-chaos-lightning' : 'animate-hyper-chaos-lightning'
                } opacity-90`}></div>
              <div className={`absolute inset-0 bg-gradient-to-bl from-orange-500/35 via-transparent to-yellow-500/35 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-chaos-lightning-reverse' : 'animate-hyper-chaos-lightning-reverse'
                } opacity-80`}></div>
              <div className={`absolute inset-0 bg-gradient-to-r from-pink-500/30 via-transparent to-cyan-500/30 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-ultra-chaos-lightning' : 'animate-ultra-chaos-lightning'
                } opacity-70`}></div>
            </>
          )}

          {/* Super Fast Energy Particles - 4x Speed During Time-lapse */}
          {[...Array(drillingTime >= 9 && drillingTime <= 15 ? bgConfig.particleCount * 4 : bgConfig.particleCount * 2)].map((_, i) => (
            <div
              key={i}
              className={`absolute ${bgConfig.particleSize} bg-gradient-to-r ${bgConfig.particleColors} rounded-full ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-energy-particle' : 'animate-hyper-energy-particle'
                }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * (drillingTime >= 9 && drillingTime <= 15 ? 0.5 : 1)}s`,
                animationDuration: `${drillingTime >= 9 && drillingTime <= 15
                  ? (intensityPhase === 'high' ? 0.05 : intensityPhase === 'medium' ? 0.1 : 0.2)
                  : (intensityPhase === 'high' ? 0.2 : intensityPhase === 'medium' ? 0.5 : 0.8)
                  }s`,
              }}
            />
          ))}

          {/* Rotating Gradients - 3x Speed During Time-lapse */}
          <div className={`absolute inset-0 bg-gradient-conic from-blue-500/20 via-purple-500/20 to-pink-500/20 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-time-lapse-rotate' : 'animate-time-lapse-rotate'
            }`}></div>
          <div className={`absolute inset-0 bg-gradient-conic from-green-500/15 via-yellow-500/15 to-red-500/15 ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-time-lapse-rotate-reverse' : 'animate-time-lapse-rotate-reverse'
            }`}></div>

          {/* Wave Patterns - 2x Speed During Time-lapse */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-time-lapse-wave-1' : 'animate-time-lapse-wave-1'
            }`}></div>
          <div className={`absolute inset-0 bg-gradient-to-l from-transparent via-white/8 to-transparent ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-time-lapse-wave-2' : 'animate-time-lapse-wave-2'
            }`}></div>
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/6 to-transparent ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-time-lapse-wave-3' : 'animate-time-lapse-wave-3'
            }`}></div>

          {/* Explosive Effects - 4x Speed During Time-lapse */}
          {(intensityPhase === 'high' || (drillingTime >= 9 && drillingTime <= 15)) && (
            <div className={`absolute inset-0 bg-gradient-radial from-yellow-500/15 via-orange-500/10 to-transparent ${drillingTime >= 9 && drillingTime <= 15 ? 'animate-mega-explosive-pulse' : 'animate-hyper-explosive-pulse'
              }`}></div>
          )}
        </div>

        {/* Pattern-Based Drilling Instances with Size Variations */}
        {drillingInstances.map((instance) => {
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
              key={instance.id}
              className="absolute animate-explosive-appear transform-gpu"
              style={{
                left: `${instance.x}%`,
                top: `${instance.y}%`,
                opacity: instance.opacity,
                animation: "explosiveAppear 2s ease-out, megaFloat 2s ease-in-out infinite",
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <Card className={`${config.padding} ${config.cardScale} ${isElectricShock ? 'bg-black border-white border-4' : 'bg-gradient-to-br from-gray-900 to-black border-white/80'} backdrop-blur-xl border-2 text-center transform rotate-3 hover:rotate-0 transition-all duration-150 ${config.shadow}`}>
                <div className={`font-black ${config.wordSize} ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'} animate-text-glow mb-2`}>
                  {cleanTargetWord}
                </div>
                <div className={`${config.meaningSize} font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,0,0.6)]'} animate-meaning-flash mb-2`}>
                  {lexicalItem.phase2Annotation?.translationVI}
                </div>
                <div className={`${config.phoneticSize} mt-1 font-mono ${isElectricShock ? 'text-white animate-flash-bright' : 'text-cyan-300'} opacity-70`}>
                  {lexicalItem.phase2Annotation?.phonetic}
                </div>
                {/* Pattern indicator for debugging (remove in production) */}
                <div className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white px-2 py-1 rounded opacity-50">
                  {instance.pattern}
                </div>
              </Card>
            </div>
          );
        })}

        {/* Dimming Overlay During Time-lapse (9s-15s) */}
        {drillingTime >= 9 && drillingTime <= 15 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-all duration-1000"></div>
        )}

        {/* Fixed Central Word and Meaning - Floating Effect During Time-lapse */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className={`text-center transition-all duration-1000 ${drillingTime >= 9 && drillingTime <= 15
              ? 'transform translate-y-[-20px] scale-110 animate-floating-focus'
              : 'transform translate-y-0 scale-100'
            }`}>
            {/* Word with enhanced changes during time-lapse */}
            <div className={`text-8xl font-black mb-8 transition-all duration-500 ${isElectricShock
                ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)]'
                : drillingTime >= 9 && drillingTime <= 15
                  ? 'text-white drop-shadow-[0_0_40px_rgba(255,255,255,1)] transform scale-115 font-extrabold animate-time-lapse-word-glow'
                  : intensityPhase === 'low'
                    ? 'text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] transform scale-100'
                    : intensityPhase === 'medium'
                      ? 'text-white drop-shadow-[0_0_25px_rgba(147,51,234,0.8)] transform scale-105 italic'
                      : 'text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] transform scale-110 font-extrabold underline'
              }`}>
              {cleanTargetWord}
            </div>

            {/* Meaning with enhanced changes during time-lapse */}
            <div className={`text-4xl font-bold transition-all duration-500 ${isElectricShock
                ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]'
                : drillingTime >= 9 && drillingTime <= 15
                  ? 'text-yellow-100 drop-shadow-[0_0_30px_rgba(255,255,0,1)] transform scale-115 font-black animate-time-lapse-meaning-glow'
                  : intensityPhase === 'low'
                    ? 'text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.6)] transform scale-100'
                    : intensityPhase === 'medium'
                      ? 'text-yellow-200 drop-shadow-[0_0_18px_rgba(255,255,0,0.7)] transform scale-105 italic'
                      : 'text-yellow-100 drop-shadow-[0_0_22px_rgba(255,255,0,0.8)] transform scale-110 font-black underline'
              }`}>
              {lexicalItem.phase2Annotation?.translationVI}
            </div>
          </div>
        </div>

        {/* Epic Progress Bar */}
        <div className="fixed bottom-8 left-8 right-8">
          <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl">
            <div className="flex items-center gap-6 mb-4">
              <Target className="w-8 h-8 text-yellow-400 animate-spin" />
              <span className="font-black text-2xl text-white">NẠP TỪ VÀO TRÍ NHỚ: {Math.round(progress)}%</span>
              <div className="text-4xl animate-bounce">🧠💥</div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderExpansionPhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center overflow-hidden relative">
      {/* Magical Knowledge Expansion Background */}
      <div className="absolute inset-0">
        {/* Knowledge Waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 animate-knowledge-wave"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-teal-500/10 via-transparent to-emerald-500/10 animate-knowledge-wave-reverse"></div>

        {/* Floating Knowledge Orbs */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full animate-knowledge-orb opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <Card className="p-16 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 backdrop-blur-xl border-0 shadow-[0_0_200px_rgba(16,185,129,0.6)] max-w-5xl mx-auto text-center transform animate-expansion-bloom relative overflow-hidden">
        {/* Magic Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        <div className="space-y-10 relative z-10">

          <div className="text-6xl font-black text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text animate-word-expansion drop-shadow-2xl">
            {cleanTargetWord}
          </div>

          {/* <div className="text-3xl text-blue-800 font-mono bg-white/60 px-8 py-4 rounded-full border-4 border-emerald-300 animate-phonetic-expansion shadow-2xl">
            {lexicalItem.phase2Annotation?.phonetic}
          </div> */}

          {/* <div className={`text-3xl font-black transition-all duration-2000 transform ${expandedMeaning
            ? "text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text scale-110 animate-meaning-revelation"
            : "text-gray-600 scale-100"
            }`}>
            {expandedMeaning
              ? `${lexicalItem.phase2Annotation?.translationVI} ⚡ ${lexicalItem.phase2Annotation?.definitionEN}`
              : lexicalItem.phase2Annotation?.translationVI
            }
          </div> */}

          {/* {expandedMeaning && lexicalItem.phase2Annotation?.relatedCollocates && (
            <div className="mt-10 p-8 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-2xl animate-knowledge-panel border-4 border-emerald-300 shadow-2xl">
              <div className="flex flex-wrap gap-4 justify-center">
                {lexicalItem.phase2Annotation.relatedCollocates.map((collocation, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-lg px-4 py-2 border-2 border-emerald-400 bg-white/80 hover:bg-emerald-100 transform hover:scale-110 transition-all duration-300 animate-collocation-float shadow-lg"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {collocation}
                  </Badge>
                ))}
              </div>
            </div>
          )} */}

          {/* {expandedMeaning && lexicalItem.phase2Annotation?.wordForms && (
            <div className="mt-8 p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-knowledge-panel border-4 border-blue-300 shadow-2xl">
              <div className="grid grid-cols-2 gap-6 text-lg">
                {Object.entries(lexicalItem.phase2Annotation.wordForms).map(([type, forms], typeIndex) =>
                  forms && Array.isArray(forms) && forms.length > 0 ? (
                    <div key={type} className="animate-word-form-reveal" style={{ animationDelay: `${typeIndex * 0.3}s` }}>
                      {(forms as Array<{ form: string; meaning: string }>).map((form, index) => (
                        <div key={index} className="ml-4 mb-2 p-2 bg-white/50 rounded-lg animate-form-float" style={{ animationDelay: `${index * 0.1}s` }}>
                          <span className="font-mono font-bold text-purple-700">{form.form}</span> - <span className="text-gray-700">{form.meaning}</span>
                        </div>
                      ))}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )} */}
        </div>
      </Card>
    </div>
  );

  const renderApplicationPhase = () => (
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

  const renderSummaryPhase = () => (
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
            {lexicalItem.phase2Annotation?.translationVI}
          </div>

          <Button onClick={onBack} size="lg" className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl px-8 py-4">
            <ArrowLeft className="w-6 h-6 mr-3" />
            Quay lại ngay
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderCompletedPhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center">
      <Card className="p-12 bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl mx-auto text-center">
        <div className="space-y-6">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-green-900 mb-4">
            Hoàn thành!
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Bạn đã học xong từ vựng <strong>{cleanTargetWord}</strong>
          </p>
          <div className="space-y-4">
            <Button onClick={onBack} size="lg" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại đọc
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <style jsx>{`
        @keyframes flash-bright {
          0% { 
            text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4);
            transform: scale(1);
          }
          50% { 
            text-shadow: 0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.6);
            transform: scale(1.05);
          }
          100% { 
            text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4);
            transform: scale(1);
          }
        }
        
        .animate-flash-bright {
          animation: flash-bright 0.15s ease-in-out infinite;
        }
        
        /* TIME-LAPSE EFFECT ANIMATIONS */
        @keyframes time-lapse-bg {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(1deg); }
          50% { transform: scale(1.01) rotate(0deg); }
          75% { transform: scale(1.03) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes super-fast-lightning {
          0%, 100% { opacity: 0.1; transform: translateX(-200px) scaleX(1); }
          50% { opacity: 0.8; transform: translateX(200px) scaleX(1.5); }
        }
        
        @keyframes super-fast-lightning-reverse {
          0%, 100% { opacity: 0.1; transform: translateX(200px) scaleX(1); }
          50% { opacity: 0.8; transform: translateX(-200px) scaleX(1.5); }
        }
        
        @keyframes diagonal-lightning {
          0%, 100% { opacity: 0.1; transform: translate(-150px, -150px) scale(1); }
          50% { opacity: 0.6; transform: translate(150px, 150px) scale(1.3); }
        }
        
        @keyframes diagonal-lightning-reverse {
          0%, 100% { opacity: 0.1; transform: translate(150px, -150px) scale(1); }
          50% { opacity: 0.6; transform: translate(-150px, 150px) scale(1.3); }
        }
        
        @keyframes hyper-chaos-lightning {
          0%, 100% { opacity: 0.2; transform: translateX(-300px) rotateZ(0deg); }
          25% { opacity: 0.9; transform: translateX(100px) rotateZ(90deg); }
          50% { opacity: 0.7; transform: translateX(300px) rotateZ(180deg); }
          75% { opacity: 0.8; transform: translateX(-100px) rotateZ(270deg); }
        }
        
        @keyframes hyper-chaos-lightning-reverse {
          0%, 100% { opacity: 0.2; transform: translateX(300px) rotateZ(360deg); }
          25% { opacity: 0.9; transform: translateX(-100px) rotateZ(270deg); }
          50% { opacity: 0.7; transform: translateX(-300px) rotateZ(180deg); }
          75% { opacity: 0.8; transform: translateX(100px) rotateZ(90deg); }
        }
        
        @keyframes ultra-chaos-lightning {
          0%, 100% { opacity: 0.1; transform: translateY(-200px) rotateZ(0deg) scaleY(1); }
          33% { opacity: 0.8; transform: translateY(0px) rotateZ(120deg) scaleY(1.5); }
          66% { opacity: 0.6; transform: translateY(200px) rotateZ(240deg) scaleY(0.8); }
        }
        
        @keyframes hyper-energy-particle {
          0% { opacity: 0; transform: translateY(0px) scale(0) rotate(0deg); }
          25% { opacity: 1; transform: translateY(-50px) scale(1.5) rotate(90deg); }
          50% { opacity: 0.8; transform: translateY(-100px) scale(1) rotate(180deg); }
          75% { opacity: 0.6; transform: translateY(-150px) scale(1.2) rotate(270deg); }
          100% { opacity: 0; transform: translateY(-200px) scale(0) rotate(360deg); }
        }
        
        @keyframes time-lapse-rotate {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }
        
        @keyframes time-lapse-rotate-reverse {
          0% { transform: rotate(360deg) scale(1); }
          100% { transform: rotate(0deg) scale(1.1); }
        }
        
        @keyframes time-lapse-wave-1 {
          0%, 100% { transform: translateX(-100%) rotateY(0deg); }
          50% { transform: translateX(100%) rotateY(180deg); }
        }
        
        @keyframes time-lapse-wave-2 {
          0%, 100% { transform: translateX(100%) rotateY(0deg); }
          50% { transform: translateX(-100%) rotateY(180deg); }
        }
        
        @keyframes time-lapse-wave-3 {
          0%, 100% { transform: translateY(-100%) rotateX(0deg); }
          50% { transform: translateY(100%) rotateX(180deg); }
        }
        
        @keyframes hyper-explosive-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.1; }
          25% { transform: scale(1.5) rotate(90deg); opacity: 0.3; }
          50% { transform: scale(2) rotate(180deg); opacity: 0.2; }
          75% { transform: scale(1.8) rotate(270deg); opacity: 0.4; }
        }
        
        .animate-time-lapse-bg {
          animation: time-lapse-bg 3s ease-in-out infinite;
        }
        
        .animate-super-fast-lightning {
          animation: super-fast-lightning 0.3s ease-in-out infinite;
        }
        
        .animate-super-fast-lightning-reverse {
          animation: super-fast-lightning-reverse 0.4s ease-in-out infinite;
        }
        
        .animate-diagonal-lightning {
          animation: diagonal-lightning 0.5s ease-in-out infinite;
        }
        
        .animate-diagonal-lightning-reverse {
          animation: diagonal-lightning-reverse 0.6s ease-in-out infinite;
        }
        
        .animate-hyper-chaos-lightning {
          animation: hyper-chaos-lightning 0.2s linear infinite;
        }
        
        .animate-hyper-chaos-lightning-reverse {
          animation: hyper-chaos-lightning-reverse 0.25s linear infinite;
        }
        
        .animate-ultra-chaos-lightning {
          animation: ultra-chaos-lightning 0.3s linear infinite;
        }
        
        .animate-hyper-energy-particle {
          animation: hyper-energy-particle 0.8s linear infinite;
        }
        
        .animate-time-lapse-rotate {
          animation: time-lapse-rotate 1s linear infinite;
        }
        
        .animate-time-lapse-rotate-reverse {
          animation: time-lapse-rotate-reverse 1.2s linear infinite;
        }
        
        .animate-time-lapse-wave-1 {
          animation: time-lapse-wave-1 0.4s ease-in-out infinite;
        }
        
        .animate-time-lapse-wave-2 {
          animation: time-lapse-wave-2 0.6s ease-in-out infinite;
        }
        
        .animate-time-lapse-wave-3 {
          animation: time-lapse-wave-3 0.8s ease-in-out infinite;
        }
        
        .animate-hyper-explosive-pulse {
          animation: hyper-explosive-pulse 0.5s ease-in-out infinite;
        }
        
        /* MEGA SPEED ANIMATIONS FOR TIME-LAPSE - HIGHER VISIBILITY */
        @keyframes ultra-fast-lightning {
          0%, 100% { opacity: 0.4; transform: translateX(-300px) scaleX(1.5); }
          50% { opacity: 1; transform: translateX(300px) scaleX(3); }
        }
        
        @keyframes ultra-fast-lightning-reverse {
          0%, 100% { opacity: 0.4; transform: translateX(300px) scaleX(1.5); }
          50% { opacity: 1; transform: translateX(-300px) scaleX(3); }
        }
        
        @keyframes ultra-diagonal-lightning {
          0%, 100% { opacity: 0.3; transform: translate(-250px, -250px) scale(1.5); }
          50% { opacity: 0.9; transform: translate(250px, 250px) scale(3); }
        }
        
        @keyframes ultra-diagonal-lightning-reverse {
          0%, 100% { opacity: 0.3; transform: translate(250px, -250px) scale(1.5); }
          50% { opacity: 0.9; transform: translate(-250px, 250px) scale(3); }
        }
        
        @keyframes mega-chaos-lightning {
          0%, 100% { opacity: 0.5; transform: translateX(-500px) rotateZ(0deg) scaleX(2); }
          25% { opacity: 1; transform: translateX(150px) rotateZ(90deg) scaleX(2.5); }
          50% { opacity: 0.9; transform: translateX(500px) rotateZ(180deg) scaleX(3); }
          75% { opacity: 1; transform: translateX(-150px) rotateZ(270deg) scaleX(2.5); }
        }
        
        @keyframes mega-chaos-lightning-reverse {
          0%, 100% { opacity: 0.5; transform: translateX(500px) rotateZ(360deg) scaleX(2); }
          25% { opacity: 1; transform: translateX(-150px) rotateZ(270deg) scaleX(2.5); }
          50% { opacity: 0.9; transform: translateX(-500px) rotateZ(180deg) scaleX(3); }
          75% { opacity: 1; transform: translateX(150px) rotateZ(90deg) scaleX(2.5); }
        }
        
        @keyframes mega-ultra-chaos-lightning {
          0%, 100% { opacity: 0.4; transform: translateY(-400px) rotateZ(0deg) scaleY(2); }
          33% { opacity: 1; transform: translateY(0px) rotateZ(120deg) scaleY(3.5); }
          66% { opacity: 0.9; transform: translateY(400px) rotateZ(240deg) scaleY(2.5); }
        }
        
        @keyframes mega-energy-particle {
          0% { opacity: 0; transform: translateY(0px) scale(0) rotate(0deg); }
          20% { opacity: 1; transform: translateY(-40px) scale(2) rotate(72deg); }
          40% { opacity: 0.9; transform: translateY(-80px) scale(1.5) rotate(144deg); }
          60% { opacity: 0.7; transform: translateY(-120px) scale(1.8) rotate(216deg); }
          80% { opacity: 0.5; transform: translateY(-160px) scale(1.2) rotate(288deg); }
          100% { opacity: 0; transform: translateY(-200px) scale(0) rotate(360deg); }
        }
        
        @keyframes mega-time-lapse-rotate {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(1080deg) scale(1.3); }
        }
        
        @keyframes mega-time-lapse-rotate-reverse {
          0% { transform: rotate(1080deg) scale(1); }
          100% { transform: rotate(0deg) scale(1.3); }
        }
        
        @keyframes mega-time-lapse-wave-1 {
          0%, 100% { transform: translateX(-100%) rotateY(0deg) scaleX(2); }
          50% { transform: translateX(100%) rotateY(360deg) scaleX(1.5); }
        }
        
        @keyframes mega-time-lapse-wave-2 {
          0%, 100% { transform: translateX(100%) rotateY(0deg) scaleX(2); }
          50% { transform: translateX(-100%) rotateY(360deg) scaleX(1.5); }
        }
        
        @keyframes mega-time-lapse-wave-3 {
          0%, 100% { transform: translateY(-100%) rotateX(0deg) scaleY(2); }
          50% { transform: translateY(100%) rotateX(360deg) scaleY(1.5); }
        }
        
        @keyframes mega-explosive-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          20% { transform: scale(2.5) rotate(72deg); opacity: 0.5; }
          40% { transform: scale(3.5) rotate(144deg); opacity: 0.3; }
          60% { transform: scale(3) rotate(216deg); opacity: 0.6; }
          80% { transform: scale(2.8) rotate(288deg); opacity: 0.4; }
        }
        
        @keyframes floating-focus {
          0%, 100% { transform: translateY(-20px) scale(1.1); }
          50% { transform: translateY(-30px) scale(1.15); }
        }
        
        @keyframes time-lapse-word-glow {
          0%, 100% { text-shadow: 0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,255,255,0.8); }
          50% { text-shadow: 0 0 60px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,1), 0 0 180px rgba(255,255,255,0.6); }
        }
        
        @keyframes time-lapse-meaning-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(255,255,0,1), 0 0 60px rgba(255,255,0,0.8); }
          50% { text-shadow: 0 0 50px rgba(255,255,0,1), 0 0 100px rgba(255,255,0,1), 0 0 150px rgba(255,255,0,0.6); }
        }
        
        /* MEGA SPEED CLASS ASSIGNMENTS - MUCH FASTER & MORE VISIBLE */
        .animate-ultra-fast-lightning {
          animation: ultra-fast-lightning 0.03s ease-in-out infinite;
        }
        
        .animate-ultra-fast-lightning-reverse {
          animation: ultra-fast-lightning-reverse 0.04s ease-in-out infinite;
        }
        
        .animate-ultra-diagonal-lightning {
          animation: ultra-diagonal-lightning 0.05s ease-in-out infinite;
        }
        
        .animate-ultra-diagonal-lightning-reverse {
          animation: ultra-diagonal-lightning-reverse 0.06s ease-in-out infinite;
        }
        
        .animate-mega-chaos-lightning {
          animation: mega-chaos-lightning 0.02s linear infinite;
        }
        
        .animate-mega-chaos-lightning-reverse {
          animation: mega-chaos-lightning-reverse 0.025s linear infinite;
        }
        
        .animate-mega-ultra-chaos-lightning {
          animation: mega-ultra-chaos-lightning 0.03s linear infinite;
        }
        
        .animate-mega-energy-particle {
          animation: mega-energy-particle 0.08s linear infinite;
        }
        
        .animate-mega-time-lapse-rotate {
          animation: mega-time-lapse-rotate 0.1s linear infinite;
        }
        
        .animate-mega-time-lapse-rotate-reverse {
          animation: mega-time-lapse-rotate-reverse 0.12s linear infinite;
        }
        
        .animate-mega-time-lapse-wave-1 {
          animation: mega-time-lapse-wave-1 0.06s ease-in-out infinite;
        }
        
        .animate-mega-time-lapse-wave-2 {
          animation: mega-time-lapse-wave-2 0.08s ease-in-out infinite;
        }
        
        .animate-mega-time-lapse-wave-3 {
          animation: mega-time-lapse-wave-3 0.1s ease-in-out infinite;
        }
        
        .animate-mega-explosive-pulse {
          animation: mega-explosive-pulse 0.04s ease-in-out infinite;
        }
        
        .animate-floating-focus {
          animation: floating-focus 2s ease-in-out infinite;
        }
        
        .animate-time-lapse-word-glow {
          animation: time-lapse-word-glow 1s ease-in-out infinite;
        }
        
        .animate-time-lapse-meaning-glow {
          animation: time-lapse-meaning-glow 1.2s ease-in-out infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes dramatic-zoom {
          0% { transform: scale(0.1) rotate(-360deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); opacity: 0.8; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 100px rgba(147,51,234,0.5); }
          50% { box-shadow: 0 0 200px rgba(147,51,234,0.8), 0 0 300px rgba(236,72,153,0.6); }
        }
        
        @keyframes word-highlight {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(2deg); }
          50% { transform: scale(1.2) rotate(-2deg); }
          75% { transform: scale(1.1) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes question-bounce {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(10deg) scale(1.2); }
          50% { transform: translateY(-20px) rotate(-10deg) scale(1.4); }
          75% { transform: translateY(-10px) rotate(5deg) scale(1.2); }
        }
        
        @keyframes lightning {
          0%, 100% { opacity: 0.2; transform: translateX(-100px); }
          50% { opacity: 0.8; transform: translateX(100px); }
        }
        
        @keyframes lightning-reverse {
          0%, 100% { opacity: 0.2; transform: translateX(100px); }
          50% { opacity: 0.8; transform: translateX(-100px); }
        }
        
        @keyframes energy-particle {
          0% { opacity: 0; transform: translateY(0px) scale(0); }
          50% { opacity: 1; transform: translateY(-100px) scale(1.5); }
          100% { opacity: 0; transform: translateY(-200px) scale(0); }
        }
        
        @keyframes explosive-appear {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          20% { opacity: 1; transform: scale(1.5) rotate(180deg); }
          40% { opacity: 0.8; transform: scale(0.8) rotate(360deg); }
          100% { opacity: 1; transform: scale(1) rotate(720deg); }
        }
        
        @keyframes mega-float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-15px) translateX(10px) rotate(5deg); }
          50% { transform: translateY(-30px) translateX(-5px) rotate(-5deg); }
          75% { transform: translateY(-15px) translateX(-10px) rotate(3deg); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(147,51,234,0.5); }
          50% { text-shadow: 0 0 20px rgba(147,51,234,0.8), 0 0 30px rgba(236,72,153,0.6); }
        }
        
        @keyframes phonetic-pulse {
          0%, 100% { transform: scale(1); color: rgb(30 64 175); }
          50% { transform: scale(1.1); color: rgb(59 130 246); }
        }
        
        @keyframes meaning-flash {
          0%, 100% { color: rgb(220 38 38); background-color: transparent; }
          50% { color: white; background-color: rgb(220 38 38); }
        }
        
        @keyframes mega-pulse {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.05); }
        }
        
        @keyframes mega-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.5); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes mega-spin-reverse {
          0% { transform: rotate(360deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.5); }
          100% { transform: rotate(0deg) scale(1); }
        }
        
        @keyframes dramatic-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(5deg); }
        }
        
        @keyframes mega-word-pulse {
          0%, 100% { transform: scale(1) rotateY(0deg); text-shadow: 0 0 50px rgba(147,51,234,0.5); }
          25% { transform: scale(1.1) rotateY(90deg); text-shadow: 0 0 100px rgba(236,72,153,0.8); }
          50% { transform: scale(1.2) rotateY(180deg); text-shadow: 0 0 150px rgba(239,68,68,0.8); }
          75% { transform: scale(1.1) rotateY(270deg); text-shadow: 0 0 100px rgba(236,72,153,0.8); }
        }
        
        @keyframes phonetic-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.5); transform: scale(1); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.8), 0 0 60px rgba(147,51,234,0.6); transform: scale(1.05); }
        }
        
        @keyframes rainbow-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(147,51,234,0.5); }
          50% { box-shadow: 0 0 60px rgba(147,51,234,0.8), 0 0 90px rgba(236,72,153,0.6); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-dramatic-zoom {
          animation: dramatic-zoom 2s ease-out;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .animate-word-highlight {
          animation: word-highlight 2s ease-in-out infinite;
        }
        
        .animate-question-bounce {
          animation: question-bounce 1s ease-in-out infinite;
        }
        
        .animate-lightning {
          animation: lightning 2s ease-in-out infinite;
        }
        
        .animate-lightning-reverse {
          animation: lightning-reverse 2.5s ease-in-out infinite;
        }
        
        .animate-energy-particle {
          animation: energy-particle 3s linear infinite;
        }
        
        .animate-explosive-appear {
          animation: explosive-appear 2s ease-out;
        }
        
        .animate-mega-float {
          animation: mega-float 2s ease-in-out infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 1.5s ease-in-out infinite;
        }
        
        .animate-phonetic-pulse {
          animation: phonetic-pulse 1s ease-in-out infinite;
        }
        
        .animate-meaning-flash {
          animation: meaning-flash 1.5s ease-in-out infinite;
        }
        
        .animate-mega-pulse {
          animation: mega-pulse 3s ease-in-out infinite;
        }
        
        .animate-mega-spin {
          animation: mega-spin 2s linear infinite;
        }
        
        .animate-mega-spin-reverse {
          animation: mega-spin-reverse 2s linear infinite;
        }
        
        .animate-dramatic-pulse {
          animation: dramatic-pulse 1s ease-in-out infinite;
        }
        
        .animate-mega-word-pulse {
          animation: mega-word-pulse 4s ease-in-out infinite;
        }
        
        .animate-phonetic-glow {
          animation: phonetic-glow 2s ease-in-out infinite;
        }
        
        .animate-rainbow-text {
          background-size: 200% 200%;
          animation: rainbow-text 3s ease-in-out infinite;
        }
        
        .animate-button-glow {
          animation: button-glow 2s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        /* EXPANSION PHASE ANIMATIONS */
        @keyframes knowledge-wave {
          0%, 100% { transform: translateX(-100%) scale(1); opacity: 0.1; }
          50% { transform: translateX(100%) scale(1.5); opacity: 0.3; }
        }
        
        @keyframes knowledge-wave-reverse {
          0%, 100% { transform: translateX(100%) scale(1); opacity: 0.1; }
          50% { transform: translateX(-100%) scale(1.5); opacity: 0.3; }
        }
        
        @keyframes knowledge-orb {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-50px) scale(1.5) rotate(180deg); opacity: 1; }
        }
        
        @keyframes expansion-bloom {
          0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(0deg); opacity: 0.8; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
        }
        
        @keyframes enlightenment {
          0%, 100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          25% { transform: scale(1.3) rotate(90deg); filter: brightness(1.5); }
          50% { transform: scale(1.5) rotate(180deg); filter: brightness(2); }
          75% { transform: scale(1.3) rotate(270deg); filter: brightness(1.5); }
        }
        
        @keyframes enlightenment-reverse {
          0%, 100% { transform: scale(1) rotate(360deg); filter: brightness(1); }
          25% { transform: scale(1.3) rotate(270deg); filter: brightness(1.5); }
          50% { transform: scale(1.5) rotate(180deg); filter: brightness(2); }
          75% { transform: scale(1.3) rotate(90deg); filter: brightness(1.5); }
        }
        
        @keyframes knowledge-badge {
          0%, 100% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(1.1) rotateY(180deg); }
        }
        
        @keyframes word-expansion {
          0%, 100% { transform: scale(1) rotateZ(0deg); text-shadow: 0 0 50px rgba(16,185,129,0.5); }
          25% { transform: scale(1.1) rotateZ(5deg); text-shadow: 0 0 100px rgba(20,184,166,0.8); }
          50% { transform: scale(1.2) rotateZ(-5deg); text-shadow: 0 0 150px rgba(6,182,212,0.8); }
          75% { transform: scale(1.1) rotateZ(3deg); text-shadow: 0 0 100px rgba(20,184,166,0.8); }
        }
        
        @keyframes phonetic-expansion {
          0%, 100% { transform: scale(1) rotateX(0deg); box-shadow: 0 0 20px rgba(59,130,246,0.5); }
          50% { transform: scale(1.1) rotateX(360deg); box-shadow: 0 0 60px rgba(16,185,129,0.8); }
        }
        
        @keyframes meaning-revelation {
          0% { transform: scale(1) rotateY(0deg); }
          25% { transform: scale(1.1) rotateY(90deg); }
          50% { transform: scale(1.2) rotateY(180deg); }
          75% { transform: scale(1.1) rotateY(270deg); }
          100% { transform: scale(1.1) rotateY(360deg); }
        }
        
        @keyframes knowledge-panel {
          0% { transform: translateY(50px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }
        
        @keyframes title-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(16,185,129,0.5); }
          50% { text-shadow: 0 0 40px rgba(16,185,129,0.8), 0 0 60px rgba(20,184,166,0.6); }
        }
        
        @keyframes collocation-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes word-form-reveal {
          0% { transform: translateX(-50px) scale(0.8); opacity: 0; }
          100% { transform: translateX(0px) scale(1); opacity: 1; }
        }
        
        @keyframes form-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        /* APPLICATION PHASE ANIMATIONS */
        @keyframes power-wave {
          0%, 100% { transform: translateX(-200px) scale(1); opacity: 0.2; }
          50% { transform: translateX(200px) scale(2); opacity: 0.5; }
        }
        
        @keyframes power-wave-reverse {
          0%, 100% { transform: translateX(200px) scale(1); opacity: 0.2; }
          50% { transform: translateX(-200px) scale(2); opacity: 0.5; }
        }
        
        @keyframes success-star {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-30px) scale(1.5) rotate(180deg); opacity: 1; }
        }
        
        @keyframes victory-rays {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.3; }
        }
        
        @keyframes application-mastery {
          0% { transform: scale(0.2) rotateZ(-360deg); opacity: 0; }
          50% { transform: scale(1.3) rotateZ(0deg); opacity: 0.9; }
          100% { transform: scale(1) rotateZ(0deg); opacity: 1; }
        }
        
        @keyframes firework {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(2) rotate(360deg); }
        }
        
        @keyframes book-magic {
          0%, 100% { transform: scale(1) rotateY(0deg); filter: brightness(1); }
          50% { transform: scale(1.4) rotateY(180deg); filter: brightness(1.8); }
        }
        
        @keyframes book-magic-reverse {
          0%, 100% { transform: scale(1) rotateY(360deg); filter: brightness(1); }
          50% { transform: scale(1.4) rotateY(180deg); filter: brightness(1.8); }
        }
        
        @keyframes application-badge {
          0%, 100% { transform: scale(1) rotateZ(0deg); }
          50% { transform: scale(1.2) rotateZ(10deg); }
        }
        
        @keyframes word-mastery {
          0%, 100% { transform: scale(1) rotateX(0deg); text-shadow: 0 0 50px rgba(245,158,11,0.5); }
          25% { transform: scale(1.1) rotateX(90deg); text-shadow: 0 0 100px rgba(249,115,22,0.8); }
          50% { transform: scale(1.3) rotateX(180deg); text-shadow: 0 0 150px rgba(239,68,68,0.8); }
          75% { transform: scale(1.1) rotateX(270deg); text-shadow: 0 0 100px rgba(249,115,22,0.8); }
        }
        
        @keyframes example-showcase {
          0% { transform: scale(0.8) rotateY(-180deg); opacity: 0; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        
        @keyframes example-spotlight {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.4; }
        }
        
        @keyframes example-badge {
          0%, 100% { transform: scale(1) rotateZ(0deg); }
          50% { transform: scale(1.2) rotateZ(-10deg); }
        }
        
        @keyframes example-text {
          0% { transform: scale(0.9) rotateX(-30deg); opacity: 0; }
          100% { transform: scale(1) rotateX(0deg); opacity: 1; }
        }
        
        @keyframes quote-mark {
          0%, 100% { transform: scale(1) rotate(0deg); color: rgba(245,158,11,0.8); }
          50% { transform: scale(1.3) rotate(20deg); color: rgba(249,115,22,1); }
        }
        
        @keyframes quote-mark-reverse {
          0%, 100% { transform: scale(1) rotate(0deg); color: rgba(245,158,11,0.8); }
          50% { transform: scale(1.3) rotate(-20deg); color: rgba(249,115,22,1); }
        }
        
        @keyframes translation-reveal {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }
        
        @keyframes mega-listen-button {
          0%, 100% { transform: scale(1); box-shadow: 0 0 50px rgba(245,158,11,0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 100px rgba(245,158,11,0.8), 0 0 150px rgba(249,115,22,0.6); }
        }
        
        @keyframes sound-wave {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(90deg); }
          50% { transform: scale(1.4) rotate(180deg); }
          75% { transform: scale(1.2) rotate(270deg); }
        }
        
        @keyframes success-icon {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.5) rotate(360deg); }
        }
        
        /* Animation Classes */
        .animate-knowledge-wave {
          animation: knowledge-wave 4s ease-in-out infinite;
        }
        
        .animate-knowledge-wave-reverse {
          animation: knowledge-wave-reverse 5s ease-in-out infinite;
        }
        
        .animate-knowledge-orb {
          animation: knowledge-orb 6s ease-in-out infinite;
        }
        
        .animate-expansion-bloom {
          animation: expansion-bloom 3s ease-out;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-enlightenment {
          animation: enlightenment 4s linear infinite;
        }
        
        .animate-enlightenment-reverse {
          animation: enlightenment-reverse 4s linear infinite;
        }
        
        .animate-knowledge-badge {
          animation: knowledge-badge 3s ease-in-out infinite;
        }
        
        .animate-word-expansion {
          animation: word-expansion 5s ease-in-out infinite;
        }
        
        .animate-phonetic-expansion {
          animation: phonetic-expansion 3s ease-in-out infinite;
        }
        
        .animate-meaning-revelation {
          animation: meaning-revelation 4s ease-in-out infinite;
        }
        
        .animate-knowledge-panel {
          animation: knowledge-panel 1.5s ease-out;
        }
        
        .animate-title-glow {
          animation: title-glow 2s ease-in-out infinite;
        }
        
        .animate-collocation-float {
          animation: collocation-float 3s ease-in-out infinite;
        }
        
        .animate-word-form-reveal {
          animation: word-form-reveal 1s ease-out;
        }
        
        .animate-form-float {
          animation: form-float 2s ease-in-out infinite;
        }
        
        .animate-power-wave {
          animation: power-wave 3s ease-in-out infinite;
        }
        
        .animate-power-wave-reverse {
          animation: power-wave-reverse 4s ease-in-out infinite;
        }
        
        .animate-success-star {
          animation: success-star 4s ease-in-out infinite;
        }
        
        .animate-victory-rays {
          animation: victory-rays 6s ease-in-out infinite;
        }
        
        .animate-application-mastery {
          animation: application-mastery 4s ease-out;
        }
        
        .animate-firework {
          animation: firework 3s ease-in-out infinite;
        }
        
        .animate-book-magic {
          animation: book-magic 3s ease-in-out infinite;
        }
        
        .animate-book-magic-reverse {
          animation: book-magic-reverse 3s ease-in-out infinite;
        }
        
        .animate-application-badge {
          animation: application-badge 2s ease-in-out infinite;
        }
        
        .animate-word-mastery {
          animation: word-mastery 6s ease-in-out infinite;
        }
        
        .animate-example-showcase {
          animation: example-showcase 2s ease-out;
        }
        
        .animate-example-spotlight {
          animation: example-spotlight 4s ease-in-out infinite;
        }
        
        .animate-example-badge {
          animation: example-badge 2s ease-in-out infinite;
        }
        
        .animate-example-text {
          animation: example-text 1.5s ease-out;
        }
        
        .animate-quote-mark {
          animation: quote-mark 3s ease-in-out infinite;
        }
        
        .animate-quote-mark-reverse {
          animation: quote-mark-reverse 3s ease-in-out infinite;
        }
        
        .animate-translation-reveal {
          animation: translation-reveal 1.5s ease-out 0.5s both;
        }
        
        .animate-mega-listen-button {
          animation: mega-listen-button 3s ease-in-out infinite;
        }
        
        .animate-sound-wave {
          animation: sound-wave 2s linear infinite;
        }
        
        .animate-success-icon {
          animation: success-icon 3s ease-in-out infinite;
        }
        
        /* SUMMARY PHASE ANIMATIONS */
        @keyframes celebration-float {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-40px) scale(1.5) rotate(180deg); opacity: 1; }
        }
        
        @keyframes summary-celebration {
          0% { transform: scale(0.5) rotateY(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotateY(0deg); opacity: 0.9; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        
        @keyframes final-word-celebration {
          0%, 100% { transform: scale(1) rotateZ(0deg); text-shadow: 0 0 50px rgba(147,51,234,0.5); }
          25% { transform: scale(1.1) rotateZ(5deg); text-shadow: 0 0 100px rgba(236,72,153,0.8); }
          50% { transform: scale(1.2) rotateZ(-5deg); text-shadow: 0 0 150px rgba(59,130,246,0.8); }
          75% { transform: scale(1.1) rotateZ(3deg); text-shadow: 0 0 100px rgba(236,72,153,0.8); }
        }
        
        .animate-celebration-float {
          animation: celebration-float 5s ease-in-out infinite;
        }
        
        .animate-summary-celebration {
          animation: summary-celebration 2s ease-out;
        }
        
        .animate-final-word-celebration {
          animation: final-word-celebration 4s ease-in-out infinite;
        }
        
        /* HIGH INTENSITY CHAOS EFFECTS */
        @keyframes chaos-lightning {
          0%, 100% { opacity: 0.3; transform: translateX(-200px) rotate(15deg); }
          25% { opacity: 0.8; transform: translateX(50px) rotate(-10deg); }
          50% { opacity: 0.9; transform: translateX(200px) rotate(20deg); }
          75% { opacity: 0.7; transform: translateX(-50px) rotate(-15deg); }
        }
        
        @keyframes chaos-lightning-reverse {
          0%, 100% { opacity: 0.2; transform: translateX(200px) rotate(-20deg); }
          25% { opacity: 0.7; transform: translateX(-100px) rotate(25deg); }
          50% { opacity: 0.9; transform: translateX(-250px) rotate(-10deg); }
          75% { opacity: 0.6; transform: translateX(100px) rotate(15deg); }
        }
        
        @keyframes explosive-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.1; }
          25% { transform: scale(1.3) rotate(90deg); opacity: 0.3; }
          50% { transform: scale(1.8) rotate(180deg); opacity: 0.2; }
          75% { transform: scale(1.5) rotate(270deg); opacity: 0.25; }
        }
        
        .animate-chaos-lightning {
          animation: chaos-lightning 0.8s linear infinite;
        }
        
        .animate-chaos-lightning-reverse {
          animation: chaos-lightning-reverse 1.2s linear infinite;
        }
        
        .animate-explosive-pulse {
          animation: explosive-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Back button - always visible */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="fixed top-4 left-4 z-60 bg-white/80 backdrop-blur-sm hover:bg-white/90"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      {/* Phase content */}
      {phase === "priming" && renderPrimingPhase()}
      {phase === "drilling" && renderDrillingPhase()}
      {phase === "expansion" && renderExpansionPhase()}
      {phase === "application" && renderApplicationPhase()}
      {phase === "summary" && renderSummaryPhase()}
      {phase === "completed" && renderCompletedPhase()}
    </div>
  );
}