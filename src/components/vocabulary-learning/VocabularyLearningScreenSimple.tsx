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
  const [drillingTime, setDrillingTime] = useState(0);
  const [intensityPhase, setIntensityPhase] = useState<'low' | 'medium' | 'high'>('low');
  const [showCentralCard, setShowCentralCard] = useState(true);
  const [summaryCountdown, setSummaryCountdown] = useState(5);
  const [drillingInstances, setDrillingInstances] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const instanceCounterRef = useRef(0);

  // Clean vocabulary text by removing grammar annotations
  const cleanVocabularyText = (text: string) => {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const cleanTargetWord = cleanVocabularyText(lexicalItem.targetLexeme);

  // Initialize Audio Context
  const initAudioContext = () => {
    if (!audioContextRef.current && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
  };

  // Simple audio function
  const playSound = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Speech synthesis
  const speakText = (text: string, rate: number = 0.8) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanVocabularyText(text));
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Phase 1: Priming
  useEffect(() => {
    if (phase === "priming") {
      initAudioContext();
      playSound(220, 0.5, 0.08);
      
      const timer = setTimeout(() => {
        setPhase("drilling");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 2: Simple drilling with 3 phases
  useEffect(() => {
    if (phase === "drilling") {
      setDrillingTime(0);
      setProgress(0);
      
      const mainTimer = setInterval(() => {
        setDrillingTime(prev => {
          const newTime = prev + 0.2;
          
          // Update intensity
          if (newTime <= 5) {
            setIntensityPhase('low');
          } else if (newTime <= 12) {
            setIntensityPhase('medium');
          } else if (newTime <= 15) {
            setIntensityPhase('high');
          } else {
            setPhase("expansion");
            return 15;
          }
          
          // Update progress
          setProgress((newTime / 15) * 100);
          
          // Card visibility
          if ((newTime >= 3 && newTime <= 6) || (newTime >= 9 && newTime <= 13)) {
            setShowCentralCard(false);
          } else {
            setShowCentralCard(true);
          }
          
          return newTime;
        });
      }, 200);

      // Drilling instances
      const instanceTimer = setInterval(() => {
        const count = intensityPhase === 'low' ? 1 : intensityPhase === 'medium' ? 2 : 3;
        
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
            }, 1500);
          }, i * 100);
        }
      }, 500);

      // Speech
      const speechTimer = setInterval(() => {
        const rate = intensityPhase === 'low' ? 0.6 : intensityPhase === 'medium' ? 0.8 : 1.0;
        speakText(lexicalItem.targetLexeme, rate);
        
        const freq = intensityPhase === 'low' ? 220 : intensityPhase === 'medium' ? 330 : 440;
        playSound(freq, 0.1, 0.08);
      }, 1000);

      return () => {
        clearInterval(mainTimer);
        clearInterval(instanceTimer);
        clearInterval(speechTimer);
      };
    }
  }, [phase, lexicalItem.targetLexeme]);

  // Phase 3: Expansion
  useEffect(() => {
    if (phase === "expansion") {
      setDrillingInstances([]);
      playSound(440, 0.8, 0.1);
      
      const timer = setTimeout(() => {
        setPhase("application");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 4: Application
  useEffect(() => {
    if (phase === "application") {
      if (lexicalItem.phase3Production?.content) {
        setTimeout(() => {
          speakText(lexicalItem.phase3Production.content, 0.8);
        }, 500);
      }
      
      const timer = setTimeout(() => {
        setPhase("summary");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [phase, lexicalItem]);

  // Phase 5: Summary
  useEffect(() => {
    if (phase === "summary") {
      setSummaryCountdown(5);
      playSound(523, 0.5, 0.1);
      
      const timer = setInterval(() => {
        setSummaryCountdown(prev => {
          if (prev <= 1) {
            setPhase("completed");
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [phase, onComplete]);

  const getBgGradient = () => {
    switch (intensityPhase) {
      case 'low': return 'from-slate-800 via-blue-900 to-purple-800';
      case 'medium': return 'from-purple-900 via-pink-900 to-red-800';
      case 'high': return 'from-red-900 via-orange-900 to-yellow-800';
      default: return 'from-slate-800 via-blue-900 to-purple-800';
    }
  };

  const getWordSize = () => {
    switch (intensityPhase) {
      case 'low': return 'text-7xl';
      case 'medium': return 'text-8xl';
      case 'high': return 'text-9xl';
      default: return 'text-7xl';
    }
  };

  if (phase === "priming") {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center overflow-hidden">
        <Card className="p-12 bg-white/95 backdrop-blur-lg border-0 shadow-[0_0_100px_rgba(147,51,234,0.5)]">
          <div className="text-2xl text-gray-700 leading-relaxed text-center">
            <span className="blur-md opacity-50">...context here...</span>
            <span className="mx-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-6 py-3 rounded-lg font-black text-white text-3xl">
              {cleanTargetWord}
              <span className="absolute -top-4 -right-4 text-red-400 text-4xl animate-bounce">❓</span>
            </span>
            <span className="blur-md opacity-50">...more context...</span>
          </div>
        </Card>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (phase === "drilling") {
    return (
      <div className={`fixed inset-0 z-50 min-h-screen bg-gradient-to-br ${getBgGradient()} flex items-center justify-center overflow-hidden transition-all duration-1000`}>
        {/* Drilling instances */}
        {drillingInstances.map((instance) => (
          <div
            key={instance.id}
            className="absolute animate-pulse"
            style={{
              left: `${instance.x}%`,
              top: `${instance.y}%`,
              opacity: instance.opacity,
            }}
          >
            <Card className="p-4 bg-white/20 backdrop-blur-sm border-white/30 text-white text-center">
              <div className="font-bold text-lg">{cleanTargetWord}</div>
              <div className="text-sm">{lexicalItem.phase2Annotation?.translationVI}</div>
            </Card>
          </div>
        ))}

        {/* Central card */}
        {showCentralCard && (
          <Card className="p-16 bg-white/95 backdrop-blur-xl border-0 max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <Badge className="text-2xl px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600">
                {intensityPhase.toUpperCase()} PHASE
              </Badge>
              
              <div className={`${getWordSize()} font-black text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text`}>
                {cleanTargetWord}
              </div>
              
              <div className="text-4xl font-black text-green-600">
                {lexicalItem.phase2Annotation?.translationVI}
              </div>
              
              <div className="text-xl text-blue-600 font-mono opacity-60">
                {lexicalItem.phase2Annotation?.phonetic}
              </div>
              
              <div className="text-lg font-bold text-white bg-black/50 px-4 py-2 rounded-full inline-block">
                {drillingTime.toFixed(1)}s
              </div>
            </div>
          </Card>
        )}

        {/* Progress */}
        <div className="fixed bottom-8 left-8 right-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
            <Progress value={progress} className="h-3" />
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (phase === "expansion") {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-3xl mx-auto text-center">
          <div className="space-y-6">
            <Badge className="text-lg px-4 py-2 bg-emerald-600">EXPANDING KNOWLEDGE</Badge>
            <div className="text-4xl font-bold text-emerald-900">{cleanTargetWord}</div>
            <div className="text-2xl text-gray-600 font-mono">{lexicalItem.phase2Annotation?.phonetic}</div>
            <div className="text-2xl font-semibold text-emerald-900">
              {lexicalItem.phase2Annotation?.translationVI} • {lexicalItem.phase2Annotation?.definitionEN}
            </div>
          </div>
        </Card>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (phase === "application") {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-amber-900 to-orange-900 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <Badge className="text-lg px-4 py-2 bg-amber-600">PRACTICAL APPLICATION</Badge>
            <div className="text-3xl font-bold text-amber-900">{cleanTargetWord}</div>
            
            {lexicalItem.phase3Production?.content && (
              <div className="bg-amber-50 p-8 rounded-lg">
                <div className="text-xl text-gray-800 mb-4">{lexicalItem.phase3Production.content}</div>
                <Button
                  onClick={() => speakText(lexicalItem.phase3Production?.content || '')}
                  className="mt-4"
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Nghe ví dụ
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  if (phase === "summary") {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <Card className="p-12 bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl mx-auto text-center">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Clock className="w-8 h-8 text-purple-600 animate-spin" />
              <div className="text-4xl font-bold text-purple-600">{summaryCountdown}</div>
            </div>
            <div className="text-4xl">🎉 HOÀN THÀNH! 🎉</div>
            <div className="text-3xl font-bold text-purple-900">{cleanTargetWord}</div>
            <div className="text-xl text-gray-700">
              Tự động quay lại trong {summaryCountdown} giây...
            </div>
            <Button onClick={onBack} size="lg" className="w-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại ngay
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Completed phase
  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center">
      <Card className="p-12 bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl mx-auto text-center">
        <div className="space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold text-green-900">Hoàn thành!</h2>
          <p className="text-lg text-gray-700">
            Bạn đã học xong từ vựng <strong>{cleanTargetWord}</strong>
          </p>
          <Button onClick={onBack} size="lg" className="w-full">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại đọc
          </Button>
        </div>
      </Card>
    </div>
  );
}