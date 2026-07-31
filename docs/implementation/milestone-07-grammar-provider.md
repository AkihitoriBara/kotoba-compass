# Implementation Plan - Milestone 7
# Grammar Provider

This document defines the architecture, grammar model, detection pipeline, provider integration, Companion Panel experience, and verification strategy for the Grammar Provider.

---

# Objective

Implement an offline Grammar Provider that analyzes Japanese word forms and returns structured grammatical information.

Unlike the Vocabulary, Kanji, and Name providers, the Grammar Provider performs language analysis instead of dictionary lookup.

The provider must remain completely offline.

AI explanations are explicitly out of scope.

---

# Scope

Implement:

- GrammarProvider
- GrammarResult model
- Conjugation analysis
- Grammar detection
- Transformation timeline
- Grammar section inside Companion Panel

Do NOT implement:

- AI explanations
- Natural language tutoring
- Sentence parsing
- Translation
- LLM integration

---

# 1. Design Philosophy

The Grammar Provider answers:

"How is this word constructed?"

It does NOT answer:

"Why?"

Explanation belongs to AI Tutor.

The Grammar Provider returns facts.

---

# 2. Supported Analysis (Version 1)

Version 1 should detect:

Verb Class

- Ichidan
- Godan
- Irregular

Dictionary Form

Part of Speech

Tense

- Present
- Past

Polarity

- Positive
- Negative

Politeness

- Plain
- Polite

Verb Forms

- Dictionary
- Masu
- Te
- Ta
- Nai

Voice

- Passive
- Potential
- Causative
- Volitional
- Imperative

Aspect

- Progressive
- Perfective

Confidence

- High
- Medium
- Low

---

# 3. GrammarResult

```ts
export interface GrammarResult {
    sourceText: string;

    dictionaryForm: string;

    partOfSpeech: PartOfSpeech;

    verbClass?: VerbClass;

    tense?: Tense;

    polarity?: Polarity;

    politeness?: Politeness;

    voice?: Voice[];

    aspect?: Aspect;

    form?: GrammarForm;

    confidence: GrammarConfidence;

    transformations: GrammarTransformation[];

    grammarPoints: GrammarPoint[];
}
```

---

# 4. GrammarTransformation

```ts
export interface GrammarTransformation {
    from: string;

    to: string;

    reason: string;
}
```

Example:

食べる

↓

食べます

↓

食べました

---

# 5. Provider Architecture

Selected Text

↓

Candidate Generation

↓

Grammar Provider

↓

GrammarResult

↓

LanguageAnalysisResult

The Grammar Provider should integrate with the Provider Registry exactly like the existing providers.

---

# 6. Companion Panel

Grammar is NOT a primary tab.

Instead, it is an expandable section below Names.

Collapsed by default.

Example

▼ Grammar Analysis

Dictionary Form

食べる

Detected

[Ichidan]

[Past]

[Polite]

Transformation

食べる

↓

食べます

↓

食べました

Pitch Accent

(Graph placeholder)

Confidence

High

---

# 7. Future Settings Architecture

Grammar presentation should be modular.

Future settings may include:

✓ Show Verb Class

✓ Show Transformation Timeline

✓ Show Grammar Tags

✓ Show Pitch Accent

✓ Show JLPT Grammar

✓ Expand Grammar Automatically

These settings are out of scope for this milestone.

---

# 8. Verification

Test

食べました

Expected

Dictionary Form

食べる

Verb Class

Ichidan

Detected

Past

Polite

Transformation

食べる

↓

食べます

↓

食べました

---

Test

書かなかった

Expected

Dictionary Form

書く

Detected

Negative

Past

Godan

---

Test

読んでいる

Expected

Dictionary Form

読む

Detected

Progressive

Te-form

---

Test

来られる

Expected

Dictionary Form

来る

Detected

Potential

Irregular

---

Build

pnpm typecheck

pnpm build

must succeed.