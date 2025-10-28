"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { type LexicalItem } from "../reading/utils/textProcessing";
import { AudioEffectsManager } from "./audio/AudioEffects";
import { generateCardPattern, selectPattern, type DrillingInstance, type IntensityPhase } from "./patterns/CardPatternGenerator";
import { Target, Badge, Volume2, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import "./styles/VocabularyAnimations.css";

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
  const [randomTextStyle, setRandomTextStyle] = useState(1);
  const [randomMeaningStyle, setRandomMeaningStyle] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

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

        // Time-lapse effect activation (6s-12s period) with controlled end
        const isTimeLapseActive = speechCount >= 5 && speechCount <= 10;

        // Generate random text styles during time-lapse
        if (isTimeLapseActive) {
          setRandomTextStyle(Math.floor(Math.random() * 3) + 1); // 1, 2, or 3
          setRandomMeaningStyle(Math.floor(Math.random() * 3) + 1); // 1, 2, or 3
        }

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
          // Learning complete - immediate cleanup to prevent lag
          setIsCompleting(true);
          setDrillingInstances([]);
          setIsElectricShock(false);
          setProgress(100);

          // Quick exit without heavy animations
          setTimeout(() => {
            onBack();
          }, 300);
        } else if (speechCount >= totalSpeechCycles - 1) {
          // Start reducing effects one cycle before completion
          setIsCompleting(true);
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
          {!isCompleting && [...Array(drillingTime >= 6 && drillingTime <= 12 ? Math.min(bgConfig.particleCount * 2, 80) : Math.min(bgConfig.particleCount, 40))].map((_, i) => (
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
                {/* <div className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white px-2 py-1 rounded opacity-50">
                  {instance.pattern}
                </div> */}
              </Card>
            </div>
          );
        })}

        {/* Dimming Overlay During Time-lapse (6s-12s) */}
        {drillingTime >= 6 && drillingTime <= 12 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-all duration-1000"></div>
        )}

        {/* Fixed Central Word and Meaning - Floating Effect During Time-lapse */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className={`text-center transition-all duration-1000 ${drillingTime >= 6 && drillingTime <= 12
            ? 'transform translate-y-[-20px] scale-110 animate-floating-focus'
            : 'transform translate-y-0 scale-100'
            }`}>
            {/* Word with random style changes during time-lapse */}
            <div className={`text-8xl mb-8 transition-all duration-800 ${isElectricShock
              ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)] font-black'
              : drillingTime >= 6 && drillingTime <= 12
                ? `text-white drop-shadow-[0_0_40px_rgba(255,255,255,1)] transform scale-115 animate-random-text-style-${randomTextStyle}`
                : intensityPhase === 'low'
                  ? 'text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] transform scale-100 font-black'
                  : intensityPhase === 'medium'
                    ? 'text-white drop-shadow-[0_0_25px_rgba(147,51,234,0.8)] transform scale-105 italic font-black'
                    : 'text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] transform scale-110 font-extrabold underline'
              }`}>
              {cleanTargetWord}
            </div>

            {/* Meaning with random style changes during time-lapse */}
            <div className={`text-4xl transition-all duration-800 ${isElectricShock
              ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)] font-bold'
              : drillingTime >= 6 && drillingTime <= 12
                ? `text-yellow-100 drop-shadow-[0_0_30px_rgba(255,255,0,1)] transform scale-115 animate-random-meaning-style-${randomMeaningStyle}`
                : intensityPhase === 'low'
                  ? 'text-yellow-300 drop-shadow-[0_0_15px_rgba(255,255,0,0.6)] transform scale-100 font-bold'
                  : intensityPhase === 'medium'
                    ? 'text-yellow-200 drop-shadow-[0_0_18px_rgba(255,255,0,0.7)] transform scale-105 italic font-bold'
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden"
    // Fixed time-lapse timing and prevent chaotic flashing
    // style={{ 
    //   ...(isCompleting && { filter: 'brightness(1)', transition: 'all 0.5s ease-out' })
    // }}
    >


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
      {/* {phase === "expansion" && renderExpansionPhase()}
      {phase === "application" && renderApplicationPhase()}
      {phase === "summary" && renderSummaryPhase()}
      {phase === "completed" && renderCompletedPhase()} */}
    </div>
  );
}