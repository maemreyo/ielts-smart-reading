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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    Palette, // Mới: cho tab Hiển thị
    Volume2, // Mới: cho tab Âm thanh
} from "lucide-react";
import { VoiceSelection } from "./VoiceSelection";

// Props interface không thay đổi, vì tất cả state vẫn được truyền từ bên ngoài
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
}

// Các hằng số (không thay đổi)
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

// Component con để chuẩn hóa các dòng cài đặt có nút gạt (Switch)
const SettingsSwitch = ({
    icon,
    label,
    checked,
    onCheckedChange,
}: {
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) => (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);

// Tên component được đổi thành SettingsDialog
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
}: SettingsDialogProps) {

    // Theme options (không thay đổi)
    const themes = [
        { name: "Light", value: "light", icon: <Sun size={16} /> },
        { name: "Sepia", value: "sepia", icon: <BookOpen size={16} /> },
        { name: "Dark", value: "dark", icon: <Moon size={16} /> }
    ];

    // Memoize (không thay đổi)
    const fontSizeValue = useMemo(() => [fontSize], [fontSize]);
    const timerDurationValue = useMemo(() => [timerDuration], [timerDuration]);

    const handleFontSizeChange = useCallback((value: number[]) => {
        setFontSize(value[0]);
    }, [setFontSize]);

    const handleTimerDurationChange = useCallback((value: number[]) => {
        setTimerDuration(value[0]);
    }, [setTimerDuration]);

    return (
        // Sử dụng Dialog thay vì DropdownMenu
        <Dialog>
            {/* Nút trigger vẫn giữ nguyên */}
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

            {/* Nội dung Dialog, rộng hơn và không bị giới hạn chiều cao như trước */}
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Tùy chỉnh trải nghiệm đọc của bạn.
                    </DialogDescription>
                </DialogHeader>

                {/* Sử dụng Tabs để tổ chức cài đặt */}
                <Tabs defaultValue="display" className="w-full pt-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="display">
                            <Palette size={16} className="mr-2" />
                            Hiển thị
                        </TabsTrigger>
                        <TabsTrigger value="reading">
                            <BookOpen size={16} className="mr-2" />
                            Đọc
                        </TabsTrigger>
                        <TabsTrigger value="audio">
                            <Volume2 size={16} className="mr-2" />
                            Âm thanh
                        </TabsTrigger>
                        <TabsTrigger value="tools">
                            <Clock size={16} className="mr-2" />
                            Công cụ
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Cài đặt Hiển thị */}
                    <TabsContent value="display" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Cột 1: Font & Spacing */}
                            <div className="space-y-6">
                                {/* Font Family */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Font Family</label>
                                    <div className="flex gap-2">
                                        {fontFamilies.map((font) => (
                                            <button
                                                key={font.name}
                                                onClick={() => setFontFamily(font.class)}
                                                className={cn(
                                                    "px-4 py-2 text-sm rounded-md transition-colors w-full",
                                                    fontFamily === font.class
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                            >
                                                {font.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Size */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Font Size</label>
                                        <span className="text-sm text-muted-foreground">
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

                                {/* Line Spacing */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Line Spacing</label>
                                    <div className="flex gap-2">
                                        {lineSpacings.map((spacing) => (
                                            <button
                                                key={spacing.name}
                                                onClick={() => setLineSpacing(spacing.class)}
                                                className={cn(
                                                    "p-3 rounded-md transition-colors flex-1 justify-center flex",
                                                    lineSpacing === spacing.class
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                title={spacing.name}
                                            >
                                                {React.cloneElement(spacing.icon, { size: 18 })}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cột 2: Layout & Theme */}
                            <div className="space-y-6">
                                {/* Columns */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Columns</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setColumnCount(1)}
                                            className={cn(
                                                "p-3 rounded-md transition-colors flex-1 justify-center flex",
                                                columnCount === 1
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                            title="1 Column"
                                        >
                                            <PanelLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() => setColumnCount(2)}
                                            className={cn(
                                                "p-3 rounded-md transition-colors flex-1 justify-center flex",
                                                columnCount === 2
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                            title="2 Columns"
                                        >
                                            <Columns size={18} />
                                        </button>
                                        <button
                                            onClick={() => setColumnCount(3)}
                                            className={cn(
                                                "p-3 rounded-md transition-colors flex-1 justify-center flex",
                                                columnCount === 3
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                            title="3 Columns"
                                        >
                                            <Grid size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Theme */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">Theme</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {themes.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setTheme(t.value)}
                                                className={cn(
                                                    "px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-center gap-2",
                                                    theme === t.value
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                title={t.name}
                                            >
                                                {React.cloneElement(t.icon, { size: 14 })}
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Cài đặt Đọc */}
                    <TabsContent value="reading" className="mt-6">
                        <div className="max-w-md mx-auto space-y-4">
                            <SettingsSwitch
                                icon={<Eye size={16} />}
                                label="Dim Other Paragraphs"
                                checked={dimOthers}
                                onCheckedChange={setDimOthers}
                            />
                            <SettingsSwitch
                                icon={<Focus size={16} />}
                                label="Focus Mode"
                                checked={focusMode}
                                onCheckedChange={setFocusMode}
                            />
                            <SettingsSwitch
                                icon={<Globe size={16} />}
                                label="Hide Translations"
                                checked={hideTranslations}
                                onCheckedChange={setHideTranslations}
                            />
                            <SettingsSwitch
                                icon={<Brain size={16} />}
                                label="Guess Mode"
                                checked={guessMode}
                                onCheckedChange={setGuessMode}
                            />
                            <SettingsSwitch
                                icon={<motion.div />} // Biểu tượng cho animations
                                label="Show Animations"
                                checked={showAnimations}
                                onCheckedChange={setShowAnimations}
                            />

                            {/* Keyboard Shortcuts */}
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Keyboard size={16} />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <button
                                    onClick={toggleShortcuts}
                                    className="px-3 py-1 text-xs bg-background hover:bg-background/80 rounded-md transition-colors border shadow-sm"
                                >
                                    Show (Shift + ?)
                                </button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Cài đặt Âm thanh */}
                    <TabsContent value="audio" className="mt-6">
                        <div className="max-w-md mx-auto">
                            <VoiceSelection
                                voices={voices}
                                currentVoice={currentVoice}
                                onVoiceChange={onVoiceChange}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 4: Cài đặt Công cụ (Timer) */}
                    <TabsContent value="tools" className="mt-6">
                        <div className="max-w-md mx-auto space-y-4">
                            <SettingsSwitch
                                icon={<Clock size={16} />}
                                label="Enable Timer"
                                checked={timerEnabled}
                                onCheckedChange={setTimerEnabled}
                            />

                            {/* Cài đặt timer chi tiết (chỉ hiện khi bật) */}
                            {timerEnabled && (
                                <div className="pl-8 space-y-4 pt-4 border-l-2 ml-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">Duration</label>
                                            <span className="text-sm text-muted-foreground">{timerDuration} min</span>
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
                                                    "px-2 py-1 text-xs rounded-md transition-colors",
                                                    timerDuration === preset.value
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted hover:bg-muted/80"
                                                )}
                                                title={preset.name}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
