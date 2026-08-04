import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type SettingRowProps = {
  title: string;
  description?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
};

export function SettingRow({
  title,
  description,
  children,
  htmlFor,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-1.5 border-b border-border/15 dark:border-border/10 last:border-b-0 last:pb-0 first:pt-0',
        className
      )}
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground cursor-pointer block select-none">
            {title}
          </label>
        ) : (
          <p className="text-xs font-semibold text-foreground select-none">{title}</p>
        )}
        {description && (
          <p className="text-[11px] text-muted-foreground/75 leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center h-8">{children}</div>
    </div>
  );
}
