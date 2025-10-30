import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type LexicalItem, isCollocateArray, type CollocateObject } from "@/types/lexical";

interface ExpansionPhaseProps {
  cleanTargetWord: string;
  lexicalItem: LexicalItem;
  expandedMeaning: boolean;
}

export function ExpansionPhase({
  cleanTargetWord,
  lexicalItem,
  expandedMeaning
}: ExpansionPhaseProps) {
  return (
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
                {(() => {
                  const collocates = lexicalItem.phase2Annotation.relatedCollocates;
                  let collocationList: Array<{ form: string; meaning?: string }> = [];

                  if (isCollocateArray(collocates)) {
                    // New format: Array of CollocateObject
                    collocationList = collocates;
                  } else if (Array.isArray(collocates)) {
                    // Old format: Array of strings
                    collocationList = collocates.map(c => ({ form: c }));
                  } else if (typeof collocates === 'string') {
                    // Old format: Single string
                    collocationList = [{ form: collocates }];
                  }

                  return collocationList.map((collocation, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-lg px-4 py-2 border-2 border-emerald-400 bg-white/80 hover:bg-emerald-100 transform hover:scale-110 transition-all duration-300 animate-collocation-float shadow-lg"
                      style={{ animationDelay: `${index * 0.2}s` }}
                      title={collocation.meaning}
                    >
                      {collocation.form}
                      {collocation.meaning && (
                        <span className="ml-2 text-xs text-emerald-600">({collocation.meaning})</span>
                      )}
                    </Badge>
                  ));
                })()}
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
}