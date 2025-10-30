import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    BookText,
    FlipHorizontal,
    Spline,
    Wand2,
    Brain,
    Eye,
    ArrowRight,
    Volume2,
    Target,
    Sparkles,
    CheckCircle2,
    XCircle,
    Lightbulb,
    BookOpen,
    Pencil,
    Star,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneticZoom } from "./phonetic-zoom";
import { useGuessStore } from "./reading/hooks/useGuessStore";
import { useSpeech } from "@/hooks/use-speech";
import { type LexicalItem, type LegacyLexicalItem, isLegacyLexicalItem } from "./reading/utils/textProcessing";

interface LexicalItemProps {
    item: LexicalItem | LegacyLexicalItem;
    children: React.ReactNode;
    hideTranslation?: boolean;
    guessMode?: boolean;
    theme?: string;
    onLearnVocabulary?: (item: LexicalItem | LegacyLexicalItem) => void;
}

export function LexicalItem({
    item,
    children,
    hideTranslation = false,
    guessMode = false,
    theme = "light",
    onLearnVocabulary
}: LexicalItemProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "deepdive" | "practice">(
        guessMode ? "practice" : "overview"
    );
    const [revealLevel, setRevealLevel] = useState(0);
    const { getGuess, setGuess } = useGuessStore();
    const { isSpeaking, speak } = useSpeech({ rate: 0.8 });

    // Helper functions
    const getItemId = (item: LexicalItem | LegacyLexicalItem): string => {
        return isLegacyLexicalItem(item) ? String(item.id) : item.id;
    };

    const normalizeArray = (data?: string[] | string): string[] => {
        if (!data) return [];
        if (typeof data === 'string') return [data];
        return data;
    };

    // Extract data
    const {
        targetLexeme,
        phase1Inference,
        phase2Annotation,
        phase3Production,
    } = item;

    const phonetic = (phase2Annotation as any).phonetic;
    const sentiment = (phase2Annotation as any).sentiment;
    const definitionEN = (phase2Annotation as any).definitionEN;
    const translationVI = (phase2Annotation as any).translationVI;
    const relatedCollocates = normalizeArray((phase2Annotation as any).relatedCollocates);
    const wordForms = (phase2Annotation as any).wordForms;
    const register = (phase2Annotation as any).register;
    const connotation = (phase2Annotation as any).connotation;
    const usageNotes = (phase2Annotation as any).usageNotes;
    const contrastingCollocates = normalizeArray((phase2Annotation as any).contrastingCollocates);

    const itemId = getItemId(item);
    const formattedTranslation = translationVI.charAt(0).toLowerCase() + translationVI.slice(1);

    const speakText = (text: string, rate?: number) => {
        speak({ text, lang: 'en-US', rate: rate || 0.8 });
    };

    const sentimentClass = {
        positive: "bg-emerald-100 text-emerald-700 border-emerald-300",
        negative: "bg-rose-100 text-rose-700 border-rose-300",
        neutral: "bg-slate-100 text-slate-700 border-slate-300",
    }[sentiment || "neutral"];

    const sentimentIcon = {
        positive: "😊",
        negative: "😔",
        neutral: "😐",
    }[sentiment || "neutral"];

    // Reset reveal level when dialog closes
    useEffect(() => {
        if (!open) {
            setRevealLevel(0);
            setActiveTab(guessMode ? "practice" : "overview");
        }
    }, [open, guessMode]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <span
                    className={cn(
                        "underline decoration-dotted cursor-pointer hover:decoration-solid transition-all",
                        sentiment === "positive" && "decoration-emerald-400 hover:bg-emerald-50",
                        sentiment === "negative" && "decoration-rose-400 hover:bg-rose-50",
                        sentiment === "neutral" && "decoration-slate-400 hover:bg-slate-50"
                    )}
                >
                    <strong className="font-semibold">{children}</strong>
                    {!hideTranslation && (
                        <em className="text-muted-foreground text-sm ml-1">({formattedTranslation})</em>
                    )}
                </span>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
                {/* Header with sticky actions */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                                {targetLexeme}
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full border font-normal",
                                    sentimentClass
                                )}>
                                    {sentimentIcon} {sentiment || "neutral"}
                                </span>
                            </DialogTitle>
                            {phonetic && (
                                <PhoneticZoom
                                    text={phonetic}
                                    className="text-sm italic text-muted-foreground"
                                />
                            )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => speakText(targetLexeme)}
                                disabled={isSpeaking}
                                className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            >
                                <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />
                            </Button>
                            {onLearnVocabulary && (
                                <Button
                                    size="sm"
                                    onClick={() => onLearnVocabulary(item)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Star className="h-4 w-4 mr-1" />
                                    Save
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs Navigation */}
                <div className="flex border-b bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === "overview"
                                ? "bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("deepdive")}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === "deepdive"
                                ? "bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <Brain className="h-4 w-4" />
                        Deep Dive
                    </button>
                    <button
                        onClick={() => setActiveTab("practice")}
                        className={cn(
                            "flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2",
                            activeTab === "practice"
                                ? "bg-white dark:bg-slate-900 text-blue-600 border-b-2 border-blue-600"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <Pencil className="h-4 w-4" />
                        Practice
                        {guessMode && <Sparkles className="h-3 w-3 text-yellow-500" />}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-6 py-6">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Definition Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <BookText className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">Definition</h3>
                                </div>
                                <p className="text-base leading-relaxed text-blue-900 dark:text-blue-200">
                                    {definitionEN}
                                </p>
                            </div>

                            {/* Translation Card */}
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="h-5 w-5 text-orange-600" />
                                    <h3 className="font-semibold text-orange-900 dark:text-orange-300">Tiếng Việt</h3>
                                </div>
                                <p className="text-lg font-medium text-orange-900 dark:text-orange-200">
                                    {formattedTranslation}
                                </p>
                            </div>

                            {/* Word Forms - Compact View */}
                            {wordForms && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Wand2 className="h-5 w-5 text-purple-600" />
                                        <h3 className="font-semibold text-purple-900 dark:text-purple-300">Word Family</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(wordForms).map(([type, forms]) =>
                                            forms && (forms as any[]).length > 0 && (
                                                <div key={type} className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                                                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mb-2">
                                                        {type}
                                                    </div>
                                                    {(forms as any[]).map((form, idx) => (
                                                        <div key={idx} className="text-sm text-purple-900 dark:text-purple-200 mb-1">
                                                            <span className="font-medium">{form.form}</span>
                                                            <span className="text-muted-foreground ml-2">({form.meaning})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DEEP DIVE TAB */}
                    {activeTab === "deepdive" && (
                        <div className="space-y-6">
                            {/* Register & Connotation Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {register && (
                                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-4 w-4 text-amber-600" />
                                            <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-300">Register</h3>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-full text-sm font-medium capitalize">
                                            {register}
                                        </span>
                                    </div>
                                )}
                                {connotation && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="h-4 w-4 text-indigo-600" />
                                            <h3 className="font-semibold text-sm text-indigo-900 dark:text-indigo-300">Connotation</h3>
                                        </div>
                                        <p className="text-sm text-indigo-900 dark:text-indigo-200">{connotation}</p>
                                    </div>
                                )}
                            </div>

                            {/* Usage Notes */}
                            {usageNotes && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="h-5 w-5 text-emerald-600" />
                                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Usage Notes</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                                        {usageNotes}
                                    </p>
                                </div>
                            )}

                            {/* Related Collocates */}
                            {relatedCollocates.length > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Spline className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                            Collocations
                                        </h3>
                                        <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                            {relatedCollocates.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {relatedCollocates.map((collocate, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => speakText(collocate)}
                                                className="group inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                                            >
                                                <span>{collocate}</span>
                                                <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contrasting Collocates */}
                            {contrastingCollocates.length > 0 && (
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-rose-200 dark:border-rose-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FlipHorizontal className="h-5 w-5 text-rose-600" />
                                        <h3 className="font-semibold text-rose-900 dark:text-rose-300">
                                            Contrasting Phrases
                                        </h3>
                                        <span className="text-xs bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                                            {contrastingCollocates.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {contrastingCollocates.map((collocate, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => speakText(collocate)}
                                                className="group inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                                            >
                                                <span>{collocate}</span>
                                                <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PRACTICE TAB */}
                    {activeTab === "practice" && (
                        <div className="space-y-6">
                            {guessMode ? (
                                <>
                                    {/* Progress Stepper */}
                                    <div className="flex items-center justify-between mb-6">
                                        {[
                                            { level: 0, label: "Guess", icon: Brain },
                                            { level: 1, label: "Definition", icon: BookText },
                                            { level: 2, label: "Translation", icon: Eye },
                                        ].map(({ level, label, icon: Icon }) => (
                                            <div key={level} className="flex flex-col items-center flex-1">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                                                    revealLevel >= level
                                                        ? "bg-green-500 text-white shadow-lg scale-110"
                                                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                                                )}>
                                                    {revealLevel > level ? (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    ) : (
                                                        <Icon className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    revealLevel >= level ? "text-green-600 dark:text-green-400" : "text-slate-400"
                                                )}>
                                                    {label}
                                                </span>
                                                {level < 2 && (
                                                    <div className={cn(
                                                        "h-1 w-full mt-2 rounded-full transition-all",
                                                        revealLevel > level ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                                                    )} />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Guess Input */}
                                    {revealLevel === 0 && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Brain className="h-6 w-6 text-blue-600" />
                                                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">
                                                    What's your guess?
                                                </h3>
                                            </div>
                                            <input
                                                type="text"
                                                value={getGuess(itemId)}
                                                onChange={(e) => setGuess(itemId, e.target.value)}
                                                placeholder="Type your guess here..."
                                                className="w-full p-4 text-lg border-2 border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                                                autoFocus
                                            />
                                        </div>
                                    )}

                                    {/* Show Guesses Comparison */}
                                    {revealLevel > 0 && (
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Brain className="h-5 w-5 text-blue-600" />
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Your Guess</h4>
                                                </div>
                                                <p className="text-base text-blue-900 dark:text-blue-200">
                                                    {getGuess(itemId) || <em className="text-muted-foreground">(No guess entered)</em>}
                                                </p>
                                            </div>

                                            {phase1Inference?.contextualGuessVI && (
                                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-xl p-5 border border-yellow-200 dark:border-yellow-800">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                                                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">Suggested Guess</h4>
                                                    </div>
                                                    <p className="text-base text-yellow-900 dark:text-yellow-200">
                                                        {phase1Inference.contextualGuessVI}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Progressive Reveal Content */}
                                    {revealLevel >= 1 && (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <BookText className="h-5 w-5 text-green-600" />
                                                <h4 className="font-semibold text-green-900 dark:text-green-300">Actual Definition</h4>
                                            </div>
                                            <p className="text-base leading-relaxed text-green-900 dark:text-green-200">
                                                {definitionEN}
                                            </p>
                                        </div>
                                    )}

                                    {revealLevel >= 2 && (
                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Eye className="h-5 w-5 text-orange-600" />
                                                <h4 className="font-semibold text-orange-900 dark:text-orange-300">Vietnamese Translation</h4>
                                            </div>
                                            <p className="text-lg font-medium text-orange-900 dark:text-orange-200">
                                                {formattedTranslation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        {revealLevel < 2 ? (
                                            <Button
                                                onClick={() => setRevealLevel(revealLevel + 1)}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold"
                                            >
                                                <ArrowRight className="h-5 w-5 mr-2" />
                                                {revealLevel === 0 ? "Show Definition" : "Show Translation"}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => setRevealLevel(0)}
                                                variant="outline"
                                                className="flex-1 py-6 text-lg font-semibold"
                                            >
                                                <Brain className="h-5 w-5 mr-2" />
                                                Try Again
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Normal Practice Mode */
                                <div className="space-y-6">
                                    {phase3Production && (
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Pencil className="h-5 w-5 text-purple-600" />
                                                <h4 className="font-semibold text-purple-900 dark:text-purple-300">
                                                    Production Example
                                                </h4>
                                                {phase3Production.taskType && (
                                                    <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full capitalize">
                                                        {phase3Production.taskType.replace(/_/g, " ").toLowerCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm leading-relaxed text-purple-900 dark:text-purple-200 italic">
                                                "{phase3Production.content}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Practice Prompt */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-6 border-2 border-dashed border-blue-300 dark:border-blue-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="h-6 w-6 text-blue-600" />
                                            <h4 className="font-bold text-lg text-blue-900 dark:text-blue-300">
                                                Create Your Own Sentence
                                            </h4>
                                        </div>
                                        <textarea
                                            placeholder="Write a sentence using this word..."
                                            rows={4}
                                            className="w-full p-4 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white resize-none"
                                        />
                                        <Button className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Submit Practice
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}