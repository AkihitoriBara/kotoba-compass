import { useState, useRef, ChangeEvent } from 'react';
import {
  Search,
  X,
  Palette,
  BookOpen,
  Languages,
  Pickaxe,
  Brain,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { KotobaSettings, FrontCardFormat, TranslationMode } from '../../lib/analysis/types';
import { useTheme, Theme } from '../theme-provider';
import { SettingsSection } from './settings-section';
import { SettingRow } from './setting-row';
import { ToggleSetting } from './toggle-setting';
import { SelectSetting } from './select-setting';
import { FuriganaWarningDialog } from './furigana-warning-dialog';
import { ResetConfirmDialog } from './reset-confirm-dialog';
import { Button } from '../ui/button';

type SettingsPageProps = {
  settings: KotobaSettings;
  onUpdate: (partial: Partial<KotobaSettings>) => Promise<KotobaSettings>;
  onReset: () => Promise<KotobaSettings>;
  onExport: () => void;
  onImportJson: (jsonStr: string) => Promise<{ success: boolean; settings?: KotobaSettings; error?: string }>;
};

export function SettingsPage({
  settings,
  onUpdate,
  onReset,
  onExport,
  onImportJson,
}: SettingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { setTheme } = useTheme();

  // Modals & Feedback state
  const [showFuriganaWarning, setShowFuriganaWarning] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extensionVersion = typeof browser !== 'undefined' && browser.runtime?.getManifest
    ? browser.runtime.getManifest().version
    : '1.0.0';

  const query = searchQuery.trim().toLowerCase();

  function matches(text: string): boolean {
    if (!query) return true;
    return text.toLowerCase().includes(query);
  }

  // --- Handlers ---
  const handleThemeChange = (val: string) => {
    const themeVal = val as Theme;
    setTheme(themeVal);
    void onUpdate({
      general: { ...settings.general, theme: themeVal },
    });
  };

  const handleDictionaryToggle = (key: keyof KotobaSettings['dictionary'], checked: boolean) => {
    void onUpdate({
      dictionary: {
        ...settings.dictionary,
        [key]: checked,
      },
    });
  };

  const handleTranslationToggle = (checked: boolean) => {
    void onUpdate({
      translation: {
        ...settings.translation,
        enabled: checked,
      },
    });
  };

  const handleTranslationModeChange = (val: string) => {
    void onUpdate({
      translation: {
        ...settings.translation,
        mode: val as TranslationMode,
      },
    });
  };

  const handleMiningFormatChange = (val: string) => {
    void onUpdate({
      mining: {
        ...settings.mining,
        frontCardFormat: val as FrontCardFormat,
      },
    });
  };

  const handleFuriganaToggleClick = (nextChecked: boolean) => {
    if (nextChecked) {
      if (settings.mining.showFrontFuriganaWarning) {
        setShowFuriganaWarning(true);
      } else {
        void onUpdate({
          mining: {
            ...settings.mining,
            furiganaOnFront: true,
          },
        });
      }
    } else {
      void onUpdate({
        mining: {
          ...settings.mining,
          furiganaOnFront: false,
        },
      });
    }
  };

  const handleConfirmFuriganaWarning = (dontShowAgain: boolean) => {
    setShowFuriganaWarning(false);
    void onUpdate({
      mining: {
        ...settings.mining,
        furiganaOnFront: true,
        showFrontFuriganaWarning: !dontShowAgain,
      },
    });
  };

  const handleConfirmReset = async () => {
    setShowResetConfirm(false);
    await onReset();
    setImportStatus({ type: 'success', message: 'Settings successfully reset to defaults.' });
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const res = await onImportJson(content);
        if (res.success) {
          setImportStatus({ type: 'success', message: 'Settings imported successfully.' });
        } else {
          setImportStatus({ type: 'error', message: res.error || 'Invalid settings file.' });
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Section Visibility matchers
  const showAppearance = matches('appearance') || matches('theme') || matches('general');
  const showDictionary = matches('dictionary') || matches('vocabulary') || matches('kanji') || matches('names') || matches('grammar');
  const showTranslation = matches('translation') || matches('mode') || matches('enable');
  const showMining = matches('mining') || matches('furigana') || matches('card format');
  const showAiTutor = matches('ai tutor') || matches('ai') || matches('tutor');
  const showAdvanced = matches('advanced') || matches('reset') || matches('export') || matches('import') || matches('version');

  const hasAnyMatch = showAppearance || showDictionary || showTranslation || showMining || showAiTutor || showAdvanced;

  return (
    <div className="flex flex-1 flex-col p-3 space-y-3 overflow-y-auto">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2 size-4 text-muted-foreground/80" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="h-8 w-full rounded-lg border border-border/70 bg-muted/20 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 transition-all hover:border-border focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary dark:border-border/40 dark:bg-muted/30"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Import / Reset Status Feedback Banner */}
      {importStatus && (
        <div
          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs animate-in fade-in ${
            importStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <p className="font-medium">{importStatus.message}</p>
        </div>
      )}

      {!hasAnyMatch && (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No settings found matching "{searchQuery}".
        </div>
      )}

      {/* Appearance Section */}
      {showAppearance && (
        <SettingsSection title="Appearance" description="Customize interface theme and preferences" icon={Palette}>
          {matches('theme') && (
            <SettingRow title="Theme" description="Select your preferred application color theme" htmlFor="setting-theme">
              <SelectSetting
                id="setting-theme"
                value={settings.general.theme}
                onChange={handleThemeChange}
                options={[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
            </SettingRow>
          )}
        </SettingsSection>
      )}

      {/* Dictionary Section */}
      {showDictionary && (
        <SettingsSection title="Dictionary" description="Control section visibility in analysis results" icon={BookOpen}>
          {matches('vocabulary') && (
            <SettingRow title="Vocabulary" description="Include word definitions and part of speech" htmlFor="setting-vocab">
              <ToggleSetting
                id="setting-vocab"
                checked={settings.dictionary.vocabulary}
                onChange={(checked) => handleDictionaryToggle('vocabulary', checked)}
              />
            </SettingRow>
          )}
          {matches('kanji') && (
            <SettingRow title="Kanji" description="Display individual kanji readings and radicals" htmlFor="setting-kanji">
              <ToggleSetting
                id="setting-kanji"
                checked={settings.dictionary.kanji}
                onChange={(checked) => handleDictionaryToggle('kanji', checked)}
              />
            </SettingRow>
          )}
          {matches('names') && (
            <SettingRow title="Names" description="Detect Japanese proper nouns and location names" htmlFor="setting-names">
              <ToggleSetting
                id="setting-names"
                checked={settings.dictionary.names}
                onChange={(checked) => handleDictionaryToggle('names', checked)}
              />
            </SettingRow>
          )}
          {matches('grammar') && (
            <SettingRow title="Grammar" description="Show verb inflections and grammar points" htmlFor="setting-grammar">
              <ToggleSetting
                id="setting-grammar"
                checked={settings.dictionary.grammar}
                onChange={(checked) => handleDictionaryToggle('grammar', checked)}
              />
            </SettingRow>
          )}
        </SettingsSection>
      )}

      {/* Translation Section */}
      {showTranslation && (
        <SettingsSection title="Translation" description="Configure inline translation behavior" icon={Languages}>
          {matches('enable') && (
            <SettingRow title="Enable Translation" description="Show context translation for selected text" htmlFor="setting-translation-toggle">
              <ToggleSetting
                id="setting-translation-toggle"
                checked={settings.translation.enabled}
                onChange={handleTranslationToggle}
              />
            </SettingRow>
          )}
          {matches('mode') && (
            <SettingRow title="Translation Mode" description="Choose translation granularity level" htmlFor="setting-translation-mode">
              <SelectSetting
                id="setting-translation-mode"
                value={settings.translation.mode}
                onChange={handleTranslationModeChange}
                disabled={!settings.translation.enabled}
                options={[
                  { value: 'word', label: 'Word' },
                  { value: 'sentence', label: 'Sentence' },
                  { value: 'paragraph', label: 'Paragraph' },
                ]}
              />
            </SettingRow>
          )}
        </SettingsSection>
      )}

      {/* Mining Section */}
      {showMining && (
        <SettingsSection title="Mining" description="Anki mining card preferences" icon={Pickaxe}>
          {matches('card format') && (
            <SettingRow title="Front Card Format" description="Default layout for card front side" htmlFor="setting-mining-format">
              <SelectSetting
                id="setting-mining-format"
                value={settings.mining.frontCardFormat}
                onChange={handleMiningFormatChange}
                options={[
                  { value: 'word', label: 'Word' },
                  { value: 'sentence', label: 'Sentence' },
                  { value: 'cloze', label: 'Cloze' },
                ]}
              />
            </SettingRow>
          )}
          {matches('furigana') && (
            <SettingRow title="Front-side Furigana" description="Display furigana readings on front of mined cards" htmlFor="setting-mining-furigana">
              <ToggleSetting
                id="setting-mining-furigana"
                checked={settings.mining.furiganaOnFront}
                onChange={handleFuriganaToggleClick}
              />
            </SettingRow>
          )}
        </SettingsSection>
      )}

      {/* AI Tutor Section */}
      {showAiTutor && (
        <SettingsSection title="AI Tutor" description="AI assistance configuration" icon={Brain}>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Tutor</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
            <p className="text-xs font-medium text-foreground leading-relaxed">
              The AI Tutor will answer questions about the selected Japanese text only.
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              It is designed to explain grammar, nuance, and meaning—not act as a general-purpose chatbot.
            </p>
          </div>
        </SettingsSection>
      )}

      {/* Advanced Section */}
      {showAdvanced && (
        <SettingsSection title="Advanced" description="Maintenance and configuration backup" icon={Sliders}>
          <SettingRow title="Export Settings" description="Download configuration file as JSON">
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={onExport}
              className="h-8 text-xs font-semibold px-3 gap-1.5"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          </SettingRow>

          <SettingRow title="Import Settings" description="Restore configuration from a JSON file">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs font-semibold px-3 gap-1.5"
            >
              <Upload className="size-3.5" />
              Import
            </Button>
          </SettingRow>

          <SettingRow title="Reset Settings" description="Restore all settings to default values">
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => setShowResetConfirm(true)}
              className="h-8 text-xs font-semibold px-3 text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </SettingRow>

          <SettingRow title="Version" description="Extension release build version">
            <span className="text-xs font-mono font-bold text-muted-foreground/90 bg-muted/60 px-2 py-0.5 rounded border border-border/30">
              v{extensionVersion}
            </span>
          </SettingRow>
        </SettingsSection>
      )}

      {/* Modals */}
      <FuriganaWarningDialog
        isOpen={showFuriganaWarning}
        onConfirm={handleConfirmFuriganaWarning}
        onCancel={() => setShowFuriganaWarning(false)}
      />

      <ResetConfirmDialog
        isOpen={showResetConfirm}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
