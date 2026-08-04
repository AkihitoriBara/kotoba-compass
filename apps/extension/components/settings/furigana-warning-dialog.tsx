import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';

type FuriganaWarningDialogProps = {
  isOpen: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
};

export function FuriganaWarningDialog({
  isOpen,
  onConfirm,
  onCancel,
}: FuriganaWarningDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="furigana-warning-title"
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
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 id="furigana-warning-title" className="text-sm font-bold text-foreground">
              Enable Front-Side Furigana?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              It is generally recommended to memorize kanji by shape rather than relying on furigana.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="dont-show-again"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="dont-show-again" className="text-xs text-muted-foreground cursor-pointer select-none">
            Don't show this warning again
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
          <Button type="button" variant="ghost" size="default" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => onConfirm(dontShowAgain)}
            className="text-xs font-semibold"
          >
            Enable Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
