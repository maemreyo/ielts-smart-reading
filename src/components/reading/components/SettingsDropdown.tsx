"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Settings,
  PanelLeft,
  Columns,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignJustify
} from "lucide-react";

interface SettingsDropdownProps {
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

export function SettingsDropdown({
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
}: SettingsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-muted"
          title="Settings"
        >
          <Settings size={18} />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4 max-h-[80vh] overflow-y-auto">
        <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Family Settings */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium">Font Family</label>
          <div className="flex gap-1">
            {fontFamilies.map((font) => (
              <button
                key={font.name}
                onClick={() => setFontFamily(font.class)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
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

        {/* Font Size Settings */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Font Size</label>
            <span className="text-sm text-muted-foreground">
              {fontSize}px
            </span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            max={40}
            min={16}
            step={2}
            className="w-full"
          />
        </div>

        {/* Column Settings */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium">Columns</label>
          <div className="flex gap-1">
            <button
              onClick={() => setColumnCount(1)}
              className={cn(
                "p-2 rounded-md transition-colors",
                columnCount === 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
              title="1 Column"
            >
              <PanelLeft size={16} />
            </button>
            <button
              onClick={() => setColumnCount(2)}
              className={cn(
                "p-2 rounded-md transition-colors",
                columnCount === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
              title="2 Columns"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setColumnCount(3)}
              className={cn(
                "p-2 rounded-md transition-colors",
                columnCount === 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
              title="3 Columns"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Line Spacing Settings */}
        <div className="space-y-3 mb-4">
          <label className="text-sm font-medium">Line Spacing</label>
          <div className="flex gap-1">
            {lineSpacings.map((spacing) => (
              <button
                key={spacing.name}
                onClick={() => setLineSpacing(spacing.class)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  lineSpacing === spacing.class
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
                title={spacing.name}
              >
                {React.cloneElement(spacing.icon, { size: 16 })}
              </button>
            ))}
          </div>
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show Animations</span>
          <Switch
            checked={showAnimations}
            onCheckedChange={setShowAnimations}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}