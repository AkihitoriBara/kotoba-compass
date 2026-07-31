# Implementation Plan - Chapter 7.5
# Language Analysis Engine Polish

This milestone introduces the Result Processor.

The Result Processor receives raw provider output from the Language Analysis Engine and transforms it into polished, user-friendly results before they are displayed by the Companion Panel.

No provider should perform presentation logic.

No provider should perform ranking.

No provider should perform UI grouping.

Those responsibilities belong exclusively to the Result Processor.

---

# Objective

Create a Result Processor responsible for:

- Ranking
- Grouping
- Duplicate removal
- Confidence ordering
- UI preparation

without modifying the existing providers.

---

# Design Philosophy

Providers answer:

"What information exists?"

The Result Processor answers:

"How should this information be presented?"

---

# Responsibilities

## Dictionary

Rank entries using:

- frequency
- priority
- common spelling
- exact match
- dictionary metadata

Return:

Most useful entry first.

---

## Kanji

Sort by:

- exact match
- frequency

---

## Names

Merge duplicate entries.

Example

葉月

Instead of

Given Name

Given Name

Surname

Return

葉月

Primary Reading

はづき

Other Readings

...

Other Types

Surname

Given Name

---

## Grammar

Order grammar analyses by:

1. Confidence
2. Dictionary confirmation
3. Simplicity

Collapse alternative analyses behind:

"Other analyses"

---

# ResultProcessor

```ts
export interface ResultProcessor {
    process(
        result: LanguageAnalysisResult
    ): ProcessedAnalysisResult;
}
```

---

# ProcessedAnalysisResult

```ts
export interface ProcessedAnalysisResult {
    dictionary: DictionaryEntry[];

    kanji: KanjiEntry[];

    names: ProcessedName[];

    grammar: ProcessedGrammar[];

    warnings: AnalysisWarning[];
}
```

---

# UI Improvements

Dictionary

⭐ Most Common

Other Entries

Kanji

Most Common

Names

Primary Result

Other Readings

Grammar

Most Likely

Other Analyses

Confidence

High

---

# Companion Panel

Improve visual hierarchy.

Reduce duplicate cards.

Improve spacing.

Improve section headers.

Improve badge consistency.

---

# Out of Scope

Do NOT implement:

Pitch Accent

Grammar Settings

AI Tutor

Mining Cards

Sentence Analysis

Audio

---

# Verification

葉月

Should produce

One merged Name card.

---

東京

Should prioritize the place over surnames.

---

出した

Should display

Most likely grammar first.

Alternative analyses collapsed.

---

食べました

Should display

One grammar card.

No duplicate analyses.

---

Performance

The Result Processor should not introduce noticeable latency.