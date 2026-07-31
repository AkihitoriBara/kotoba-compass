# Implementation Plan - Milestone 7.5 (Language Analysis Polish)

This milestone introduces the **Result Processor**, a post-processing architectural layer of the Language Analysis Engine. It is responsible for centralizing presentation concerns—such as sorting, grouping, deduplicating, and calculating formatting warnings—leaving the providers decoupled and focused purely on structured data retrieval.

---

## 1. Architecture Design

The orchestrating pipeline shifts from direct raw output to post-processed output:

```
LanguageAnalysisEngine.analyze()
             │  (Raw structured data)
             ▼
      ResultProcessor
             │  (Centralized ranking, grouping, duplicate merging)
             ▼
   ProcessedAnalysisResult
             │  (UI-friendly, sorted collections)
             ▼
      Companion Panel
```

### Challenge to the Architecture (Cleaner Design)
*Is a separate processor cleaner than sorting inside the engine?*
Yes. Keeping ranking and presentation structures distinct from data-collection providers prevents code pollution. Centralizing the presentation logic inside a dedicated `ResultProcessor` ensures that if ranking algorithms, custom grouping, or localization rules change, they are isolated in one place without touching the raw provider logic.

---

## 2. Data Models

We will update [types.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/analysis/types.ts) to define the processed models. We avoid duplicate models by reusing existing types:

```typescript
export interface ProcessedName {
  written: string;
  readings: string[];      // Unified deduplicated readings list
  meanings: string[];      // Unified deduplicated gloss/definitions list
  types: NameType[];       // Unified name categorization categories
  tags?: string[];
  priority?: number;       // Best priority rank matching this name
}

export interface ProcessedGrammarSection {
  primary?: GrammarResult;
  alternatives: GrammarResult[];
}

export interface SectionVisibility {
  dictionary: boolean;
  kanji: boolean;
  names: boolean;
  grammar: boolean;
}

export interface AnalysisWarning {
  code: string;
  message: string;
  severity: 'warning' | 'info';
}

export interface ProcessedAnalysisResult {
  sourceText: string;
  dictionary: DictionaryEntry[];
  kanji: KanjiEntry[];
  names: ProcessedName[];
  grammar: ProcessedGrammarSection;
  sections: SectionVisibility;
  warnings: AnalysisWarning[];
}
```

---

## 3. Execution Pipeline & Internal Stages

The `ResultProcessor` implements a modular execution pipeline. While exposing a single public interface `process(result)`, it delegates responsibilities internally to dedicated helper classes/functions to keep the code modular and easily extensible.

```
LanguageAnalysisResult
        │
        ▼
[ DictionaryRanker ]  ──► Rank entries by exact match & frequency
        │
        ▼
[   KanjiRanker    ]  ──► Order by sourceText appearance & frequency
        │
        ▼
[   NameMerger     ]  ──► Group & merge duplicate proper names
        │
        ▼
[  GrammarRanker   ]  ──► Order by confidence & dictionary form presence
        │
        ▼
[  SectionBuilder  ]  ──► Build visibility toggles & detect warnings
        │
        ▼
ProcessedAnalysisResult
```

### A. Dictionary Ranking (`DictionaryRanker`)
1. **Match Score Assignment**:
   - Exact word match (`word === sourceText`): 100 points
   - Exact reading match (`reading === sourceText`): 90 points
   - Deinflected word match: 50 points
   - Deinflected reading match: 40 points
   - No match: 0 points
2. **Common Tag Bonus**: Add +10 points if `tags` contains `"common"`.
3. **Sorting Priorities**:
   - Primary Sort: Matching Score (descending)
   - Secondary Sort: Frequency rank (ascending/smaller rank number first; entries without a frequency rank are placed last)
   - Tertiary Sort: Word string length (ascending)

### B. Kanji Ranking (`KanjiRanker`)
1. **Source Index Sorting**: Preserve the exact order of appearance of characters within the selected text (e.g. for selection `日本語`, `日` is ranked first, `本` second, `語` third).
2. **Tie-Break**: If multiple entries have equivalent positions in the source text, sort by `frequency` rank (ascending).

### C. Names Grouping & Merging (`NameMerger`)
- Group raw names by `written` expression.
- For each group with duplicate written forms, merge properties:
  - `readings`: Deduplicated union of all readings.
  - `meanings`: Deduplicated union of all gloss entries.
  - `types`: Deduplicated union of name types.
  - `priority`: Best (minimum value) priority ranking of the merged entries.
- Sort Processed Names:
  - Exact matches (`written === sourceText`) first.
  - Sort by `priority` (ascending).

### D. Grammar Sorting (`GrammarRanker`)
- Sort grammar analyses:
  - Primary: Confidence rating (`high` > `medium` > `low`).
  - Secondary: Dictionary confirmation (check if `dictionaryForm` is present in the resolved dictionary entries).
  - Tertiary: Simplicity (fewer `transformations` timeline steps first).
- Extraction:
  - Set the first element of the sorted list as `primary`.
  - Place all remaining elements in the `alternatives` list.

### E. Section Visibility & Warnings (`SectionBuilder`)
- **Section Visibility**: Sets boolean flag for each section (`dictionary`, `kanji`, `names`, `grammar`) based on whether it has displayable elements.
- **Warnings Generation**:
  - Generate `"NO_ENTRIES_FOUND"` if dictionary, kanji, and name results are all empty.
  - Generate `"AMBIGUOUS_GRAMMAR"` if `grammar.alternatives` contains any alternative grammar matches with confidence level `'medium'` or `'high'`.

---

## 4. UI Layout Mockups

The Companion Panel UI will leverage the `sections` metadata to directly toggle visibility of cards, creating a cleaner visual look:

```
[Selected: 葉月]

▼ Names (1)
  ┌──────────────────────────────────────────────────────────┐
  │ 葉月                                                     │
  │ Readings: はづき, はつき                                  │
  │ [ Given Name ]  [ Surname ]                              │
  │                                                          │
  │ Meanings:                                                │
  │ - Hazuki (given name / surname)                          │
  └──────────────────────────────────────────────────────────┘

▼ Grammar Analysis
  ┌──────────────────────────────────────────────────────────┐
  │ Most Likely Analysis                                     │
  │ 食べる (verb, ichidan) [High Confidence]                 │
  │ [ Polite ]  [ Past ]                                     │
  │ 食べる ──► 食べます ──► 食べました                       │
  ├──────────────────────────────────────────────────────────┤
  │ ▶ Other Analyses (2)                                     │
  └──────────────────────────────────────────────────────────┘
```

---

## 5. Verification Strategy

We will update our testing suite to assert the following verification queries:

1. **葉月**:
   - Asserts names output contains exactly **1 merged ProcessedName card**.
   - Asserts `readings` contains both `"はづき"` and `"はつき"`.
   - Asserts `types` contains both `"given"` and `"surname"`.
2. **東京**:
   - Asserts name types are sorted with `"place"` appearing before `"surname"`.
3. **出した**:
   - Asserts grammar primary result matches dictionary form `"出す"` with high confidence.
   - Asserts alternative parsed endings (if any) are correctly filed under `alternatives`.
4. **食べました**:
   - Asserts grammar primary result matches dictionary form `"食べる"`.
   - Asserts no duplicate grammar analyses are returned.
