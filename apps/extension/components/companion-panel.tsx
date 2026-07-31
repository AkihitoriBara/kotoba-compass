import { BookOpen, Brain, NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from './empty-state';
import { PanelHeader } from './panel-header';
import { PanelTabs, type PanelTab } from './panel-tabs';

const tabContent: Record<PanelTab, { description: string; icon: typeof BookOpen; title: string }> = {
  dictionary: {
    title: 'No text selected',
    description: 'Highlight Japanese text to begin exploring its meaning and usage.',
    icon: BookOpen,
  },
  tutor: {
    title: 'Start a conversation',
    description: 'Select Japanese text to ask the AI Tutor about grammar and nuance.',
    icon: Brain,
  },
  cards: {
    title: 'Your card preview will appear here',
    description: 'Select Japanese text to prepare a focused mining card.',
    icon: NotebookPen,
  },
};

function CompanionPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>('dictionary');
  const { description, icon: Icon, title } = tabContent[activeTab];

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground sm:rounded-xl sm:border sm:shadow-sm">
      <PanelHeader />
      <PanelTabs activeTab={activeTab} onChange={setActiveTab} />
      <div
        aria-labelledby={`${activeTab}-tab`}
        className="flex min-h-0 flex-1 overflow-y-auto"
        id={`${activeTab}-panel`}
        role="tabpanel"
      >
        <EmptyState description={description} icon={<Icon aria-hidden="true" className="size-5" />} title={title} />
      </div>
      <footer className="border-t px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">Ready when you find something interesting.</p>
      </footer>
    </main>
  );
}

export { CompanionPanel };