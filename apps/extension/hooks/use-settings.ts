import { useEffect, useState, useCallback } from 'react';
import { KotobaSettings } from '../lib/analysis/types';
import {
  DEFAULT_KOTOBA_SETTINGS,
  loadSettings,
  saveSettings,
  resetSettings as resetSettingsStorage,
  exportSettings as exportSettingsStorage,
  importSettingsJson as importSettingsJsonStorage,
} from '../lib/analysis-settings-storage';

export function useSettings() {
  const [settings, setSettings] = useState<KotobaSettings>(DEFAULT_KOTOBA_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadSettings().then((s) => {
      if (isMounted) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<KotobaSettings>) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    return updated;
  }, []);

  const resetAllSettings = useCallback(async () => {
    const reset = await resetSettingsStorage();
    setSettings(reset);
    return reset;
  }, []);

  const exportCurrentSettings = useCallback(() => {
    exportSettingsStorage(settings);
  }, [settings]);

  const importSettingsJson = useCallback(async (jsonStr: string) => {
    const res = await importSettingsJsonStorage(jsonStr);
    if (res.success && res.settings) {
      setSettings(res.settings);
    }
    return res;
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    resetSettings: resetAllSettings,
    exportSettings: exportCurrentSettings,
    importSettingsJson,
  };
}
