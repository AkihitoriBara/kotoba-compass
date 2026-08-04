import { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/utils';

type SettingsSectionProps = {
  title: string;
  description?: string;
  icon?: ElementType;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

/**
 * Reusable SettingsSection component acting as a decoupled card container
 * for setting categories. Designed generically to accommodate future feature sections
 * (e.g., Keyboard Shortcuts, Developer Options, Privacy, AI Providers) without layout changes.
 */
export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  action,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border/60 bg-card/70 p-3.5 shadow-2xs transition-all dark:border-border/30 dark:bg-card/40 space-y-2',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/15 pb-2 dark:border-border/10">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="size-4 text-primary shrink-0" aria-hidden="true" />}
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] text-muted-foreground/75 mt-0.5 truncate leading-none">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
