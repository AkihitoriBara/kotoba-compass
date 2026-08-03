# Implementation Plan - Milestone 7.6
# Context Translation Provider

This milestone introduces the **Context Translation Provider**, an optional component of the Language Analysis Engine that provides quick contextual translations for users who prefer immediate comprehension.

Unlike the existing educational providers (Dictionary, Kanji, Names, Grammar), Context Translation is designed as a convenience feature and is **disabled by default**.

The philosophy of Kotoba Compass remains:

> Learn through understanding first.
> Translate only when needed.

---

# 1. Goal

Implement an optional Translation Provider that integrates with the Language Analysis Engine while remaining architecturally independent.

Translation should support three future modes:

- Word
- Sentence
- Paragraph

Only Word mode is expected to be fully deterministic using existing dictionary data.

Sentence and Paragraph modes will expose clean interfaces for future AI integration.

---

# 2. User Philosophy

Translation exists for situations such as:

- watching livestreams
- reading quickly
- checking difficult passages
- confirming understanding

It is not intended to replace the educational workflow.

For this reason:

- disabled by default
- hidden until enabled
- configurable
- isolated from the educational providers

---

# 3. Architecture

LanguageAnalysisEngine

├── VocabularyProvider
├── KanjiProvider
├── NameProvider
├── GrammarProvider
└── TranslationProvider

The Translation Provider follows the same LanguageProvider interface used throughout the engine.

It does not modify existing providers.

---

# 4. Data Model

```ts
export type TranslationMode =
    | "off"
    | "word"
    | "sentence"
    | "paragraph";

export type TranslationProviderType =
    | "offline"
    | "ai";

export interface TranslationResult {
    sourceText: string;
    translatedText: string;
    mode: TranslationMode;
    provider: TranslationProviderType;
}
```

LanguageAnalysisResult becomes

```ts
translation?: TranslationResult;
```

ProcessedAnalysisResult also exposes

```ts
translation?: TranslationResult;
```

---

# 5. Translation Modes

## Word

Uses existing DictionaryProvider data.

No AI.

No network.

No API cost.

---

## Sentence

Architecture only.

Returns placeholder implementation until AI Tutor milestone.

---

## Paragraph

Architecture only.

Returns placeholder implementation until AI Tutor milestone.

---

# 6. Result Processor

The Result Processor simply forwards TranslationResult.

No ranking.

No merging.

No grouping.

Translation always appears as a single section.

---

# 7. Companion Panel

If Translation is disabled:

Do not render the section.

If enabled:

Render it ABOVE Dictionary.

Order becomes

Context Translation

Dictionary

Kanji

Names

Grammar

The card remains visually minimal.

---

# 8. Future Settings

The provider should already support future settings.

Translation Enabled

Translation Mode

Provider Preference

Automatic Translation

Show Reminder

The actual Settings UI will be implemented later.

---

# 9. Verification

Word

食べる

↓

eat

Sentence

Architecture available

Placeholder returned

Paragraph

Architecture available

Placeholder returned

Translation disabled

No Translation Provider execution

No Translation UI