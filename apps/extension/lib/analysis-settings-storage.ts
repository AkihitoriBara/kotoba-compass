import { AnalysisSettings } from './analysis/types';

export const ANALYSIS_SETTINGS_KEYS = {
  TRANSLATION_ENABLED: 'kotoba-compass:settings:translation-enabled',
  TRANSLATION_MODE: 'kotoba-compass:settings:translation-mode',
  PROVIDER_PREFERENCE: 'kotoba-compass:settings:provider-preference',
  AUTOMATIC_TRANSLATION: 'kotoba-compass:settings:automatic-translation',
};

export const DEFAULT_ANALYSIS_SETTINGS: AnalysisSettings = {
  translationEnabled: false,
  translationMode: 'word',
  providerPreference: 'offline',
  automaticTranslation: false,
};

export async function getAnalysisSettings(): Promise<AnalysisSettings> {
  const stored = (await browser.storage.local.get([
    ANALYSIS_SETTINGS_KEYS.TRANSLATION_ENABLED,
    ANALYSIS_SETTINGS_KEYS.TRANSLATION_MODE,
    ANALYSIS_SETTINGS_KEYS.PROVIDER_PREFERENCE,
    ANALYSIS_SETTINGS_KEYS.AUTOMATIC_TRANSLATION,
  ])) as any;

  return {
    translationEnabled: stored[ANALYSIS_SETTINGS_KEYS.TRANSLATION_ENABLED] ?? DEFAULT_ANALYSIS_SETTINGS.translationEnabled,
    translationMode: stored[ANALYSIS_SETTINGS_KEYS.TRANSLATION_MODE] ?? DEFAULT_ANALYSIS_SETTINGS.translationMode,
    providerPreference: stored[ANALYSIS_SETTINGS_KEYS.PROVIDER_PREFERENCE] ?? DEFAULT_ANALYSIS_SETTINGS.providerPreference,
    automaticTranslation: stored[ANALYSIS_SETTINGS_KEYS.AUTOMATIC_TRANSLATION] ?? DEFAULT_ANALYSIS_SETTINGS.automaticTranslation,
  };
}

export async function saveAnalysisSettings(settings: Partial<AnalysisSettings>): Promise<void> {
  const updates: Record<string, any> = {};
  if (settings.translationEnabled !== undefined) {
    updates[ANALYSIS_SETTINGS_KEYS.TRANSLATION_ENABLED] = settings.translationEnabled;
  }
  if (settings.translationMode !== undefined) {
    updates[ANALYSIS_SETTINGS_KEYS.TRANSLATION_MODE] = settings.translationMode;
  }
  if (settings.providerPreference !== undefined) {
    updates[ANALYSIS_SETTINGS_KEYS.PROVIDER_PREFERENCE] = settings.providerPreference;
  }
  if (settings.automaticTranslation !== undefined) {
    updates[ANALYSIS_SETTINGS_KEYS.AUTOMATIC_TRANSLATION] = settings.automaticTranslation;
  }
  await browser.storage.local.set(updates);
}
