import { FileText, AlignLeft, Scissors } from 'lucide-react';
import { CardTemplate } from '../../lib/card-generator/types';
import { cn } from '../../lib/utils';

type TemplateSelectorProps = {
  selected: CardTemplate;
  onChange: (template: CardTemplate) => void;
  disabled?: boolean;
};

const TEMPLATES: { template: CardTemplate; label: string; icon: typeof FileText }[] = [
  { template: 'word', label: 'Word', icon: FileText },
  { template: 'sentence', label: 'Sentence', icon: AlignLeft },
  { template: 'cloze', label: 'Cloze', icon: Scissors },
];

export function TemplateSelector({ selected, onChange, disabled }: TemplateSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1 dark:border-border/30 dark:bg-muted/20">
      {TEMPLATES.map(({ template, label, icon: Icon }) => {
        const isActive = selected === template;
        return (
          <button
            key={template}
            type="button"
            disabled={disabled}
            onClick={() => onChange(template)}
            className={cn(
              'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all select-none',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
