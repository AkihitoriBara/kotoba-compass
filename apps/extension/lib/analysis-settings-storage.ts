import { KotobaSettings, AnalysisSettings } from './analysis/types';

export const CURRENT_SETTINGS_VERSION = 1;
export const KOTOBA_SETTINGS_STORAGE_KEY = 'kotoba-compass:settings';

export const ANALYSIS_SETTINGS_KEYS = {
  TRANSLATION_ENABLED: 'kotoba-compass:settings:translation-enabled',
  TRANSLATION_MODE: 'kotoba-compass:settings:translation-mode',
  PROVIDER_PREFERENCE: 'kotoba-compass:settings:provider-preference',
  AUTOMATIC_TRANSLATION: 'kotoba-compass:settings:automatic-translation',
};

export const DEFAULT_KOTOBA_SETTINGS: KotobaSettings = {
  version: CURRENT_SETTINGS_VERSION,
  general: {
    theme: 'system',
  },
  dictionary: {
    vocabulary: true,
    kanji: true,
    names: true,
    grammar: true,
  },
  translation: {
    enabled: false,
    mode: 'word',
    providerPreference: 'offline',
  },
  mining: {
    frontCardFormat: 'word',
    furiganaOnFront: false,
    showFrontFuriganaWarning: true,
  },
  aiTutor: {},
  translationEnabled: false,
  translationMode: 'word',
  providerPreference: 'offline',
  automaticTranslation: false,
};

export const DEFAULT_ANALYSIS_SETTINGS = DEFAULT_KOTOBA_SETTINGS;

const VALID_THEMES = new Set(['system', 'light', 'dark']);
const VALID_TRANSLATION_MODES = new Set(['off', 'word', 'sentence', 'paragraph']);
const VALID_FRONT_CARD_FORMATS = new Set(['word', 'sentence', 'cloze']);

/**
 * Strictly validates that a parsed JSON object conforms to the KotobaSettings schema.
 * Rejects invalid enum values (e.g. theme: "banana"), missing required properties, or invalid versions.
 */
export function validateKotobaSettings(obj: any): { valid: boolean; error?: string } {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { valid: false, error: 'Settings content must be a JSON object.' };
  }

  if (typeof obj.version !== 'number' || obj.version <= 0) {
    return { valid: false, error: 'Invalid or missing settings version number.' };
  }

  if (obj.general !== undefined) {
    if (typeof obj.general !== 'object') {
      return { valid: false, error: 'Invalid "general" settings block.' };
    }
    if (obj.general.theme !== undefined && !VALID_THEMES.has(obj.general.theme)) {
      return { valid: false, error: `Invalid theme value "${obj.general.theme}". Expected 'system', 'light', or 'dark'.` };
    }
  }

  if (obj.translation !== undefined) {
    if (typeof obj.translation !== 'object') {
      return { valid: false, error: 'Invalid "translation" settings block.' };
    }
    if (obj.translation.mode !== undefined && !VALID_TRANSLATION_MODES.has(obj.translation.mode)) {
      return { valid: false, error: `Invalid translation mode "${obj.translation.mode}".` };
    }
  }

  if (obj.mining !== undefined) {
    if (typeof obj.mining !== 'object') {
      return { valid: false, error: 'Invalid "mining" settings block.' };
    }
    if (obj.mining.frontCardFormat !== undefined && !VALID_FRONT_CARD_FORMATS.has(obj.mining.frontCardFormat)) {
      return { valid: false, error: `Invalid front card format "${obj.mining.frontCardFormat}".` };
    }
  }

  return { valid: true };
}

/**
 * Fills missing properties with default values without overwriting existing settings.
 * Also synchronizes top-level legacy keys.
 */
