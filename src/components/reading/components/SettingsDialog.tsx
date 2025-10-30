"use client";

import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Settings,
    PanelLeft,
    Columns,
    Grid,
    AlignLeft,
    AlignCenter,
    AlignJustify,
    Focus,
    Keyboard,
    Eye,
    Globe,
    Brain,
    Sun,
    Moon,
    BookOpen,
    Clock,
    Palette,
    Volume2,
    Shuffle,
    Star,
} from "lucide-react";
import { VoiceSelection } from "./VoiceSelection";

interface SettingsDialogProps {
    fontFamily: string;
    setFontFamily: (font: string) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    columnCount: number;
    setColumnCount: (count: number) => void;
    lineSpacing: string;
    setLineSpacing: (spacing: string) => void;
    showAnimations: boolean;
    setShowAnimations: (show: boolean) => void;
    theme: string;
    setTheme: (theme: string) => void;
    focusMode: boolean;
    setFocusMode: (focus: boolean) => void;
    toggleShortcuts: () => void;
    dimOthers: boolean;
    setDimOthers: (dim: boolean) => void;
    hideTranslations: boolean;
    setHideTranslations: (hide: boolean) => void;
    guessMode: boolean;
    setGuessMode: (guess: boolean) => void;
    timerEnabled: boolean;
    setTimerEnabled: (enabled: boolean) => void;
    timerDuration: number;
    setTimerDuration: (duration: number) => void;
    voices: SpeechSynthesisVoice[];
    currentVoice: SpeechSynthesisVoice | null;
    onVoiceChange: (voiceName: string) => void;
    favoriteVoices: string[];
    setFavoriteVoices: (voices: string[]) => void;
    voiceRotation: boolean;
    setVoiceRotation: (enabled: boolean) => void;
    voiceRotationFavoritesOnly: boolean;
    setVoiceRotationFavoritesOnly: (enabled: boolean) => void;
}

const fontFamilies = [
    { name: "Serif", class: "font-serif" },
    { name: "Sans", class: "font-sans" },
    { name: "Mono", class: "font-mono" }
];

const lineSpacings = [
    { name: "Tight", class: "leading-tight", icon: <AlignLeft size={16} /> },
    { name: "Normal", class: "leading-normal", icon: <AlignCenter size={16} /> },
    { name: "Relaxed", class: "leading-relaxed", icon: <AlignJustify size={16} /> }
];

const timerPresets = [
    { name: "5 min", value: 5 },
    { name: "10 min", value: 10 },
    { name: "15 min", value: 15 },
    { name: "30 min", value: 30 }
];

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
    </div>
);

const QuickToggle = ({
    icon,
    label,
    checked,
    onCheckedChange,
    variant = "default"
}: {
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    variant?: "default" | "compact";
}) => (
    <button
        onClick={() => onCheckedChange(!checked)}
        className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg transition-all border",
            variant === "compact" ? "justify-start" : "justify-between",
            checked
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/50 border-transparent hover:bg-muted"
        )}
    >
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        {variant === "default" && (
            <div className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                checked ? "bg-primary" : "bg-muted-foreground/30"
            )}>
                <div className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                    checked ? "translate-x-[18px]" : "translate-x-0.5"
                )} />
            </div>
        )}
    </button>
);

