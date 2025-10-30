import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BookText, FlipHorizontal, Spline, Wand2, Brain, Eye, ArrowRight, Zap, Target, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneticZoom } from "./phonetic-zoom";
import { useGuessStore } from "./reading/hooks/useGuessStore";
import { useSpeech } from "@/hooks/use-speech";
import { type LexicalItem, type LegacyLexicalItem, isLegacyLexicalItem, isNewLexicalItem } from "./reading/utils/textProcessing";

interface LexicalItemProps {
  item: LexicalItem | LegacyLexicalItem;
  children: React.ReactNode;
  hideTranslation?: boolean;
  guessMode?: boolean;
  theme?: string;
  onLearnVocabulary?: (item: LexicalItem | LegacyLexicalItem) => void;
}

export function LexicalItem({ item, children, hideTranslation = false, guessMode = false, theme = "light", onLearnVocabulary }: LexicalItemProps) {
  const [revealLevel, setRevealLevel] = useState(0); // 0: guess, 1: definition, 2: full
  const { getGuess, setGuess } = useGuessStore();

  // Use the new speech hook
  const { isSpeaking, speak } = useSpeech({ rate: 0.8 });

  // Helper function to normalize item ID to string
  const getItemId = (item: LexicalItem | LegacyLexicalItem): string => {
    return isLegacyLexicalItem(item) ? String(item.id) : item.id;
  };

  // Helper function to normalize relatedCollocates
  const normalizeRelatedCollocates = (collocates?: string[] | string): string[] => {
    if (!collocates) return [];
    if (typeof collocates === 'string') return [collocates];
    return collocates;
  };

  const {
    targetLexeme,
    phase1Inference,
    phase2Annotation,
    phase3Production,
  } = item;

  // Extract known fields
  const phonetic = (phase2Annotation as any).phonetic;
  const sentiment = (phase2Annotation as any).sentiment;
  const definitionEN = (phase2Annotation as any).definitionEN;
  const translationVI = (phase2Annotation as any).translationVI;
  const relatedCollocates = (phase2Annotation as any).relatedCollocates;
  const wordForms = (phase2Annotation as any).wordForms;

  // New fields - these may not exist in legacy items
  const register = (phase2Annotation as any).register;
  const connotation = (phase2Annotation as any).connotation;
  const usageNotes = (phase2Annotation as any).usageNotes;
  const contrastingCollocates = (phase2Annotation as any).contrastingCollocates;

  const normalizedRelatedCollocates = normalizeRelatedCollocates(relatedCollocates);
  const itemId = getItemId(item);

  const formattedTranslation =
    translationVI.charAt(0).toLowerCase() + translationVI.slice(1);

  // Simplified speech function using the hook
  const speakText = (text: string, rate?: number) => {
    speak({
      text,
      lang: 'en-US',
      rate: rate || 0.8
    });
  };

  const sentimentClass = {
    positive: "bg-highlight-positive text-highlight-positive-foreground",
    negative: "bg-highlight-negative text-highlight-negative-foreground",
    neutral: "underline decoration-dotted", // No background for neutral, just underline
  }[sentiment || "neutral"];

  const themeClasses = {
    light: "bg-white text-gray-900 border-gray-200",
    sepia: "bg-amber-50 text-amber-900 border-amber-200",
    dark: "bg-gray-900 text-gray-100 border-gray-700",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "underline decoration-dotted cursor-pointer",
            sentimentClass
          )}
        >
          <strong>{children}</strong>{" "}
          {!hideTranslation && (
            <em className="text-muted-foreground">({formattedTranslation})</em>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-[90vw] max-w-sm md:max-w-md lg:max-w-lg shadow-xl rounded-xl border p-0 mx-2",
        themeClasses[theme as keyof typeof themeClasses]
      )} align="start" side="bottom">
        {guessMode ? (
          /* Guess Mode UI */
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Brain className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <h4 className="font-bold text-lg md:text-xl text-foreground truncate">{targetLexeme}</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => speakText(targetLexeme)}
                disabled={isSpeaking}
                className="flex-shrink-0 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                title="Pronounce word"
              >
                <Volume2 className={cn("h-4 w-4", isSpeaking ? "animate-pulse text-blue-600" : "text-muted-foreground")} />
              </Button>
              {/* {onLearnVocabulary && (
                <Button
                  size="sm"
                  onClick={() => onLearnVocabulary(item)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg animate-pulse"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Học siêu tốc
                </Button>
              )} */}
            </div>

            {/* Phase 1: User Guess Input */}
            {revealLevel === 0 ? (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <label className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">🤔 Your Guess:</span>
                </label>
                <input
                  type="text"
                  value={getGuess(itemId)}
                  onChange={(e) => {
                    setGuess(itemId, e.target.value);
                  }}
                  placeholder="What do you think it means?"
                  className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            ) : (
              // Show the user's guess and the suggested guess
              <>
                <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-sm font-medium text-blue-700 dark:text-blue-400">🤔 Your Guess:</span>
                   </div>
                   <p className="text-sm text-blue-800 dark:text-blue-300">{getGuess(itemId) || "(You didn't enter a guess)"}</p>
                </div>
                {phase1Inference?.contextualGuessVI && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">💡 Suggested Guess:</span>
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">{phase1Inference.contextualGuessVI}</p>
                  </div>
                )}
              </>
            )}

            {/* Progressive Revelation */}
            <div className="space-y-3">
              {revealLevel >= 1 && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Definition:</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-300">{definitionEN}</p>
                </div>
              )}

              {revealLevel >= 2 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Translation:</span>
                  </div>
                  <p className="text-sm text-orange-800 dark:text-orange-300">{formattedTranslation}</p>
                  {phonetic && (
                    <PhoneticZoom
                      text={phonetic}
                      className="text-xs italic text-orange-600 dark:text-orange-400 mt-1"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Reveal Buttons */}
            <div className="mt-4 flex gap-2">
              {revealLevel < 2 && (
                <Button
                  size="sm"
                  onClick={() => setRevealLevel(revealLevel + 1)}
                  className="flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  {revealLevel === 0 ? "Show Definition" : "Show Translation"}
                </Button>
              )}
              {revealLevel > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRevealLevel(0);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Normal Mode UI */
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h4 className="font-bold text-xl md:text-2xl text-foreground truncate">{targetLexeme}</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => speakText(targetLexeme)}
                disabled={isSpeaking}
                className="flex-shrink-0 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                title="Pronounce word"
              >
                <Volume2 className={cn("h-4 w-4", isSpeaking ? "animate-pulse text-blue-600" : "text-muted-foreground")} />
              </Button>
              {/* {onLearnVocabulary && (
                <Button
                  size="sm"
                  onClick={() => onLearnVocabulary(item)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg animate-pulse"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Học siêu tốc
                </Button>
              )} */}
            </div>
            {phonetic && (
              <div className="my-2">
                <PhoneticZoom
                  text={phonetic}
                  className="text-sm italic text-muted-foreground"
                />
              </div>
            )}

            <p className="text-lg text-primary">{formattedTranslation}</p>
          </div>
        )}

        {/* Additional Details - Show in normal mode or when fully revealed in guess mode */}
        {(!guessMode || revealLevel >= 2) && (
          <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4 md:space-y-5">
            {!guessMode && (
              <div className="flex items-start space-x-3">
                <BookText className="h-5 w-5 text-muted-foreground mt-1" />
                <p className="flex-1 text-base text-foreground">{definitionEN}</p>
              </div>
            )}

            {normalizedRelatedCollocates && normalizedRelatedCollocates.length > 0 && (
              <div className="flex items-start space-x-3">
                <Spline className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-blue-600 dark:text-blue-400">Collocates</h5>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                      {normalizedRelatedCollocates.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {normalizedRelatedCollocates.map((collocate, index) => (
                      <div
                        key={index}
                        className="group relative"
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-md hover:scale-105",
                            "max-w-[150px] md:max-w-none"
                          )}
                          onClick={() => speakText(collocate)}
                          title={`Click to pronounce: ${collocate}`}
                        >
                          <span className="truncate">{collocate}</span>
                          <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 Click any collocate to hear its pronunciation
                  </p>
                </div>
              </div>
            )}

            {wordForms && (
              <div className="flex items-start space-x-3">
                <Wand2 className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-purple-600 dark:text-purple-400">Word Forms</h5>
                  <div className="mt-2">
                    {/* Mobile-friendly card layout */}
                    <div className="space-y-2 md:hidden">
                      {Object.entries(wordForms).map(
                        ([type, forms]) =>
                          forms &&
                          (forms as any[]).length > 0 && (
                            <div key={type} className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/50">
                              <div className="font-medium text-purple-700 dark:text-purple-300 capitalize mb-1">
                                {type}
                              </div>
                              <div className="text-sm text-purple-600 dark:text-purple-400">
                                {(forms as any[])
                                  .map(
                                    (form) => `${form.form} (${form.meaning})`
                                  )
                                  .join(", ")}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                    {/* Desktop table layout */}
                    <table className="w-full text-sm hidden md:block">
                      <tbody>
                        {Object.entries(wordForms).map(
                          ([type, forms]) =>
                            forms &&
                            (forms as any[]).length > 0 &&
                            ((
                              <tr key={type} className="border-b border-purple-200 dark:border-purple-700/50">
                                <td className="py-2 font-medium text-purple-700 dark:text-purple-300 capitalize pr-4">
                                  {type}
                                </td>
                                <td className="py-2 text-purple-600 dark:text-purple-400">
                                  {(forms as any[])
                                    .map(
                                      (form) => `${form.form} (${form.meaning})`
                                    )
                                    .join(", ")}
                                </td>
                              </tr>
                            ) as any)
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Register - Show when available */}
            {register && (
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-amber-600 dark:text-amber-400">Register</h5>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 rounded-lg text-sm font-medium capitalize">
                    {register}
                  </span>
                </div>
              </div>
            )}

            {/* Connotation - Show when available */}
            {connotation && (
              <div className="flex items-start space-x-3">
                <Wand2 className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-indigo-600 dark:text-indigo-400">Connotation</h5>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">{connotation}</p>
                </div>
              </div>
            )}

            {/* Usage Notes - Show when available */}
            {usageNotes && (
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="font-semibold text-emerald-600 dark:text-emerald-400">Usage Notes</h5>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">{usageNotes}</p>
                </div>
              </div>
            )}

            {/* Contrasting Collocates - Show when available */}
            {contrastingCollocates && contrastingCollocates.length > 0 && (
              <div className="flex items-start space-x-3">
                <FlipHorizontal className="h-5 w-5 text-rose-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-rose-600 dark:text-rose-400">Contrasting Phrases</h5>
                    <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full">
                      {contrastingCollocates.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contrastingCollocates.map((collocate, index) => (
                      <div
                        key={index}
                        className="group relative"
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:from-rose-100 hover:to-pink-100 hover:border-rose-300 hover:shadow-md hover:scale-105",
                            "max-w-[150px] md:max-w-none"
                          )}
                          onClick={() => speakText(collocate)}
                          title={`Click to pronounce: ${collocate}`}
                        >
                          <span className="truncate">{collocate}</span>
                          <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 Click any contrasting phrase to hear its pronunciation
                  </p>
                </div>
              </div>
            )}

            {/* Phase 3 Production Practice - Show when available */}
            {phase3Production && (
              <div className="flex items-start space-x-3">
                <FlipHorizontal className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <h5 className="font-semibold text-foreground">Practice Example</h5>
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    "{phase3Production.content}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
