import { DeinflectionCandidate, LanguageProvider, AnalysisContext, TranslationResult } from './types';

/**
 * Translation Provider provides quick comprehension assistance.
 */
export class TranslationProvider implements LanguageProvider<TranslationResult> {
  public name = 'translation';

  public async lookup(
    candidates: DeinflectionCandidate[],
    context?: AnalysisContext
  ): Promise<TranslationResult[]> {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    const settings = context?.settings;
    if (!settings || !settings.translationEnabled || settings.translationMode === 'off') {
      return [];
    }

    const sourceText = candidates[0].text;
    const mode = settings.translationMode;
    const provider = settings.providerPreference;

    if (mode === 'word') {
      const dictionaryEntries = context?.dictionaryEntries || [];
      if (dictionaryEntries.length > 0) {
        const bestEntry = dictionaryEntries[0];
        if (bestEntry && bestEntry.meanings && bestEntry.meanings.length > 0) {
          return [
            {
              sourceText,
              translatedText: bestEntry.meanings[0],
              mode,
              provider,
              available: true,
            },
          ];
        }
      }

      // If no dictionary match found
      return [
        {
          sourceText,
          translatedText: 'No offline translation found',
          mode,
          provider,
          available: false,
          message: 'No translation available for this word form.',
        },
      ];
    } else if (mode === 'sentence') {
      return [
        {
          sourceText,
          mode,
          provider: 'ai',
          available: false,
          message: 'Available with AI Tutor.',
        },
      ];
    } else if (mode === 'paragraph') {
      return [
        {
          sourceText,
          mode,
          provider: 'ai',
          available: false,
          message: 'Available with AI Tutor.',
        },
      ];
    }

    return [];
  }
}
