import { AlertCircle, Languages } from 'lucide-react';
import {
  DictionaryEntry,
  KanjiEntry,
  ProcessedName,
  ProcessedGrammarSection,
  SectionVisibility,
  AnalysisWarning,
  GrammarResult,
  TranslationResult,
} from '../lib/analysis/types';

type DictionaryResultProps = {
  entries: DictionaryEntry[];
  kanji?: KanjiEntry[];
  names?: ProcessedName[];
  grammar?: ProcessedGrammarSection;
  sections: SectionVisibility;
  warnings: AnalysisWarning[];
  sourceText: string;
  translation?: TranslationResult;
};

const nameTypeLabels: Record<string, string> = {
  person: 'Person',
  surname: 'Surname',
  given: 'Given Name',
  place: 'Place',
  company: 'Company',
  organization: 'Organization',
  station: 'Station',
  fiction: 'Fiction',
  other: 'Name',
};

const nameTypeColors: Record<string, string> = {
  person: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 ring-pink-500/20 dark:ring-0',
  surname: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-500/20 dark:ring-0',
  given: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/20 dark:ring-0',
  place: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-purple-500/20 dark:ring-0',
  company: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20 dark:ring-0',
  organization: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 ring-teal-500/20 dark:ring-0',
  station: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20 dark:ring-0',
  fiction: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-orange-500/20 dark:ring-0',
  other: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-slate-500/20 dark:ring-0',
};

