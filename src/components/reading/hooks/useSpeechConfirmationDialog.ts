import { useState, useEffect } from "react";

interface UseSpeechConfirmationDialogProps {
  onConfirm: (paragraphIndex: number) => void;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UseSpeechConfirmationDialogReturn {
  dialogProps: DialogProps;
  checkAndHandleParagraphClick: (paragraphIndex: number, isSpeechActive: boolean) => void;
}

export function useSpeechConfirmationDialog({ onConfirm }: UseSpeechConfirmationDialogProps): UseSpeechConfirmationDialogReturn {
  // Dialog state
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingParagraphIndex, setPendingParagraphIndex] = useState<number | null>(null);
  const [dontShowConfirmation, setDontShowConfirmation] = useState(() => {
    // Initialize from sessionStorage
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('dontShowParagraphSwitchConfirmation');
      return saved === 'true';
    }
    return false;
  });

  // Sync dontShowConfirmation with sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dontShowParagraphSwitchConfirmation', dontShowConfirmation.toString());
    }
  }, [dontShowConfirmation]);

  // Handle paragraph click with confirmation logic
  const checkAndHandleParagraphClick = (paragraphIndex: number, isSpeechActive: boolean) => {
    // If speech is active, check if we should show confirmation dialog
    if (isSpeechActive) {
      if (dontShowConfirmation) {
        // User has chosen not to show confirmation, execute immediately
        onConfirm(paragraphIndex);
      } else {
        // Show confirmation dialog
        setPendingParagraphIndex(paragraphIndex);
        setShowSwitchDialog(true);
      }
    } else {
      // No speech active, just focus the paragraph (handled by caller)
      onConfirm(paragraphIndex);
    }
  };

  // Confirm paragraph switch
  const confirmParagraphSwitch = () => {
    if (pendingParagraphIndex !== null) {
      onConfirm(pendingParagraphIndex);
      setShowSwitchDialog(false);
      setPendingParagraphIndex(null);
    }
  };

  // Cancel paragraph switch
  const cancelParagraphSwitch = () => {
    setShowSwitchDialog(false);
    setPendingParagraphIndex(null);
  };

  // Handle dont show again checkbox change
  const handleDontShowAgainChange = (checked: boolean) => {
    setDontShowConfirmation(checked);
  };

  return {
    dialogProps: {
      open: showSwitchDialog,
      onOpenChange: setShowSwitchDialog,
      title: "Switch Paragraph?",
      description: "You are currently listening to a paragraph. Would you like to stop the current audio and switch to the selected paragraph?",
      dontShowAgain: dontShowConfirmation,
      onDontShowAgainChange: handleDontShowAgainChange,
      onConfirm: confirmParagraphSwitch,
      onCancel: cancelParagraphSwitch,
    },
    checkAndHandleParagraphClick,
  };
}