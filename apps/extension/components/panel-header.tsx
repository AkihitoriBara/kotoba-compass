import { ArrowLeft, Compass, Settings, X } from 'lucide-react';
import { Button } from './ui/button';

type PanelHeaderProps = {
  onClose?: () => void;
  isSettingsView?: boolean;
  onOpenSettings?: () => void;
  onBack?: () => void;
};

function PanelHeader({ onClose, isSettingsView = false, onOpenSettings, onBack }: PanelHeaderProps) {
  if (isSettingsView) {
    return (
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              aria-label="Back to main view"
              onClick={onBack}
              size="default"
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Back</span>
            </Button>
            <h2 className="text-sm font-bold text-foreground">Settings</h2>
          </div>
          {onClose && (
            <Button
              aria-label="Close panel"
              onClick={onClose}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Kotoba Compass</p>
            <p className="truncate text-xs text-muted-foreground">Japanese immersion companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Open settings"
            onClick={onOpenSettings}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Settings aria-hidden="true" className="size-4" />
          </Button>
          {onClose && (
            <Button
              aria-label="Close panel"
              onClick={onClose}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export { PanelHeader };