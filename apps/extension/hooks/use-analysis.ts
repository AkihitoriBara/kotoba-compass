import { useEffect, useState } from 'react';
import { LanguageAnalysisEngine } from '../lib/analysis/engine';
import { VocabularyProvider } from '../lib/analysis/vocabulary-provider';
import { KanjiProvider } from '../lib/analysis/kanji-provider';
import { NameProvider } from '../lib/analysis/name-provider';
import { GrammarProvider } from '../lib/analysis/grammar-provider';
import { TranslationProvider } from '../lib/analysis/translation-provider';
import { ResultProcessor } from '../lib/analysis/result-processor';
import { ProcessedAnalysisResult } from '../lib/analysis/types';
import { getAnalysisSettings } from '../lib/analysis-settings-storage';

let engineInstance: LanguageAnalysisEngine | null = null;

function getEngine(): LanguageAnalysisEngine {
  if (!engineInstance) {
    engineInstance = new LanguageAnalysisEngine();
    engineInstance.registerProvider(new VocabularyProvider());
    engineInstance.registerProvider(new KanjiProvider());
    engineInstance.registerProvider(new NameProvider());
    engineInstance.registerProvider(new GrammarProvider());
    engineInstance.registerProvider(new TranslationProvider());
  }
  return engineInstance;
}

export function useAnalysis(text: string | null) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text || !text.trim()) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isCurrent = true;
    setLoading(true);
    setError(null);

    const engine = getEngine();
    const processor = new ResultProcessor();

    getAnalysisSettings()
      .then((settings) => {
        if (!isCurrent) return;
        return engine.analyze(text, { settings }).then((res) => {
          if (!isCurrent) return;
          const processed = processor.process(res);
          setResult(processed);
          setLoading(false);
        });
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('[useAnalysis] lookup failed:', err);
        setError('Failed to analyze the selected text.');
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [text]);

  return { loading, result, error };
}
