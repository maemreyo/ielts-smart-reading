"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, BookOpen, Target, Lightbulb, Zap, Clock } from "lucide-react";
import { type LexicalItem } from "../reading/utils/textProcessing";

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
  const [phase, setPhase] = useState<LearningPhase>("priming");
  const [progress, setProgress] = useState(0);
  const [drillingInstances, setDrillingInstances] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  const [expandedMeaning, setExpandedMeaning] = useState(false);
  const [showCentralCard, setShowCentralCard] = useState(true);
  const [summaryCountdown, setSummaryCountdown] = useState(5);
  const [expansionCountdown, setExpansionCountdown] = useState(5);
  const [applicationCountdown, setApplicationCountdown] = useState(5);
  const [currentSpeechRate, setCurrentSpeechRate] = useState(0.6); // Start slower for gradual build
  const [intensityPhase, setIntensityPhase] = useState<'low' | 'medium' | 'high'>('low');
  const [drillingTime, setDrillingTime] = useState(0);
  const [isElectricShock, setIsElectricShock] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const drillingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const summaryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundMusicRef = useRef<NodeJS.Timeout | null>(null);
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

  // Initialize Audio Context for background sounds
  const initAudioContext = () => {
    if (!audioContextRef.current && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
  };

  // Advanced Audio System with Multiple Sound Types

  // Create rhythmic background beats with different wave types
  const playBackgroundBeat = (frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, audioContextRef.current.currentTime);

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Dynamic drilling beat that scales with intensity
  const playDrillingBeat = (phase: 'low' | 'medium' | 'high') => {
    if (!audioContextRef.current) return;

    const configs = {
      low: {
        mainFreq: 220, mainVol: 0.08, mainDur: 0.2,
        bassFreq: 110, bassVol: 0.05, bassDur: 0.25,
        hihatFreq: 800, hihatVol: 0.04, hihatDur: 0.08,
        layers: 1
      },
      medium: {
        mainFreq: 330, mainVol: 0.12, mainDur: 0.15,
        bassFreq: 165, bassVol: 0.08, bassDur: 0.2,
        hihatFreq: 1200, hihatVol: 0.06, hihatDur: 0.06,
        layers: 2
      },
      high: {
        mainFreq: 440, mainVol: 0.16, mainDur: 0.1,
        bassFreq: 220, bassVol: 0.12, bassDur: 0.15,
        hihatFreq: 1600, hihatVol: 0.08, hihatDur: 0.04,
        layers: 3
      }
    };

    const config = configs[phase];

    // Main beat
    playBackgroundBeat(config.mainFreq, config.mainDur, config.mainVol, 'square');

    // Sub bass
    playBackgroundBeat(config.bassFreq, config.bassDur, config.bassVol, 'sawtooth');

    // High hat
    setTimeout(() =>
      playBackgroundBeat(config.hihatFreq, config.hihatDur, config.hihatVol, 'triangle'), 30
    );

    // Additional layers for higher intensity
    if (config.layers >= 2) {
      setTimeout(() =>
        playBackgroundBeat(config.mainFreq * 1.5, config.mainDur * 0.8, config.mainVol * 0.7, 'triangle'), 60
      );
    }

    if (config.layers >= 3) {
      setTimeout(() =>
        playBackgroundBeat(config.bassFreq * 0.5, config.bassDur * 1.2, config.bassVol * 0.8, 'sawtooth'), 90
      );
      setTimeout(() =>
        playBackgroundBeat(config.hihatFreq * 1.5, config.hihatDur * 0.6, config.hihatVol * 0.9, 'square'), 120
      );
    }
  };

  // Bass drop effect
  const playBassDrop = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, audioContextRef.current.currentTime + 0.8);

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContextRef.current.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.8);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.8);
  };

  // Create epic success chord progression
  const playSuccessSound = () => {
    if (!audioContextRef.current) return;

    // Major chord progression: C - E - G - C (higher)
    const chordProgression = [
      [523.25, 659.25, 783.99], // C Major
      [659.25, 830.61, 987.77], // E Major
      [783.99, 987.77, 1174.66] // G Major
    ];

    chordProgression.forEach((chord, chordIndex) => {
      chord.forEach((freq, noteIndex) => {
        setTimeout(() => {
          playBackgroundBeat(freq, 0.6, 0.1, 'triangle');
        }, chordIndex * 200 + noteIndex * 50);
      });
    });
  };

  // Victory fanfare
  const playVictoryFanfare = () => {
    if (!audioContextRef.current) return;

    const melody = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    melody.forEach((freq, index) => {
      setTimeout(() => {
        playBackgroundBeat(freq, 0.4, 0.12, 'triangle');
      }, index * 150);
    });

    // Add bass line
    setTimeout(() => {
      playBackgroundBeat(130.81, 1.5, 0.1, 'sawtooth'); // C bass
    }, 300);
  };

  // Speech synthesis for pronunciation with dynamic rate
  const speakText = (text: string, rate?: number) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanVocabularyText(text));
      utterance.lang = 'en-US';
      utterance.rate = rate || currentSpeechRate;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Phase 1: Priming (2 seconds)
  useEffect(() => {
    if (phase === "priming") {
      initAudioContext();
      // Play a gentle intro sound
      setTimeout(() => {
        playBackgroundBeat(220, 0.5, 0.08, 'sine'); // Low A note
        playBassDrop(); // Add bass drop for impact
      }, 500);

      const timer = setTimeout(() => {
        setPhase("drilling");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 2: FIXED 3-PHASE PROGRESSIVE DRILLING SYSTEM (15 seconds total)
  useEffect(() => {
    if (phase === "drilling") {
      setDrillingTime(0);
      setIntensityPhase('low');
      setProgress(0);
      
      let localTime = 0;
      let localIntensity: 'low' | 'medium' | 'high' = 'low';

      // Main time tracker
      const timeTracker = setInterval(() => {
        localTime += 0.1;
        setDrillingTime(localTime);

        // Update intensity
        if (localTime <= 5) {
          localIntensity = 'low';
          setIntensityPhase('low');
        } else if (localTime <= 12) {
          localIntensity = 'medium';
          setIntensityPhase('medium');
        } else if (localTime <= 15) {
          localIntensity = 'high';
          setIntensityPhase('high');
        } else {
          setPhase("expansion");
          return;
        }

        // Update progress
        setProgress(Math.round(Math.min((localTime / 15) * 100, 99)));

        // Card visibility
        if ((localTime >= 3 && localTime <= 6) || (localTime >= 9 && localTime <= 13)) {
          setShowCentralCard(false);
        } else {
          setShowCentralCard(true);
        }
      }, 100);

      // Drilling instances - fixed intervals
      const instanceTimer = setInterval(() => {
        const count = localIntensity === 'low' ? 1 : localIntensity === 'medium' ? 2 : 4;
        const duration = localIntensity === 'low' ? 2000 : localIntensity === 'medium' ? 1500 : 1000;
        
        for (let i = 0; i < count; i++) {
          setTimeout(() => {
            const newInstance = {
              id: instanceCounterRef.current++,
              x: Math.random() * 80 + 10,
              y: Math.random() * 80 + 10,
              opacity: 1,
            };

            setDrillingInstances(prev => [...prev, newInstance]);

            setTimeout(() => {
              setDrillingInstances(prev => prev.filter(instance => instance.id !== newInstance.id));
            }, duration);
          }, i * 50);
        }
      }, 400);

      // Speech pattern - fixed interval
      const speechTimer = setInterval(() => {
        const rate = localIntensity === 'low' ? 0.6 : localIntensity === 'medium' ? 0.8 : 1.1;
        setCurrentSpeechRate(rate);
        speakText(lexicalItem.targetLexeme, rate);
        playDrillingBeat(localIntensity);
        
        // Trigger electric shock effect randomly for brain impact
        if (Math.random() < 0.4) { // 40% chance
          setTimeout(() => triggerElectricShock(), Math.random() * 500);
        }
        
        // Additional shock triggers for high intensity
        if (localIntensity === 'high' && Math.random() < 0.3) {
          setTimeout(() => triggerElectricShock(), Math.random() * 300 + 200);
        }
      }, 900);

      // Bass pattern - fixed interval
      const bassTimer = setInterval(() => {
        const volume = localIntensity === 'low' ? 0.05 : localIntensity === 'medium' ? 0.08 : 0.12;
        playBackgroundBeat(110, 0.25, volume, 'sawtooth');

        if (localIntensity === 'high') {
          setTimeout(() => playBackgroundBeat(60, 0.1, 0.15, 'square'), 100);
          setTimeout(() => playBackgroundBeat(220, 0.15, 0.1, 'triangle'), 200);
        }
      }, 1200);

      return () => {
        clearInterval(timeTracker);
        clearInterval(instanceTimer);
        clearInterval(speechTimer);
        clearInterval(bassTimer);
      };
    }
  }, [phase, lexicalItem.targetLexeme]);

  // Phase 3: Expansion with countdown
  useEffect(() => {
    if (phase === "expansion") {
      setDrillingInstances([]); // Clear drilling instances
      setExpansionCountdown(5);

      // Play expansion sound with layered effect
      playBackgroundBeat(440, 1.0, 0.1, 'triangle'); // A note for expansion
      setTimeout(() => playBackgroundBeat(880, 0.8, 0.08, 'sine'), 200); // Higher harmony

      setTimeout(() => {
        setExpandedMeaning(true);
        // Play epic enlightenment chord
        playSuccessSound();
        setTimeout(() => playVictoryFanfare(), 400); // Add fanfare
      }, 500);

      // Countdown timer
      const expansionTimer = setInterval(() => {
        setExpansionCountdown(prev => {
          if (prev > 1) {
            playBackgroundBeat(600, 0.1, 0.08, 'triangle'); // Higher tick sound
          }
          if (prev <= 1) {
            setPhase("application");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(expansionTimer);
      };
    }
  }, [phase]);

  // Phase 4: Application with countdown
  useEffect(() => {
    if (phase === "application") {
      setApplicationCountdown(5);

      // Speak the example sentence
      setTimeout(() => {
        if (lexicalItem.phase3Production?.content) {
          speakText(lexicalItem.phase3Production.content, 0.9);
        }
      }, 500);

      // Final rapid repetition with controlled speed
      setTimeout(() => {
        const rapidSpeak = () => {
          speakText(lexicalItem.targetLexeme, 1.0);
        };

        for (let i = 0; i < 2; i++) { // Reduced to 2 for faster pace
          setTimeout(rapidSpeak, i * 300);
        }
      }, 1500);

      // Countdown timer
      const applicationTimer = setInterval(() => {
        setApplicationCountdown(prev => {
          if (prev > 1) {
            playBackgroundBeat(700, 0.1, 0.09, 'square'); // Even higher tick sound
          }
          if (prev <= 1) {
            setPhase("summary");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(applicationTimer);
      };
    }
  }, [phase, lexicalItem]);

  // Phase 5: Summary with countdown
  useEffect(() => {
    if (phase === "summary") {
      setSummaryCountdown(5);

      // Play epic celebration sound sequence
      playVictoryFanfare();
      setTimeout(() => playSuccessSound(), 600);
      setTimeout(() => playVictoryFanfare(), 1200);
      setTimeout(() => playBassDrop(), 1800); // Epic bass drop

      summaryIntervalRef.current = setInterval(() => {
        setSummaryCountdown(prev => {
          // Play dramatic countdown tick sound
          if (prev > 1) {
            playBackgroundBeat(800, 0.12, 0.1, 'triangle'); // Highest tick sound
            // Add harmonic
            setTimeout(() => playBackgroundBeat(1600, 0.08, 0.06, 'sine'), 50);
          }

          if (prev <= 1) {
            setPhase("completed");
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (summaryIntervalRef.current) {
          clearInterval(summaryIntervalRef.current);
        }
      };
    }
  }, [phase, onComplete]);

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

        {/* Mega Drilling Instances with Explosive Effects */}
        {drillingInstances.map((instance) => (
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
            <Card className={`p-6 ${isElectricShock ? 'bg-black border-white' : 'bg-gradient-to-br from-white/90 to-white/70 border-white/50'} backdrop-blur-xl border-2 text-center transform rotate-3 hover:rotate-0 transition-all duration-150 shadow-[0_0_50px_rgba(255,255,255,0.5)]`}>
              <div className={`font-black text-3xl ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'} animate-text-glow mb-2`}>
                {cleanTargetWord}
              </div>
              <div className={`text-2xl font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : 'text-red-600'} animate-meaning-flash mb-2`}>
                {lexicalItem.phase2Annotation?.translationVI}
              </div>
              <div className={`text-sm mt-1 font-mono ${isElectricShock ? 'text-white animate-flash-bright' : 'text-blue-600'} opacity-60`}>
                {lexicalItem.phase2Annotation?.phonetic}
              </div>
            </Card>
          </div>
        ))}

        {/* DYNAMIC Central Learning Block with Progressive Intensity */}
        {showCentralCard && (() => {
          const getCardConfig = () => {
            switch (intensityPhase) {
              case 'low':
                return {
                  cardClass: 'p-12 max-w-3xl transform scale-95',
                  shadowColor: 'shadow-[0_0_100px_rgba(59,130,246,0.6)]',
                  headerBadge: '🌊 GENTLE DRILLING 🌊',
                  headerColors: 'from-blue-600 to-purple-600',
                  wordSize: 'text-7xl',
                  wordColors: 'from-blue-600 via-purple-600 to-indigo-600',
                  meaningSize: 'text-4xl',
                  meaningColors: 'from-green-600 via-teal-600 to-blue-600',
                  iconSize: 'w-12 h-12'
                };
              case 'medium':
                return {
                  cardClass: 'p-14 max-w-4xl transform scale-100',
                  shadowColor: 'shadow-[0_0_200px_rgba(147,51,234,0.8)]',
                  headerBadge: '⚡ MEGA DRILLING ⚡',
                  headerColors: 'from-purple-600 to-pink-600',
                  wordSize: 'text-8xl',
                  wordColors: 'from-purple-600 via-pink-600 to-red-600',
                  meaningSize: 'text-5xl',
                  meaningColors: 'from-green-600 via-blue-600 to-purple-600',
                  iconSize: 'w-14 h-14'
                };
              case 'high':
                return {
                  cardClass: 'p-20 max-w-6xl transform scale-110',
                  shadowColor: 'shadow-[0_0_300px_rgba(239,68,68,0.9)]',
                  headerBadge: '🔥 EXPLOSIVE DRILLING 🔥',
                  headerColors: 'from-red-600 to-yellow-500',
                  wordSize: 'text-9xl',
                  wordColors: 'from-red-600 via-orange-500 to-yellow-500',
                  meaningSize: 'text-6xl',
                  meaningColors: 'from-orange-600 via-red-600 to-yellow-600',
                  iconSize: 'w-20 h-20'
                };
            }
          };

          const config = getCardConfig();

          return (
            <Card className={`${config.cardClass} ${isElectricShock ? 'bg-black border-white border-4' : 'bg-gradient-to-br from-white via-purple-50 to-pink-50 border-0'} backdrop-blur-xl ${config.shadowColor} mx-auto text-center animate-mega-pulse transition-all duration-150`}>
              <div className="space-y-8">

                {/* DYNAMIC Word Display - Scales with Intensity */}
                <div className={`${config.wordSize} font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)]' : `text-transparent bg-gradient-to-r ${config.wordColors} bg-clip-text`} animate-mega-word-pulse drop-shadow-2xl mb-6 transition-all duration-150`}>
                  {cleanTargetWord}
                </div>

                {/* DYNAMIC Translation - Scales with Intensity */}
                <div className={`${config.meaningSize} font-black ${isElectricShock ? 'text-white animate-flash-bright drop-shadow-[0_0_30px_rgba(255,255,255,1)]' : `bg-gradient-to-r ${config.meaningColors} bg-clip-text text-transparent`} animate-rainbow-text mb-8 transition-all duration-150`}>
                  {lexicalItem.phase2Annotation?.translationVI}
                </div>

                {/* Timing Display */}
                <div className={`text-xl font-bold ${isElectricShock ? 'text-white bg-black' : 'text-white bg-black/50'} px-4 py-2 rounded-full inline-block transition-all duration-150`}>
                  {intensityPhase.toUpperCase()} PHASE: {drillingTime.toFixed(1)}s
                </div>

                {/* Dimmed Phonetic */}
                <div className={`text-xl ${isElectricShock ? 'text-white bg-black' : 'text-blue-600 bg-white/30 border-blue-200'} font-mono px-6 py-3 rounded-full border-2 opacity-60 mb-6 transition-all duration-150`}>
                  {lexicalItem.phase2Annotation?.phonetic}
                </div>

                {/* Dimmed Button */}
                {/* <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => speakText(lexicalItem.targetLexeme)}
                  className="mt-6 text-lg p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 transform transition-all duration-300 shadow-xl opacity-70"
                >
                  <Volume2 className="w-6 h-6 mr-3" />
                  NGHE PHÁT ÂM
                </Button> */}
              </div>
            </Card>
          );
        })()}

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

          <div className="text-3xl text-blue-800 font-mono bg-white/60 px-8 py-4 rounded-full border-4 border-emerald-300 animate-phonetic-expansion shadow-2xl">
            {lexicalItem.phase2Annotation?.phonetic}
          </div>

          <div className={`text-3xl font-black transition-all duration-2000 transform ${expandedMeaning
            ? "text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text scale-110 animate-meaning-revelation"
            : "text-gray-600 scale-100"
            }`}>
            {expandedMeaning
              ? `${lexicalItem.phase2Annotation?.translationVI} ⚡ ${lexicalItem.phase2Annotation?.definitionEN}`
              : lexicalItem.phase2Annotation?.translationVI
            }
          </div>

          {expandedMeaning && lexicalItem.phase2Annotation?.relatedCollocates && (
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
          )}

          {expandedMeaning && lexicalItem.phase2Annotation?.wordForms && (
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
          )}
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
                onClick={() => speakText(lexicalItem.phase3Production?.content || '')}
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
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        
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