export function mergeDefaults(stored?: any): KotobaSettings {
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_KOTOBA_SETTINGS };
  }

  const legacyEnabled = stored[ANALYSIS_SETTINGS_KEYS.TRANSLATION_ENABLED] ?? stored.translationEnabled;
  const legacyMode = stored[ANALYSIS_SETTINGS_KEYS.TRANSLATION_MODE] ?? stored.translationMode;
  const legacyProvider = stored[ANALYSIS_SETTINGS_KEYS.PROVIDER_PREFERENCE] ?? stored.providerPreference;
  const legacyAuto = stored[ANALYSIS_SETTINGS_KEYS.AUTOMATIC_TRANSLATION] ?? stored.automaticTranslation;

  const translationEnabled = stored.translation?.enabled ?? legacyEnabled ?? DEFAULT_KOTOBA_SETTINGS.translation.enabled;
  const translationMode = VALID_TRANSLATION_MODES.has(stored.translation?.mode)
    ? stored.translation.mode
    : (VALID_TRANSLATION_MODES.has(legacyMode) ? legacyMode : DEFAULT_KOTOBA_SETTINGS.translation.mode);

  const theme = VALID_THEMES.has(stored.general?.theme) ? stored.general.theme : DEFAULT_KOTOBA_SETTINGS.general.theme;
  const frontCardFormat = VALID_FRONT_CARD_FORMATS.has(stored.mining?.frontCardFormat)
    ? stored.mining.frontCardFormat
    : DEFAULT_KOTOBA_SETTINGS.mining.frontCardFormat;

  const merged: KotobaSettings = {
    version: typeof stored.version === 'number' ? stored.version : CURRENT_SETTINGS_VERSION,
    general: {
      theme,
    },
    dictionary: {
      vocabulary: stored.dictionary?.vocabulary ?? DEFAULT_KOTOBA_SETTINGS.dictionary.vocabulary,
      kanji: stored.dictionary?.kanji ?? DEFAULT_KOTOBA_SETTINGS.dictionary.kanji,
      names: stored.dictionary?.names ?? DEFAULT_KOTOBA_SETTINGS.dictionary.names,
      grammar: stored.dictionary?.grammar ?? DEFAULT_KOTOBA_SETTINGS.dictionary.grammar,
    },
    translation: {
      enabled: translationEnabled,
      mode: translationMode,
      providerPreference: stored.translation?.providerPreference ?? legacyProvider ?? 'offline',
    },
    mining: {
      frontCardFormat,
      furiganaOnFront: stored.mining?.furiganaOnFront ?? DEFAULT_KOTOBA_SETTINGS.mining.furiganaOnFront,
      showFrontFuriganaWarning: stored.mining?.showFrontFuriganaWarning ?? DEFAULT_KOTOBA_SETTINGS.mining.showFrontFuriganaWarning,
    },
    aiTutor: stored.aiTutor ?? {},
    translationEnabled,
    translationMode,
    providerPreference: legacyProvider ?? 'offline',
    automaticTranslation: legacyAuto ?? false,
  };

  return merged;
}

export async function loadSettings(): Promise<KotobaSettings> {
  try {
    const raw = (await browser.storage.local.get([
      KOTOBA_SETTINGS_STORAGE_KEY,
      ANALYSIS_SETTINGS_KEYS.TRANSLATION_ENABLED,
      ANALYSIS_SETTINGS_KEYS.TRANSLATION_MODE,
      ANALYSIS_SETTINGS_KEYS.PROVIDER_PREFERENCE,
      ANALYSIS_SETTINGS_KEYS.AUTOMATIC_TRANSLATION,
    ])) as any;

    const storedData = raw[KOTOBA_SETTINGS_STORAGE_KEY] || raw;
    const settings = mergeDefaults(storedData);

    await browser.storage.local.set({ [KOTOBA_SETTINGS_STORAGE_KEY]: settings });
    return settings;
  } catch (err) {
    console.error('[SettingsStorage] Failed to load settings:', err);
    return { ...DEFAULT_KOTOBA_SETTINGS };
  }
}

export async function saveSettings(newSettings: Partial<KotobaSettings>): Promise<KotobaSettings> {
  try {
    const current = await loadSettings();
    const updated: KotobaSettings = mergeDefaults({
      ...current,
      ...newSettings,
      general: { ...current.general, ...(newSettings.general || {}) },
      dictionary: { ...current.dictionary, ...(newSettings.dictionary || {}) },
      translation: { ...current.translation, ...(newSettings.translation || {}) },
      mining: { ...current.mining, ...(newSettings.mining || {}) },
      aiTutor: { ...current.aiTutor, ...(newSettings.aiTutor || {}) },
    });

    await browser.storage.local.set({ [KOTOBA_SETTINGS_STORAGE_KEY]: updated });
    return updated;
  } catch (err) {
    console.error('[SettingsStorage] Failed to save settings:', err);
    return mergeDefaults(newSettings);
  }
}

export async function resetSettings(): Promise<KotobaSettings> {
  try {
    await browser.storage.local.set({ [KOTOBA_SETTINGS_STORAGE_KEY]: DEFAULT_KOTOBA_SETTINGS });
    return { ...DEFAULT_KOTOBA_SETTINGS };
  } catch (err) {
    console.error('[SettingsStorage] Failed to reset settings:', err);
    return { ...DEFAULT_KOTOBA_SETTINGS };
  }
}

export function exportSettings(settings: KotobaSettings): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `kotoba-compass-settings-v${settings.version || 1}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importSettingsJson(jsonStr: string): Promise<{ success: boolean; settings?: KotobaSettings; error?: string }> {
  try {
    const parsed = JSON.parse(jsonStr);
    const validation = validateKotobaSettings(parsed);
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid settings schema.' };
    }

    const merged = mergeDefaults(parsed);
    await browser.storage.local.set({ [KOTOBA_SETTINGS_STORAGE_KEY]: merged });
    return { success: true, settings: merged };
  } catch (err) {
    return { success: false, error: 'Failed to parse JSON settings file.' };
  }
}

// Legacy function aliases for backward compatibility
export const getAnalysisSettings = loadSettings;
export const saveAnalysisSettings = async (settings: Partial<AnalysisSettings>): Promise<void> => {
  await saveSettings(settings);
};
