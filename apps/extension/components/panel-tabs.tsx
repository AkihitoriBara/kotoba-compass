import { BookOpen, Brain, NotebookPen } from 'lucide-react';
import type { ComponentType, KeyboardEvent } from 'react';
import { cn } from '../lib/utils';

export type PanelTab = 'dictionary' | 'tutor' | 'cards';

type TabDefinition = {
  id: PanelTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const tabs: TabDefinition[] = [
  { id: 'dictionary', label: 'Dictionary', icon: BookOpen },
  { id: 'tutor', label: 'AI Tutor', icon: Brain },
  { id: 'cards', label: 'Card Generator', icon: NotebookPen },
];

type PanelTabsProps = {
  activeTab: PanelTab;
  onChange: (tab: PanelTab) => void;
};

function PanelTabs({ activeTab, onChange }: PanelTabsProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTab: PanelTab) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const currentIndex = tabs.findIndex(({ id }) => id === currentTab);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    onChange(nextTab.id);
    document.getElementById(`${nextTab.id}-tab`)?.focus();
  }

  return (
    <nav aria-label="Companion Panel sections" className="border-b px-3 py-2">
      <div className="grid grid-cols-3 gap-1" role="tablist">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            aria-controls={`${id}-panel`}
            aria-selected={activeTab === id}
            className={cn(
              'flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === id
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            id={`${id}-tab`}
            key={id}
            onClick={() => onChange(id)}
            onKeyDown={(event) => handleKeyDown(event, id)}
            role="tab"
            tabIndex={activeTab === id ? 0 : -1}
            type="button"
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { PanelTabs };