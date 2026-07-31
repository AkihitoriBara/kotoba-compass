import { DeinflectionCandidate, GrammarResult, LanguageProvider, ProviderContext, VerbClass, PartOfSpeech, GrammarTransformation, GrammarPoint, Voice } from './types';

/**
 * Standard rule-based conjugation generator to reconstruct verb and adjective transitions.
 */
function conjugate(currentForm: string, rule: string, verbClass: VerbClass): { to: string; reason: string } {
  const norm = currentForm.trim();

  // Irregular verb: する
  if (norm === 'する') {
    if (rule === 'polite') return { to: 'します', reason: 'Polite Form' };
    if (rule === 'negative') return { to: 'しない', reason: 'Negative Form' };
    if (rule === 'past') return { to: 'した', reason: 'Past Tense' };
    if (rule === 'te-form') return { to: 'して', reason: 'Te Form' };
    if (rule === 'potential') return { to: 'できる', reason: 'Potential Form' };
    if (rule === 'passive') return { to: 'される', reason: 'Passive Voice' };
    if (rule === 'causative') return { to: 'させる', reason: 'Causative Voice' };
    if (rule === 'volitional') return { to: 'しよう', reason: 'Volitional Form' };
  }

  // Irregular verb: 来る / くる
  if (norm === '来る' || norm === 'くる') {
    const kanji = norm === '来る';
    if (rule === 'polite') return { to: kanji ? '来ます' : 'きます', reason: 'Polite Form' };
    if (rule === 'negative') return { to: kanji ? '来ない' : 'こない', reason: 'Negative Form' };
    if (rule === 'past') return { to: kanji ? '来た' : 'きた', reason: 'Past Tense' };
    if (rule === 'te-form') return { to: kanji ? '来て' : 'きて', reason: 'Te Form' };
    if (rule === 'potential') return { to: kanji ? '来られる' : 'こられる', reason: 'Potential Form' };
    if (rule === 'passive') return { to: kanji ? '来られる' : 'こられる', reason: 'Passive Voice' };
    if (rule === 'causative') return { to: kanji ? '来させる' : 'こさせる', reason: 'Causative Voice' };
    if (rule === 'volitional') return { to: kanji ? '来よう' : 'こよう', reason: 'Volitional Form' };
  }

  // Suffix-based modifications for standard conjugations
  if (norm.endsWith('ます')) {
    if (rule === 'past') return { to: norm.slice(0, -2) + 'ました', reason: 'Past Tense' };
    if (rule === 'negative') return { to: norm.slice(0, -2) + 'ません', reason: 'Negative Form' };
    if (rule === 'volitional') return { to: norm.slice(0, -2) + 'ましょう', reason: 'Volitional Form' };
  }
  if (norm.endsWith('ません')) {
    if (rule === 'past') return { to: norm + 'でした', reason: 'Past Negative' };
  }
  if (norm.endsWith('ない')) {
    if (rule === 'past') return { to: norm.slice(0, -2) + 'なかった', reason: 'Past Tense' };
    if (rule === 'te-form') return { to: norm.slice(0, -2) + 'なくて', reason: 'Te Form' };
  }

  // --- ICHIDAN CONJUGATIONS ---
  if (verbClass === 'ichidan') {
    const stem = norm.endsWith('る') ? norm.slice(0, -1) : norm;
    if (rule === 'polite') return { to: stem + 'ます', reason: 'Polite Form' };
    if (rule === 'negative') return { to: stem + 'ない', reason: 'Negative Form' };
    if (rule === 'past') return { to: stem + 'た', reason: 'Past Tense' };
    if (rule === 'te-form') return { to: stem + 'て', reason: 'Te Form' };
    if (rule === 'potential') return { to: stem + 'られる', reason: 'Potential Form' };
    if (rule === 'passive') return { to: stem + 'られる', reason: 'Passive Voice' };
    if (rule === 'causative') return { to: stem + 'させる', reason: 'Causative Voice' };
    if (rule === 'volitional') return { to: stem + 'よう', reason: 'Volitional Form' };
    if (rule === 'progressive') return { to: stem + 'ている', reason: 'Progressive Aspect' };
  }

  // --- GODAN CONJUGATIONS ---
  if (verbClass === 'godan') {
    const lastChar = norm.slice(-1);
    const stem = norm.slice(0, -1);

    const aStems: Record<string, string> = { 'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た', 'ぬ': 'な', 'む': 'ま', 'ぶ': 'ば', 'る': 'ら' };
    const iStems: Record<string, string> = { 'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'む': 'み', 'ぶ': 'び', 'る': 'り' };
    const eStems: Record<string, string> = { 'う': 'え', 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'つ': 'て', 'ぬ': 'ね', 'む': 'め', 'ぶ': 'べ', 'る': 'れ' };
    const oStems: Record<string, string> = { 'う': 'お', 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'つ': 'と', 'ぬ': 'の', 'む': 'も', 'ぶ': 'ぼ', 'る': 'ろ' };

    const aStem = stem + (aStems[lastChar] || lastChar);
    const iStem = stem + (iStems[lastChar] || lastChar);
    const eStem = stem + (eStems[lastChar] || lastChar);
    const oStem = stem + (oStems[lastChar] || lastChar);

    if (rule === 'polite') return { to: iStem + 'ます', reason: 'Polite Form' };
    if (rule === 'negative') return { to: aStem + 'ない', reason: 'Negative Form' };
    if (rule === 'potential') return { to: eStem + 'る', reason: 'Potential Form' };
    if (rule === 'passive') return { to: aStem + 'れる', reason: 'Passive Voice' };
    if (rule === 'causative') return { to: aStem + 'せる', reason: 'Causative Voice' };
    if (rule === 'volitional') return { to: oStem + 'う', reason: 'Volitional Form' };

    // Past / Te-form (Euphonic Changes)
    if (rule === 'past' || rule === 'te-form') {
      const suffix = rule === 'past' ? 'た' : 'て';
      const voicedSuffix = rule === 'past' ? 'だ' : 'で';

      if (lastChar === 'う' || lastChar === 'つ' || lastChar === 'る') {
        return { to: stem + 'っ' + suffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
      }
      if (lastChar === 'ぬ' || lastChar === 'ぶ' || lastChar === 'む') {
        return { to: stem + 'ん' + voicedSuffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
      }
      if (lastChar === 'く') {
        if (norm === '行く') {
          return { to: '行っ' + suffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
        }
        return { to: stem + 'い' + suffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
      }
      if (lastChar === 'ぐ') {
        return { to: stem + 'い' + voicedSuffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
      }
      if (lastChar === 'す') {
        return { to: stem + 'し' + suffix, reason: rule === 'past' ? 'Past Tense' : 'Te Form' };
      }
    }

    if (rule === 'progressive') {
      const teForm = conjugate(norm, 'te-form', 'godan').to;
      return { to: teForm + 'いる', reason: 'Progressive Aspect' };
    }
  }

  // --- ADJECTIVE CONJUGATIONS ---
  if (verbClass === 'adjective') {
    const stem = norm.endsWith('い') ? norm.slice(0, -1) : norm;
    if (rule === 'negative') return { to: stem + 'くない', reason: 'Negative Form' };
    if (rule === 'past') return { to: stem + 'かった', reason: 'Past Tense' };
    if (rule === 'te-form') return { to: stem + 'くて', reason: 'Te Form' };
  }

  return { to: norm + ' ' + rule, reason: `Inflection: ${rule}` };
}

export class GrammarProvider implements LanguageProvider<GrammarResult> {
  public name = 'grammar';

  public async lookup(candidates: DeinflectionCandidate[], context?: ProviderContext): Promise<GrammarResult[]> {
    const results: GrammarResult[] = [];
    const vocabularyResults = context?.vocabularyResults || [];

    for (const candidate of candidates) {
      // Only perform analysis on candidates that have grammar pathways applied,
      // or if it matches a known verb/adjective dictionary form.
      const hasPathway = candidate.rulesApplied.length > 0;
      const dictForm = candidate.text;

      // Locate corresponding dictionary entry to determine POS and Verb Class
      const matchedEntry = vocabularyResults.find(
        (entry) => entry.word === dictForm || entry.reading === dictForm
      );

      const isVerb = matchedEntry?.partOfSpeech.some((pos) => pos.startsWith('v')) || false;
      const isAdj = matchedEntry?.partOfSpeech.some((pos) => pos.startsWith('adj-i')) || false;

      if (!hasPathway && !isVerb && !isAdj) {
        continue;
      }

      // 1. Classify Part of Speech & Verb Class
      let pos: PartOfSpeech = 'other';
      let vClass: VerbClass | undefined;

      if (isVerb) {
        pos = 'verb';
        const posTags = matchedEntry?.partOfSpeech || [];
        if (posTags.includes('v1')) {
          vClass = 'ichidan';
        } else if (posTags.some((t) => t.startsWith('v5'))) {
          vClass = 'godan';
        } else if (posTags.includes('vs-i') || dictForm === 'する' || dictForm === '来る') {
          vClass = 'irregular';
        } else {
          // Heuristic fallback
          vClass = dictForm.endsWith('る') ? 'ichidan' : 'godan';
        }
      } else if (isAdj) {
        pos = 'adjective';
        vClass = 'adjective';
      } else {
        // Default heuristics
        if (dictForm.endsWith('い')) {
          pos = 'adjective';
          vClass = 'adjective';
        } else if (['る', 'う', 'く', 'ぐ', 'す', 'つ', 'ぬ', 'ぶ', 'む'].includes(dictForm.slice(-1))) {
          pos = 'verb';
          vClass = dictForm.endsWith('る') ? 'ichidan' : 'godan';
        }
      }

      if (!vClass) {
        continue;
      }

      // 2. Parse inflection properties from the pathways
      let polarity: 'positive' | 'negative' = 'positive';
      let tense: 'present' | 'past' = 'present';
      let politeness: 'plain' | 'polite' = 'plain';
      let aspect: 'progressive' | 'perfective' | undefined;
      const voice: Voice[] = [];
      const grammarPoints: GrammarPoint[] = [];

      for (const rule of candidate.rulesApplied) {
        if (rule === 'negative') {
          polarity = 'negative';
          grammarPoints.push({ id: 'grammar-negative', name: 'Negative Form (-nai)', jlptLevel: 'N5' });
        } else if (rule === 'past') {
          tense = 'past';
          grammarPoints.push({ id: 'grammar-past', name: 'Past Tense (-ta)', jlptLevel: 'N5' });
        } else if (rule === 'polite') {
          politeness = 'polite';
          grammarPoints.push({ id: 'grammar-polite', name: 'Polite Form (-masu)', jlptLevel: 'N5' });
        } else if (rule === 'te-form') {
          grammarPoints.push({ id: 'grammar-te', name: 'Te-form (-te)', jlptLevel: 'N5' });
        } else if (rule === 'potential') {
          voice.push('potential');
          grammarPoints.push({ id: 'grammar-potential', name: 'Potential Form', jlptLevel: 'N4' });
        } else if (rule === 'passive') {
          voice.push('passive');
          grammarPoints.push({ id: 'grammar-passive', name: 'Passive Voice', jlptLevel: 'N4' });
        } else if (rule === 'causative') {
          voice.push('causative');
          grammarPoints.push({ id: 'grammar-causative', name: 'Causative Voice', jlptLevel: 'N4' });
        } else if (rule === 'volitional') {
          voice.push('volitional');
          grammarPoints.push({ id: 'grammar-volitional', name: 'Volitional Form', jlptLevel: 'N5' });
        } else if (rule === 'imperative') {
          voice.push('imperative');
          grammarPoints.push({ id: 'grammar-imperative', name: 'Imperative Form', jlptLevel: 'N3' });
        } else if (rule === 'progressive') {
          aspect = 'progressive';
          grammarPoints.push({ id: 'grammar-progressive', name: 'Progressive Aspect (-te iru)', jlptLevel: 'N5' });
        }
      }

      // 3. Generate transformations timeline safely
      const transformations: GrammarTransformation[] = [];
      let currentForm = dictForm;

      try {
        for (const rule of candidate.rulesApplied) {
          const result = conjugate(currentForm, rule, vClass);
          transformations.push({
            from: currentForm,
            to: result.to,
            reason: result.reason,
          });
          currentForm = result.to;
        }
      } catch (e) {
        console.warn(`[GrammarProvider] Transition timeline simplified for candidate "${dictForm}":`, e);
      }

      // Calculate confidence score
      const confidence = matchedEntry ? 'high' : 'medium';

      results.push({
        sourceText: candidates[0]?.text || '', // The query text
        dictionaryForm: dictForm,
        partOfSpeech: pos,
        verbClass: vClass,
        tense,
        polarity,
        politeness,
        voice: voice.length > 0 ? voice : undefined,
        aspect,
        confidence,
        transformations,
        grammarPoints,
      });
    }

    return results;
  }
}
