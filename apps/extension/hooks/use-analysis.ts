import { useEffect, useState } from 'react';
import { LanguageAnalysisEngine } from '../lib/analysis/engine';
import { VocabularyProvider } from '../lib/analysis/vocabulary-provider';
import { LanguageAnalysisResult } from '../lib/analysis/types';

let engineInstance: LanguageAnalysisEngine | null = null;

function getEngine(): LanguageAnalysisEngine {
  if (!engineInstance) {
    engineInstance = new LanguageAnalysisEngine();
    engineInstance.registerProvider(new VocabularyProvider());
  }
  return engineInstance;
}

export function useAnalysis(text: string | null) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LanguageAnalysisResult | null>(null);
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
    engine.analyze(text)
      .then((res) => {
        if (!isCurrent) return;
        setResult(res);
        setLoading(false);
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
