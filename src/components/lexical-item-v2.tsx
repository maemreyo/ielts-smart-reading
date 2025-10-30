import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
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
    Sparkles,
    CheckCircle2,
    Lightbulb,
    Pencil
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
    theme?: "light" | "sepia" | "dark";
}

export function LexicalItem({
    item,
    children,
    hideTranslation = false,
    guessMode = false,
    theme = "sepia"
}: LexicalItemProps) {
    const [open, setOpen] = useState(false);
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


    // Theme classes
    const themeClasses = {
        sepia: {
            bg: "bg-amber-50",
            text: "text-amber-950",
            border: "border-amber-200",
            headerBg: "bg-gradient-to-br from-amber-100 to-orange-100",
            cardBg: "bg-amber-50/50",
            muted: "text-amber-700",
        },
        light: {
            bg: "bg-white",
            text: "text-slate-900",
            border: "border-slate-200",
            headerBg: "bg-gradient-to-br from-slate-50 to-slate-100",
            cardBg: "bg-slate-50/50",
            muted: "text-slate-600",
        },
        dark: {
            bg: "bg-slate-900",
            text: "text-slate-100",
            border: "border-slate-700",
            headerBg: "bg-gradient-to-br from-slate-800 to-slate-900",
            cardBg: "bg-slate-800/50",
            muted: "text-slate-400",
        },
    }[theme];

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setRevealLevel(0);
        }
    }, [open]);

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <span
                        className={cn(
                            "underline decoration-dotted cursor-pointer hover:decoration-solid transition-all",
                            sentiment === "positive" && "decoration-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                            sentiment === "negative" && "decoration-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
                            sentiment === "neutral" && "decoration-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                        )}
                    >
                        <strong className="font-semibold">{children}</strong>
                        {!hideTranslation && (
                            <em className="text-muted-foreground text-sm ml-1">({formattedTranslation})</em>
                        )}
                    </span>
                </DialogTrigger>

                <DialogContent
                    size="4xl"
                    className={cn(
                        "max-h-[90vh] overflow-hidden p-0",
                        themeClasses.bg,
                        themeClasses.text
                    )}
                >
                    {/* Enhanced Header with Definitions */}
                    <DialogHeader className={cn(
                        "px-8 pt-6 pb-4 pr-16 border-b",
                        themeClasses.headerBg,
                        themeClasses.border
                    )}>
                        <div className="space-y-3">
                            {/* Title Row with Definitions */}
                            <div className="space-y-2">
                                {/* Main Title with Word and Audio */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="text-4xl font-bold mb-1 flex items-center gap-3 flex-wrap">
                                            {targetLexeme}
                                            {register && (
                                                <span className={cn(
                                                    "text-xs px-2.5 py-1 rounded-full border font-normal",
                                                    register === "formal"
                                                        ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700"
                                                        : register === "informal"
                                                            ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                                                            : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600"
                                                )}>
                                                    📝 {register}
                                                </span>
                                            )}
                                        </DialogTitle>
                                        {phonetic && (
                                            <PhoneticZoom
                                                text={phonetic}
                                                className={cn("text-sm italic", themeClasses.muted)}
                                            />
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => speakText(targetLexeme)}
                                        disabled={isSpeaking}
                                        className="hover:bg-amber-100 dark:hover:bg-amber-900/30 flex-shrink-0"
                                    >
                                        <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />
                                    </Button>
                                </div>

                                {/* Definitions Right Next to Word */}
                                <div className="flex flex-col sm:flex-row gap-4 pl-1">
                                    <div className="flex items-start gap-2 flex-1">
                                        <BookText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300 font-medium">{definitionEN}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 flex-1">
                                        <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{formattedTranslation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Main Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-5 py-4">
                        {guessMode ? (
                            /* Guess Mode Content */
                            <div className="space-y-6">
                                {/* Progress Stepper */}
                                <div className="flex items-center justify-between mb-2">
                                    {[
                                        { level: 0, label: "Guess", icon: Brain },
                                        { level: 1, label: "Check", icon: BookText },
                                        { level: 2, label: "Reveal", icon: Eye },
                                    ].map(({ level, label, icon: Icon }, idx) => (
                                        <div key={level} className="flex flex-col items-center flex-1">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                                                revealLevel >= level
                                                    ? "bg-green-500 text-white shadow-lg scale-110"
                                                    : theme === "sepia"
                                                        ? "bg-amber-200 text-amber-600"
                                                        : theme === "light"
                                                            ? "bg-slate-200 text-slate-500"
                                                            : "bg-slate-700 text-slate-400"
                                            )}>
                                                {revealLevel > level ? (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                revealLevel >= level ? "text-green-600 dark:text-green-400" : themeClasses.muted
                                            )}>
                                                {label}
                                            </span>
                                            {idx < 2 && (
                                                <div className={cn(
                                                    "h-1 w-full mt-2 rounded-full transition-all",
                                                    revealLevel > level
                                                        ? "bg-green-500"
                                                        : theme === "sepia"
                                                            ? "bg-amber-200"
                                                            : theme === "light"
                                                                ? "bg-slate-200"
                                                                : "bg-slate-700"
                                                )} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Guess Input */}
                                {revealLevel === 0 && (
                                    <div className={cn(
                                        "rounded-xl p-6 border-2",
                                        theme === "sepia"
                                            ? "bg-amber-100 border-amber-300"
                                            : theme === "light"
                                                ? "bg-blue-50 border-blue-300"
                                                : "bg-slate-800 border-slate-600"
                                    )}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            <h3 className="font-bold text-lg">What's your guess?</h3>
                                        </div>
                                        <input
                                            type="text"
                                            value={getGuess(itemId)}
                                            onChange={(e) => setGuess(itemId, e.target.value)}
                                            placeholder="Type your guess here..."
                                            className={cn(
                                                "w-full p-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                                theme === "sepia"
                                                    ? "bg-white border-amber-300"
                                                    : theme === "light"
                                                        ? "bg-white border-blue-200"
                                                        : "bg-slate-900 border-slate-600 text-white"
                                            )}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {/* Show Guesses Comparison */}
                                {revealLevel > 0 && (
                                    <div className="space-y-4">
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-amber-100 border-amber-300"
                                                : theme === "light"
                                                    ? "bg-blue-50 border-blue-200"
                                                    : "bg-slate-800 border-slate-700"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <h4 className="font-semibold">Your Guess</h4>
                                            </div>
                                            <p className="text-base">
                                                {getGuess(itemId) || <em className={themeClasses.muted}>(No guess entered)</em>}
                                            </p>
                                        </div>

                                        {phase1Inference?.contextualGuessVI && (
                                            <div className={cn(
                                                "rounded-xl p-4 border",
                                                theme === "sepia"
                                                    ? "bg-yellow-50 border-yellow-300"
                                                    : theme === "light"
                                                        ? "bg-yellow-50 border-yellow-200"
                                                        : "bg-yellow-900/20 border-yellow-800"
                                            )}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">Suggested Guess</h4>
                                                </div>
                                                <p className="text-base text-yellow-900 dark:text-yellow-200">
                                                    {phase1Inference.contextualGuessVI}
                                                </p>
                                            </div>
                                        )}
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
                                            {revealLevel === 0 ? "Check Answer" : "Show Full Answer"}
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
                            </div>
                        ) : (
                            /* Normal Mode Content */
                            <div className="space-y-4">
                                {/* Word Forms - Linear Layout */}
                                {wordForms && (
                                    <div className={cn(
                                        "rounded-xl p-4 border",
                                        theme === "sepia"
                                            ? "bg-purple-50 border-purple-200"
                                            : theme === "light"
                                                ? "bg-purple-50 border-purple-200"
                                                : "bg-purple-950/30 border-purple-800"
                                    )}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            <h3 className="font-semibold text-purple-900 dark:text-purple-300">Word Family</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Word Forms as Horizontal Row */}
                                            <div className="flex flex-wrap gap-4 items-start">
                                                {Object.entries(wordForms).map(([type, forms]) =>
                                                    forms && (forms as any[]).length > 0 && (
                                                        <div key={type} className="flex-1 min-w-[200px]">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase">
                                                                    {type}
                                                                </span>
                                                                <div className="h-px bg-purple-300 dark:bg-purple-600 flex-1"></div>
                                                            </div>
                                                            {/* Multiple forms as column within this word type */}
                                                            <div className="space-y-1">
                                                                {(forms as any[]).map((form, idx) => (
                                                                    <div key={idx} className="text-sm text-purple-900 dark:text-purple-200">
                                                                        <span className="font-medium">{form.form}</span>
                                                                        <span className={cn("ml-1", themeClasses.muted)}>({form.meaning})</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Collocations and Contrasting Phrases - 2 Columns Symmetrical */}
                                {(relatedCollocates.length > 0 || contrastingCollocates.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left: Collocations (Blue theme) */}
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-blue-50 border-blue-200"
                                                : theme === "light"
                                                    ? "bg-blue-50 border-blue-200"
                                                    : "bg-blue-950/30 border-blue-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Spline className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                                    Collocations
                                                </h3>
                                                {relatedCollocates.length > 0 && (
                                                    <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                        {relatedCollocates.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {relatedCollocates.length > 0 ? (
                                                    relatedCollocates.map((collocate, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => speakText(collocate)}
                                                            className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                                                        >
                                                            <span >{collocate}</span>
                                                            <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 italic">No collocations available</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Contrasting Phrases (Rose theme) */}
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-rose-50 border-rose-200"
                                                : theme === "light"
                                                    ? "bg-rose-50 border-rose-200"
                                                    : "bg-rose-950/30 border-rose-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FlipHorizontal className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                                <h3 className="font-semibold text-rose-900 dark:text-rose-300">
                                                    Contrasting Phrases
                                                </h3>
                                                {contrastingCollocates.length > 0 && (
                                                    <span className="text-xs bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                                                        {contrastingCollocates.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {contrastingCollocates.length > 0 ? (
                                                    contrastingCollocates.map((collocate, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => speakText(collocate)}
                                                            className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-lg text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                                                        >
                                                            <span >{collocate}</span>
                                                            <Volume2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-rose-700 dark:text-rose-300 italic">No contrasting phrases available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Usage Notes and Connotation - 2 Columns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Usage Notes */}
                                    {usageNotes && (
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-emerald-50 border-emerald-200"
                                                : theme === "light"
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : "bg-emerald-950/30 border-emerald-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Usage Notes</h3>
                                            </div>
                                            <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200">
                                                {usageNotes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Connotation */}
                                    {connotation && (
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-indigo-50 border-indigo-200"
                                                : theme === "light"
                                                    ? "bg-indigo-50 border-indigo-200"
                                                    : "bg-indigo-950/30 border-indigo-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">Connotation</h3>
                                            </div>
                                            <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-200">{connotation}</p>
                                        </div>
                                    )}

                                    {/* Practice Examples */}
                                    {phase3Production && (
                                        <div className={cn(
                                            "rounded-xl p-4 border",
                                            theme === "sepia"
                                                ? "bg-purple-50 border-purple-200"
                                                : theme === "light"
                                                    ? "bg-purple-50 border-purple-200"
                                                    : "bg-purple-950/30 border-purple-800"
                                        )}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Pencil className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                <h3 className="font-semibold text-purple-900 dark:text-purple-300">
                                                    Example
                                                </h3>
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
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}