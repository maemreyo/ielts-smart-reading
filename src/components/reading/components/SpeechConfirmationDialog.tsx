import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

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

interface SpeechConfirmationDialogProps extends DialogProps {
  className?: string;
}

export function SpeechConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  dontShowAgain,
  onDontShowAgainChange,
  onConfirm,
  onCancel,
  className,
}: SpeechConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Checkbox for "Don't show this again" */}
        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="dont-show-again"
            checked={dontShowAgain}
            onCheckedChange={onDontShowAgainChange}
          />
          <label
            htmlFor="dont-show-again"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Don't show this again in this session
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Switch Paragraph
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}