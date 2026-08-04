import { useState, useRef, useEffect, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectSettingProps = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  className?: string;
};

export function SelectSetting({
  value,
  options,
  onChange,
  disabled = false,
  id,
  'aria-label': ariaLabel,
  className,
}: SelectSettingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (!containerRef.current) return;
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const isInside =
        path.length > 0
          ? path.includes(containerRef.current)
          : containerRef.current.contains(event.target as Node);

      if (!isInside) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTriggerClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  const handleSelect = (e: ReactMouseEvent<HTMLDivElement>, optionValue: string) => {
    e.stopPropagation();
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel || selectedOption?.label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-8 min-w-[110px] items-center justify-between gap-2 rounded-lg border border-border/70 bg-card px-3 text-xs font-medium text-foreground shadow-2xs transition-all hover:border-border hover:bg-accent/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/40 dark:bg-muted/30',
          isOpen && 'border-primary ring-1 ring-primary'
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180 text-foreground'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={value}
          className="absolute right-0 z-50 mt-1 min-w-[130px] rounded-lg border border-border/80 bg-popover p-1 text-xs shadow-md backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100 dark:border-border/50"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={(e) => handleSelect(e, opt.value)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors select-none',
                  isSelected
                    ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/20'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
