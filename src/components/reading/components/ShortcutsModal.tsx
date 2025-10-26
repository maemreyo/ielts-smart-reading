"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Controls */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">Theme Controls</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Light theme</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">1</kbd>
              </div>
              <div className="flex justify-between">
                <span>Sepia theme</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">2</kbd>
              </div>
              <div className="flex justify-between">
                <span>Dark theme</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">3</kbd>
              </div>
            </div>
          </div>

          {/* Reading Controls */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">Reading Controls</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Play/Pause auto-scroll</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between">
                <span>Reset reading</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span>Previous paragraph</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>Next paragraph</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">↓</kbd>
              </div>
            </div>
          </div>

          {/* View Modes */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">View Modes</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Focus mode</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">F</kbd>
              </div>
              <div className="flex justify-between">
                <span>Dim other paragraphs</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">D</kbd>
              </div>
              <div className="flex justify-between">
                <span>Hide translations</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">T</kbd>
              </div>
              <div className="flex justify-between">
                <span>Toggle Guess Mode</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">G</kbd>
              </div>
              <div className="flex justify-between">
                <span>Bookmark paragraph</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">B</kbd>
              </div>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">Help</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Show shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + ?</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Use these shortcuts to navigate and control your reading experience efficiently. 
            The toolbar will auto-hide when scrolling down and reappear when scrolling up.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}