import { RotateCcw, X } from 'lucide-react';
import { Button } from '../ui/button';

type ResetConfirmDialogProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ResetConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ResetConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-confirm-title"
    >
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg space-y-4">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <RotateCcw className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 id="reset-confirm-title" className="text-sm font-bold text-foreground">
              Reset All Settings?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reset all settings to their default values?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
          <Button type="button" variant="ghost" size="default" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-10 px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-[10px]"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
