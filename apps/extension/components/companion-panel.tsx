import { BookOpen, Brain, NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { useSelectedText } from '../hooks/use-selected-text';
import { useAnalysis } from '../hooks/use-analysis';
import { useSettings } from '../hooks/use-settings';
import { EmptyState } from './empty-state';
import { PanelHeader } from './panel-header';
import { PanelTabs, type PanelTab } from './panel-tabs';
import { DictionaryResult } from './dictionary-result';
import { SelectionErrorState } from './selection-error-state';
import { SelectionLoadingState } from './selection-loading-state';
import { SettingsPage } from './settings/settings-page';
import { TutorView } from './tutor/tutor-view';
import { CardView } from './card-generator/card-view';

const tabContent: Record<
  PanelTab,
  { description: string; icon: typeof BookOpen; title: string }
> = {
  dictionary: {
    title: 'No text selected',
    description:
      'Highlight Japanese text to begin exploring its meaning and usage.',
    icon: BookOpen,
  },
  tutor: {
    title: 'Start a conversation',
    description:
      'Select Japanese text to ask the AI Tutor about grammar and nuance.',
    icon: Brain,
  },
  cards: {
    title: 'Your card preview will appear here',
    description: 'Select Japanese text to prepare a focused mining card.',
    icon: NotebookPen,
  },
};

type CompanionPanelProps = {
  initialSelectedText?: string | null;
  onClose?: () => void;
};

function CompanionPanel({ initialSelectedText, onClose }: CompanionPanelProps = {}) {
  const [activeTab, setActiveTab] = useState<PanelTab>('dictionary');
  const [currentView, setCurrentView] = useState<'main' | 'settings'>('main');

  const {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettingsJson,
  } = useSettings();

  const { error, loading, refresh, selectedText } = useSelectedText(initialSelectedText);
  const { error: analysisError, loading: analyzing, result } = useAnalysis(selectedText, settings);
  const { description, icon: Icon, title } = tabContent[activeTab];

  function renderContent() {
    if (activeTab === 'tutor') {
      return <TutorView analysisResult={result} />;
    }
    if (activeTab === 'cards') {
      return <CardView analysisResult={result} settings={settings} />;
    }
    if (activeTab !== 'dictionary')
      return (
        <EmptyState
          description={description}
          icon={<Icon aria-hidden="true" className="size-5" />}
          title={title}
        />
      );
    if (loading) return <SelectionLoadingState />;
    if (error)
      return (
        <SelectionErrorState error={error} onRetry={() => void refresh()} />
      );
    if (selectedText) {
      if (analyzing) return <SelectionLoadingState />;
      if (analysisError) {
        return (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-sm text-red-500">
            {analysisError}
          </div>
        );
      }
      if (result) {
        return (
          <DictionaryResult
            entries={result.dictionary}
            kanji={result.kanji}
            names={result.names}
            grammar={result.grammar}
            sections={result.sections}
            warnings={result.warnings}
            sourceText={result.sourceText}
            translation={result.translation}
          />
        );
      }
    }
    return (
      <EmptyState
        description={description}
        icon={<Icon aria-hidden="true" className="size-5" />}
        title={title}
      />
    );
  }

  const isSettingsView = currentView === 'settings';

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground sm:rounded-xl sm:border sm:shadow-sm">
      <PanelHeader
        onClose={onClose}
        isSettingsView={isSettingsView}
        onOpenSettings={() => setCurrentView('settings')}
        onBack={() => setCurrentView('main')}
      />

      {isSettingsView ? (
        <SettingsPage
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
          onExport={exportSettings}
          onImportJson={importSettingsJson}
        />
      ) : (
        <>
          <PanelTabs activeTab={activeTab} onChange={setActiveTab} />
          <div
            aria-labelledby={`${activeTab}-tab`}
            className="flex min-h-0 flex-1 overflow-y-auto"
            id={`${activeTab}-panel`}
            role="tabpanel"
          >
            {renderContent()}
          </div>
        </>
      )}

      <footer className="border-t px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          {isSettingsView ? 'Kotoba Compass Settings' : 'Ready when you find something interesting.'}
        </p>
      </footer>
    </main>
  );
}

export { CompanionPanel };
