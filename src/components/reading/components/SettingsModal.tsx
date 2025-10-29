"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  globalHighlightEnabled: boolean;
  onGlobalHighlightChange: (enabled: boolean) => void;
  highlightedCount: number;
  onClearAllHighlights: () => void;
}

export function SettingsModal({
  open,
  onOpenChange,
  globalHighlightEnabled,
  onGlobalHighlightChange,
  highlightedCount,
  onClearAllHighlights,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Self-Learning Settings</DialogTitle>
          <DialogDescription>
            Configure your highlighting preferences and manage your vocabulary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Global Highlight Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="global-highlight">Global Highlight</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, highlighting a word will highlight all occurrences
              </p>
            </div>
            <Switch
              id="global-highlight"
              checked={globalHighlightEnabled}
              onCheckedChange={onGlobalHighlightChange}
            />
          </div>

          <Separator />

          {/* Clear All Highlights */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Clear All Highlights</Label>
              <p className="text-sm text-muted-foreground">
                Remove all {highlightedCount} highlighted items
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearAllHighlights}
              disabled={highlightedCount === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          <Separator />

          {/* Storage Info */}
          <div className="space-y-2">
            <Label>Storage Information</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Highlights are automatically saved to your browser</p>
              <p>• Old highlights are removed after 7 days</p>
              <p>• {highlightedCount} items currently saved</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}