import { Compass, Monitor, Moon, Settings, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useTheme, type Theme } from './theme-provider';

const themeOptions: Array<{ value: Theme; label: string; icon: typeof Monitor }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

function PanelHeader({ onClose }: { onClose?: () => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
            aria-controls="panel-settings"
            aria-expanded={settingsOpen}
            aria-label="Open settings"
            onClick={() => setSettingsOpen((open) => !open)}
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

      {settingsOpen ? (
        <div className="mt-3 rounded-xl border bg-card p-3 shadow-sm" id="panel-settings">
          <p className="text-sm font-semibold">Appearance</p>
          <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Theme preference">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                aria-pressed={theme === value}
                className="h-auto flex-col gap-1.5 py-2 text-xs"
                key={value}
                onClick={() => setTheme(value)}
                type="button"
                variant={theme === value ? 'primary' : 'secondary'}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export { PanelHeader };