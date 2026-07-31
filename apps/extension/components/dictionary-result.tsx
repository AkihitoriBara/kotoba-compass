import { AlertCircle } from 'lucide-react';
import { DictionaryEntry, KanjiEntry, NameEntry } from '../lib/analysis/types';

type DictionaryResultProps = {
  entries: DictionaryEntry[];
  kanji?: KanjiEntry[];
  names?: NameEntry[];
  sourceText: string;
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
  other: 'Name'
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
  other: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-slate-500/20 dark:ring-0'
};

function DictionaryResult({ entries, kanji, names, sourceText }: DictionaryResultProps) {
  // Empty state is shown only if there are no vocabulary entries AND no kanji entries AND no proper names entries
  const hasVocab = entries.length > 0;
  const hasKanji = kanji && kanji.length > 0;
  const hasNames = names && names.length > 0;

  if (!hasVocab && !hasKanji && !hasNames) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No dictionary entry was found</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground max-w-[280px]">
          Try selecting a single word instead of an entire sentence.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col p-4 space-y-4">
      {/* Search Header */}
      <div className="flex items-center space-x-2 pb-1 border-b border-border/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Selected:
        </span>
        <span className="text-sm font-bold font-mono text-foreground bg-muted/50 px-2 py-0.5 rounded">
          {sourceText}
        </span>
      </div>

      {/* Vocabulary Results */}
      {hasVocab && (
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={`${entry.word}-${entry.reading}-${idx}`}
              className="group rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-border/40"
            >
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
                  <div className="flex flex-wrap gap-1 mt-1">
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

              {/* Meanings */}
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
          ))}
        </div>
      )}

      {/* Kanji Details Section */}
      {hasKanji && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Kanji Characters
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
                          Radical: <span className="font-bold text-foreground">{kEntry.radical}</span>
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
      {hasNames && (
        <div className="mt-6 space-y-4 pt-4 border-t border-border/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Names
          </h4>
          <div className="space-y-4 pb-6">
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
                    <p className="text-xs font-medium text-muted-foreground" lang="ja">
                      {nEntry.reading}
                    </p>
                  </div>

                  {/* Name Type Badge */}
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                      nameTypeColors[nEntry.type] || nameTypeColors.other
                    }`}
                  >
                    {nameTypeLabels[nEntry.type] || nameTypeLabels.other}
                  </span>
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
    </section>
  );
}

export { DictionaryResult };
export type { DictionaryResultProps };