function GrammarCard({ gEntry, label }: { gEntry: GrammarResult; label?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 dark:border-border/30">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <div className="space-y-0.5">
          {label && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 select-none">
              {label}
            </p>
          )}
          <span className="flex items-baseline gap-x-2">
            <span className="text-base font-bold text-foreground" lang="ja">
              {gEntry.dictionaryForm}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">
              ({gEntry.partOfSpeech}{gEntry.verbClass ? `, ${gEntry.verbClass} verb` : ''})
            </span>
          </span>
        </div>

        {/* Confidence rating badge */}
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
          gEntry.confidence === 'high'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : gEntry.confidence === 'medium'
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            : 'bg-slate-500/10 text-slate-700 dark:text-slate-400'
        }`}>
          {gEntry.confidence} Confidence
        </span>
      </div>

      <div className="mt-4 space-y-4 pt-3 border-t border-border/10">
        {/* Badges Grid */}
        <div className="flex flex-wrap gap-1.5">
          {gEntry.politeness && (
            <span className="inline-flex items-center rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 capitalize">
              {gEntry.politeness}
            </span>
          )}
          {gEntry.tense && (
            <span className="inline-flex items-center rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400 capitalize">
              {gEntry.tense}
            </span>
          )}
          {gEntry.polarity && (
            <span className="inline-flex items-center rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 capitalize">
              {gEntry.polarity}
            </span>
          )}
          {gEntry.aspect && (
            <span className="inline-flex items-center rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-400 capitalize">
              {gEntry.aspect}
            </span>
          )}
          {gEntry.voice && gEntry.voice.map((v) => (
            <span key={v} className="inline-flex items-center rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 capitalize">
              {v}
            </span>
          ))}
        </div>

        {/* Transformation Timeline */}
        {gEntry.transformations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Transformation Timeline
            </p>
            <div className="relative pl-4 border-l-2 border-primary/20 ml-2 space-y-4">
              {/* Dictionary Base */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 bg-background rounded-full border border-primary/40 size-3 flex items-center justify-center">
                  <div className="bg-primary rounded-full size-1.5" />
                </div>
                <p className="text-sm font-bold text-foreground" lang="ja">
                  {gEntry.dictionaryForm}
                </p>
                <p className="text-[10px] text-muted-foreground">Dictionary Form</p>
              </div>

              {/* Suffix Inflections */}
              {gEntry.transformations.map((step, sIdx) => (
                <div key={sIdx} className="relative">
                  <div className="absolute -left-[23px] top-1 bg-background rounded-full border border-primary/40 size-3 flex items-center justify-center">
                    <div className="bg-primary rounded-full size-1.5" />
                  </div>
                  <p className="text-sm font-bold text-foreground" lang="ja">
                    {step.to}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {step.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitch Accent Space */}
        <div className="space-y-1 pt-2.5 border-t border-border/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Pitch Accent
          </p>
          <p className="text-xs text-muted-foreground italic select-none">
            Pitch Accent details will appear here in a future release
          </p>
        </div>
      </div>
    </div>
  );
}

function DictionaryResult({
  entries,
  kanji = [],
  names = [],
  grammar = { alternatives: [] },
  sections,
  warnings,
  sourceText,
  translation,
}: DictionaryResultProps) {

  if (!sections.dictionary && !sections.kanji && !sections.names && !sections.grammar && !sections.translation) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No matching entries found</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground max-w-[280px]">
          Try selecting a single word instead of an entire sentence.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col p-4 space-y-4">
      {/* Warnings Panel */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <div
              key={w.code}
              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
                w.severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {w.code === 'NO_ENTRIES_FOUND' ? 'No Entries Found' : w.code === 'AMBIGUOUS_GRAMMAR' ? 'Ambiguous Grammar' : w.code}
                </p>
                <p className="opacity-90">
                  {w.code === 'NO_ENTRIES_FOUND'
                    ? 'No matching vocabulary, kanji, or name entries matched your query.'
                    : w.code === 'AMBIGUOUS_GRAMMAR'
                    ? 'This inflected form has multiple possible grammar readings.'
                    : 'A warning was generated.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected word selection header */}
      <div className="flex items-center space-x-2 pb-1 border-b border-border/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Selected:
        </span>
        <span className="text-sm font-bold font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded">
          {sourceText}
        </span>
      </div>

      {/* Translation Section */}
      {sections.translation && translation && (
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary select-none">
              <Languages className="size-4" />
              <span>Context Translation</span>
            </div>

            {translation.available ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  {translation.translatedText}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-primary/10 pt-2.5 mt-2.5">
                  <span className="capitalize">Mode: {translation.mode}</span>
                  <span className="capitalize">Provider: {translation.provider}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {translation.mode} translation
                </p>
                <p className="text-sm font-medium text-foreground">
                  {translation.message || 'Translation unavailable'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dictionary Section */}
      {sections.dictionary && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Dictionary ({entries.length})
          </h4>
          {entries.map((entry, idx) => {
            const isCommon = entry.tags?.includes('common') || entry.partOfSpeech?.includes('common');
            const showStarBadge = idx === 0 && isCommon;
            
            return (
              <div
                key={`${entry.word}-${entry.reading}-${idx}`}
                className="group relative rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border/40"
              >
                {/* Star Badge */}
                {showStarBadge && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 select-none">
                    ⭐ Most Common
                  </span>
                )}

                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-bold tracking-tight text-foreground" lang="ja">
                      {entry.word}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground" lang="ja">
                      {entry.reading}
                    </p>
                  </div>

                  {/* Part of Speech Badges */}
                  {entry.partOfSpeech.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 pr-24">
                      {entry.partOfSpeech.map((pos) => (
                        <span
                          key={pos}
                          className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-inset ring-primary/10 dark:bg-primary/20 dark:text-primary-foreground dark:ring-0"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Definitions */}
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    Definitions
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-sm text-foreground/90">
                    {entry.meanings.map((meaning, mIdx) => (
                      <li key={mIdx} className="leading-relaxed">
                        {meaning}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanji Details Section */}
      {sections.kanji && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Kanji Characters ({kanji.length})
          </h4>
          <div className="space-y-4">
            {kanji.map((kEntry, kIdx) => (
              <div
                key={`${kEntry.kanji}-${kIdx}`}
                className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-border/30"
              >
                <div className="flex gap-4">
                  {/* Big Kanji Display */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-3xl font-bold shadow-sm dark:border-border/40" lang="ja">
                    {kEntry.kanji}
                  </div>

                  {/* Kanji Metadata Block */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                      <span className="bg-muted px-2 py-0.5 rounded">
                        Strokes: <span className="font-bold text-foreground">{kEntry.strokeCount}</span>
                      </span>
                      {kEntry.radical && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Radical: <span className="font-bold text-foreground">
                            {kEntry.radical.symbol}
                            {kEntry.radical.number ? ` (${kEntry.radical.number})` : ''}
                          </span>
                        </span>
                      )}
                      {kEntry.jlptLevel && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          JLPT: <span className="font-bold text-foreground">N{kEntry.jlptLevel}</span>
                        </span>
                      )}
                      {kEntry.grade && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          Grade: <span className="font-bold text-foreground">{kEntry.grade}</span>
                        </span>
                      )}
                    </div>

                    {/* Readings */}
                    <div className="space-y-1 text-xs">
                      {kEntry.onyomi.length > 0 && (
                        <div className="flex items-center gap-x-2">
                          <span className="w-8 font-bold text-muted-foreground">On:</span>
                          <div className="flex flex-wrap gap-1">
                            {kEntry.onyomi.map((on) => (
                              <span key={on} className="bg-sky-500/10 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded font-bold" lang="ja">
                                {on}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {kEntry.kunyomi.length > 0 && (
                        <div className="flex items-center gap-x-2">
                          <span className="w-8 font-bold text-muted-foreground">Kun:</span>
                          <div className="flex flex-wrap gap-1">
                            {kEntry.kunyomi.map((kun) => (
                              <span key={kun} className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold" lang="ja">
                                {kun}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meanings */}
                <div className="mt-4 pt-3 border-t border-border/20">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                    Meanings
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {kEntry.meanings.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Names Details Section */}
      {sections.names && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Names ({names.length})
          </h4>
          <div className="space-y-4">
            {names.map((nEntry, nIdx) => (
              <div
                key={`${nEntry.written}-${nIdx}`}
                className="group rounded-xl border border-border/60 bg-muted/10 p-4 dark:border-border/30"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold tracking-tight text-foreground" lang="ja">
                      {nEntry.written}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground" lang="ja">
                      Readings: {nEntry.readings.join(', ')}
                    </p>
                  </div>

                  {/* Name Type Badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nEntry.types.map((t) => (
                      <span
                        key={t}
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                          nameTypeColors[t] || nameTypeColors.other
                        }`}
                      >
                        {nameTypeLabels[t] || nameTypeLabels.other}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meanings */}
                <div className="mt-3 pt-2.5 border-t border-border/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">
                    Meanings
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-foreground/90">
                    {nEntry.meanings.map((meaning, mIdx) => (
                      <li key={mIdx} className="leading-relaxed">
                        {meaning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Analysis Section */}
      {sections.grammar && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Grammar Analysis
          </h4>
          <div className="space-y-4 pb-6">
            {/* Primary grammar analysis */}
            {grammar.primary && (
              <GrammarCard gEntry={grammar.primary} label="Most Likely Analysis" />
            )}

            {/* Alternative grammar analyses collapsed by default */}
            {grammar.alternatives.length > 0 && (
              <details className="group mt-4 rounded-xl border border-border/40 bg-muted/5 p-3 open:bg-muted/10 transition-colors focus:outline-none">
                <summary className="flex cursor-pointer items-center justify-between font-bold text-xs text-muted-foreground uppercase select-none list-none">
                  <span>Other Analyses ({grammar.alternatives.length})</span>
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="mt-3 space-y-4 pt-3 border-t border-border/10">
                  {grammar.alternatives.map((altEntry, altIdx) => (
                    <GrammarCard
                      key={`${altEntry.dictionaryForm}-${altIdx}`}
                      gEntry={altEntry}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export { DictionaryResult };
export type { DictionaryResultProps };
