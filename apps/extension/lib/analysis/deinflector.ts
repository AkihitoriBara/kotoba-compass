import { DeinflectionCandidate } from './types';

interface DeinflectRule {
  suffix: string;
  replacement: string;
  rulesApplied: string[];
}

// Grammatical deinflection rules for Japanese verbs and adjectives
const DEINFLECTION_RULES: DeinflectRule[] = [
  // Ichidan / General Polite & Suffix Rules
  { suffix: 'ました', replacement: 'る', rulesApplied: ['polite', 'past'] },
  { suffix: 'ましょう', replacement: 'る', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'ます', replacement: 'る', rulesApplied: ['polite'] },
  { suffix: 'ません', replacement: 'る', rulesApplied: ['polite', 'negative'] },
  { suffix: 'ない', replacement: 'る', rulesApplied: ['negative'] },
  { suffix: 'た', replacement: 'る', rulesApplied: ['past'] },
  { suffix: 'て', replacement: 'る', rulesApplied: ['te-form'] },
  { suffix: 'られる', replacement: 'る', rulesApplied: ['passive', 'potential'] },
  { suffix: 'させる', replacement: 'る', rulesApplied: ['causative'] },
  { suffix: 'よう', replacement: 'る', rulesApplied: ['volitional'] },

  // Godan Verbs Polite forms
  { suffix: 'いました', replacement: 'う', rulesApplied: ['polite', 'past'] },
  { suffix: 'きました', replacement: 'く', rulesApplied: ['polite', 'past'] },
  { suffix: 'ぎました', replacement: 'ぐ', rulesApplied: ['polite', 'past'] },
  { suffix: 'しました', replacement: 'す', rulesApplied: ['polite', 'past'] },
  { suffix: 'ちました', replacement: 'つ', rulesApplied: ['polite', 'past'] },
  { suffix: 'にました', replacement: 'ぬ', rulesApplied: ['polite', 'past'] },
  { suffix: 'みました', replacement: 'む', rulesApplied: ['polite', 'past'] },
  { suffix: 'びました', replacement: 'ぶ', rulesApplied: ['polite', 'past'] },
  { suffix: 'りました', replacement: 'る', rulesApplied: ['polite', 'past'] },

  { suffix: 'いましょう', replacement: 'う', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'きましょう', replacement: 'く', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'ぎましょう', replacement: 'ぐ', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'しましょう', replacement: 'す', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'ちましょう', replacement: 'つ', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'にましょう', replacement: 'ぬ', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'みましょう', replacement: 'む', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'びましょう', replacement: 'ぶ', rulesApplied: ['polite', 'volitional'] },
  { suffix: 'りましょう', replacement: 'る', rulesApplied: ['polite', 'volitional'] },

  { suffix: 'います', replacement: 'う', rulesApplied: ['polite'] },
  { suffix: 'きます', replacement: 'く', rulesApplied: ['polite'] },
  { suffix: 'ぎます', replacement: 'ぐ', rulesApplied: ['polite'] },
  { suffix: 'します', replacement: 'す', rulesApplied: ['polite'] },
  { suffix: 'ちます', replacement: 'つ', rulesApplied: ['polite'] },
  { suffix: 'にます', replacement: 'ぬ', rulesApplied: ['polite'] },
  { suffix: 'みます', replacement: 'む', rulesApplied: ['polite'] },
  { suffix: 'びます', replacement: 'ぶ', rulesApplied: ['polite'] },
  { suffix: 'ります', replacement: 'る', rulesApplied: ['polite'] },

  { suffix: 'いません', replacement: 'う', rulesApplied: ['polite', 'negative'] },
  { suffix: 'きません', replacement: 'く', rulesApplied: ['polite', 'negative'] },
  { suffix: 'ぎません', replacement: 'ぐ', rulesApplied: ['polite', 'negative'] },
  { suffix: 'しません', replacement: 'す', rulesApplied: ['polite', 'negative'] },
  { suffix: 'ちません', replacement: 'つ', rulesApplied: ['polite', 'negative'] },
  { suffix: 'にません', replacement: 'ぬ', rulesApplied: ['polite', 'negative'] },
  { suffix: 'みません', replacement: 'む', rulesApplied: ['polite', 'negative'] },
  { suffix: 'びません', replacement: 'ぶ', rulesApplied: ['polite', 'negative'] },
  { suffix: 'りません', replacement: 'る', rulesApplied: ['polite', 'negative'] },

  // Godan Negatives (A-stem + ない)
  { suffix: 'わない', replacement: 'う', rulesApplied: ['negative'] },
  { suffix: 'かない', replacement: 'く', rulesApplied: ['negative'] },
  { suffix: 'がない', replacement: 'ぐ', rulesApplied: ['negative'] },
  { suffix: 'さない', replacement: 'す', rulesApplied: ['negative'] },
  { suffix: 'たない', replacement: 'つ', rulesApplied: ['negative'] },
  { suffix: 'なない', replacement: 'ぬ', rulesApplied: ['negative'] },
  { suffix: 'まない', replacement: 'む', rulesApplied: ['negative'] },
  { suffix: 'ばない', replacement: 'ぶ', rulesApplied: ['negative'] },
  { suffix: 'らない', replacement: 'る', rulesApplied: ['negative'] },

  // Godan Te-form & Past (Geminate / Nasal / Suffix combinations)
  { suffix: 'って', replacement: 'る', rulesApplied: ['te-form'] },
  { suffix: 'って', replacement: 'つ', rulesApplied: ['te-form'] },
  { suffix: 'って', replacement: 'う', rulesApplied: ['te-form'] },
  { suffix: 'った', replacement: 'る', rulesApplied: ['past'] },
  { suffix: 'った', replacement: 'つ', rulesApplied: ['past'] },
  { suffix: 'った', replacement: 'う', rulesApplied: ['past'] },

  { suffix: 'んで', replacement: 'む', rulesApplied: ['te-form'] },
  { suffix: 'んで', replacement: 'ぶ', rulesApplied: ['te-form'] },
  { suffix: 'んで', replacement: 'ぬ', rulesApplied: ['te-form'] },
  { suffix: 'んだ', replacement: 'む', rulesApplied: ['past'] },
  { suffix: 'んだ', replacement: 'ぶ', rulesApplied: ['past'] },
  { suffix: 'んだ', replacement: 'ぬ', rulesApplied: ['past'] },

  { suffix: 'いて', replacement: 'く', rulesApplied: ['te-form'] },
  { suffix: 'いた', replacement: 'く', rulesApplied: ['past'] },
  { suffix: 'いで', replacement: 'ぐ', rulesApplied: ['te-form'] },
  { suffix: 'いだ', replacement: 'ぐ', rulesApplied: ['past'] },

  { suffix: 'して', replacement: 'す', rulesApplied: ['te-form'] },
  { suffix: 'した', replacement: 'す', rulesApplied: ['past'] },

  // Adjective Inflections (い-adjectives)
  { suffix: 'くない', replacement: 'い', rulesApplied: ['negative'] },
  { suffix: 'かった', replacement: 'い', rulesApplied: ['past'] },
  { suffix: 'くなかった', replacement: 'い', rulesApplied: ['negative', 'past'] },
  { suffix: 'くて', replacement: 'い', rulesApplied: ['te-form'] },
];

export class Deinflector {
  /**
   * Generates possible base dictionary forms from an inflected Japanese word
   * by iteratively matching and replacing suffixes based on Japanese conjugation rules.
   */
  public deinflect(text: string): DeinflectionCandidate[] {
    const candidatesMap = new Map<string, string[]>();
    
    // Add the original word as the first candidate
    candidatesMap.set(text, []);

    const queue: Array<{ currentText: string; pathway: string[] }> = [
      { currentText: text, pathway: [] },
    ];

    while (queue.length > 0) {
      const { currentText, pathway } = queue.shift()!;

      for (const rule of DEINFLECTION_RULES) {
        if (currentText.endsWith(rule.suffix)) {
          const stem = currentText.slice(0, -rule.suffix.length);
          const restored = stem + rule.replacement;

          // Build the cumulative rules pathway applied in reverse
          const newPathway = [...rule.rulesApplied, ...pathway];

          if (!candidatesMap.has(restored)) {
            candidatesMap.set(restored, newPathway);
            queue.push({ currentText: restored, pathway: newPathway });
          }
        }
      }
    }

    return Array.from(candidatesMap.entries()).map(([text, rulesApplied]) => ({
      text,
      rulesApplied,
    }));
  }
}