export function SettingsDialog({
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    columnCount,
    setColumnCount,
    lineSpacing,
    setLineSpacing,
    showAnimations,
    setShowAnimations,
    theme,
    setTheme,
    focusMode,
    setFocusMode,
    toggleShortcuts,
    dimOthers,
    setDimOthers,
    hideTranslations,
    setHideTranslations,
    guessMode,
    setGuessMode,
    timerEnabled,
    setTimerEnabled,
    timerDuration,
    setTimerDuration,
    voices,
    currentVoice,
    onVoiceChange,
    favoriteVoices,
    setFavoriteVoices,
    voiceRotation,
    setVoiceRotation,
    voiceRotationFavoritesOnly,
    setVoiceRotationFavoritesOnly,
}: SettingsDialogProps) {

    const themes = [
        { name: "Light", value: "light", icon: <Sun size={16} /> },
        { name: "Sepia", value: "sepia", icon: <BookOpen size={16} /> },
        { name: "Dark", value: "dark", icon: <Moon size={16} /> }
    ];

    const fontSizeValue = useMemo(() => [fontSize], [fontSize]);
    const timerDurationValue = useMemo(() => [timerDuration], [timerDuration]);

    const handleFontSizeChange = useCallback((value: number[]) => {
        setFontSize(value[0]);
    }, [setFontSize]);

    const handleTimerDurationChange = useCallback((value: number[]) => {
        setTimerDuration(value[0]);
    }, [setTimerDuration]);

    const toggleFavoriteVoice = useCallback((voiceName: string) => {
        const currentFavorites = favoriteVoices;
        const newFavorites = currentFavorites.includes(voiceName)
            ? currentFavorites.filter(v => v !== voiceName)
            : [...currentFavorites, voiceName];

        // Save to localStorage
        try {
            localStorage.setItem('favoriteVoices', JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Failed to save favorite voices:', error);
        }

        setFavoriteVoices(newFavorites);
    }, [favoriteVoices, setFavoriteVoices]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-muted"
                    title="Settings"
                >
                    <Settings size={18} />
                </motion.button>
            </DialogTrigger>

            <DialogContent className="max-w-8xl max-h-[85vh] overflow-y-auto p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
                    <DialogTitle className="flex items-center gap-2">
                        <Settings size={20} />
                        Reading Settings
                    </DialogTitle>
                    <DialogDescription>
                        Customize your reading experience
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-8">
                    <section>
                        <SectionHeader icon={<Focus size={16} />} title="Reading Modes" />
                        <div className="grid grid-cols-2 gap-3">
                            <QuickToggle
                                icon={<Focus size={16} />}
                                label="Focus Mode"
                                checked={focusMode}
                                onCheckedChange={setFocusMode}
                            />
                            <QuickToggle
                                icon={<Eye size={16} />}
                                label="Dim Others"
                                checked={dimOthers}
                                onCheckedChange={setDimOthers}
                            />
                            <QuickToggle
                                icon={<Brain size={16} />}
                                label="Guess Mode"
                                checked={guessMode}
                                onCheckedChange={setGuessMode}
                            />
                            <QuickToggle
                                icon={<Globe size={16} />}
                                label="Hide Translations"
                                checked={hideTranslations}
                                onCheckedChange={setHideTranslations}
                            />
                        </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <SectionHeader icon={<Palette size={16} />} title="Typography" />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Text Size</label>
                                    <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {fontSize}px
                                    </span>
                                </div>
                                <Slider
                                    value={fontSizeValue}
                                    onValueChange={handleFontSizeChange}
                                    max={40}
                                    min={16}
                                    step={2}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Font</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {fontFamilies.map((font) => (
                                        <button
                                            key={font.name}
                                            onClick={() => setFontFamily(font.class)}
                                            className={cn(
                                                "px-3 py-2 text-sm rounded-lg transition-all",
                                                fontFamily === font.class
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Line Spacing</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {lineSpacings.map((spacing) => (
                                        <button
                                            key={spacing.name}
                                            onClick={() => setLineSpacing(spacing.class)}
                                            className={cn(
                                                "p-2 rounded-lg transition-all flex items-center justify-center gap-2",
                                                lineSpacing === spacing.class
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                            title={spacing.name}
                                        >
                                            {spacing.icon}
                                            <span className="text-xs">{spacing.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionHeader icon={<Columns size={16} />} title="Layout & Theme" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color Theme</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {themes.map((t) => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTheme(t.value)}
                                            className={cn(
                                                "px-3 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                                                theme === t.value
                                                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                        >
                                            {t.icon}
                                            <span className="text-xs font-medium">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Columns</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setColumnCount(1)}
                                        className={cn(
                                            "p-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                                            columnCount === 1
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <PanelLeft size={16} />
                                        <span className="text-xs">Single</span>
                                    </button>
                                    <button
                                        onClick={() => setColumnCount(2)}
                                        className={cn(
                                            "p-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                                            columnCount === 2
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <Columns size={16} />
                                        <span className="text-xs">Double</span>
                                    </button>
                                    <button
                                        onClick={() => setColumnCount(3)}
                                        className={cn(
                                            "p-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                                            columnCount === 3
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted hover:bg-muted/80"
                                        )}
                                    >
                                        <Grid size={16} />
                                        <span className="text-xs">Triple</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <QuickToggle
                                    icon={<motion.div
                                        animate={{ rotate: showAnimations ? 360 : 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        ✨
                                    </motion.div>}
                                    label="Animations"
                                    checked={showAnimations}
                                    onCheckedChange={setShowAnimations}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <SectionHeader icon={<Volume2 size={16} />} title="Text-to-Speech" />
                            <div className="space-y-3">
                                <QuickToggle
                                    icon={<Shuffle size={16} />}
                                    label="Random Voice"
                                    checked={voiceRotation}
                                    onCheckedChange={setVoiceRotation}
                                />
                                {voiceRotation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pl-4 border-l-2 border-primary/30 space-y-2"
                                    >
                                        <QuickToggle
                                            icon={<Star size={16} />}
                                            label="Only Favorites"
                                            checked={voiceRotationFavoritesOnly}
                                            onCheckedChange={setVoiceRotationFavoritesOnly}
                                            variant="compact"
                                        />
                                    </motion.div>
                                )}
                                <VoiceSelection
                                    voices={voices}
                                    currentVoice={currentVoice}
                                    onVoiceChange={onVoiceChange}
                                    favoriteVoices={favoriteVoices}
                                    onToggleFavorite={toggleFavoriteVoice}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SectionHeader icon={<Clock size={16} />} title="Reading Timer" />

                            <QuickToggle
                                icon={<Clock size={16} />}
                                label="Enable Timer"
                                checked={timerEnabled}
                                onCheckedChange={setTimerEnabled}
                            />

                            {timerEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 pl-4 border-l-2 border-primary/30"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Duration</label>
                                            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                {timerDuration} min
                                            </span>
                                        </div>
                                        <Slider
                                            value={timerDurationValue}
                                            onValueChange={handleTimerDurationChange}
                                            max={30}
                                            min={5}
                                            step={5}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {timerPresets.map((preset) => (
                                            <button
                                                key={preset.value}
                                                onClick={() => setTimerDuration(preset.value)}
                                                className={cn(
                                                    "px-2 py-1.5 text-xs rounded-md transition-all font-medium",
                                                    timerDuration === preset.value
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    <section>
                        <SectionHeader icon={<Keyboard size={16} />} title="Shortcuts" />
                        <button
                            onClick={toggleShortcuts}
                            className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Keyboard size={16} />
                                <span className="text-sm font-medium">View Keyboard Shortcuts</span>
                            </div>
                            <kbd className="px-2 py-1 text-xs bg-background border rounded font-mono shadow-sm">
                                Shift + ?
                            </kbd>
                        </button>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}