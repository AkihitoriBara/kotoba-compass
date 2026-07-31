# Chapter 7 — Dictionary Engine & Word Analysis

---

# Purpose

The Dictionary Engine is the core language-processing component of Kotoba Compass.

Its responsibility is to transform raw Japanese text selected by the user into structured linguistic information that can be displayed inside the Companion Panel and consumed by future systems such as the AI Tutor, Flashcards, and Learning Progress.

This chapter intentionally excludes AI-generated explanations.

The Dictionary Engine is deterministic and data-driven.

---

# Responsibilities

The Dictionary Engine is responsible for:

- Identifying Japanese words
- Looking up dictionary entries
- Determining the dictionary (base) form
- Retrieving readings
- Returning English meanings
- Identifying parts of speech
- Returning JLPT level (when available)
- Returning frequency information (when available)

It is NOT responsible for:

- Grammar explanations
- AI tutoring
- Sentence translation
- Learning recommendations
- Flashcard generation

Those responsibilities belong to later chapters.

---

# High-Level Flow

```
User selects Japanese text
            │
            ▼
Content Script
            │
            ▼
Dictionary Engine
            │
            ▼
Word Analysis
            │
            ▼
Dictionary Lookup
            │
            ▼
Structured Result
            │
            ▼
Companion Panel
```

---

# Dictionary Lookup Pipeline

Every lookup follows the same sequence.

```
Selected Text

↓

Normalize Input

↓

Morphological Analysis

↓

Dictionary Lookup

↓

Return Structured Entry

↓

Display Result
```

Each step should have a single responsibility.

---

# Text Normalization

Before searching the dictionary:

- Trim whitespace
- Normalize Unicode
- Remove accidental line breaks
- Preserve Japanese punctuation when required

Normalization must never alter the meaning of the selected text.

---

# Morphological Analysis

Japanese text is not separated by spaces.

The Dictionary Engine must identify word boundaries before dictionary lookup.

Example:

Input:

昨日学校へ行きました

Analysis:

昨日
学校
へ
行きました

The tokenizer should return linguistic units rather than individual characters.

---

# Deinflection

Users rarely select dictionary forms.

Example:

食べました

↓

食べる

---

Example:

読ませられた

↓

読む

---

Example:

見ていた

↓

見る

---

Example:

行かなかった

↓

行く

The Dictionary Engine must recover the base form whenever possible before dictionary lookup.

---

# Dictionary Entry

Every successful lookup returns a standardized object.

Example interface:

```ts
interface DictionaryEntry {
    word: string;

    reading: string;

    meanings: string[];

    partOfSpeech: string[];

    jlpt?: string;

    frequency?: number;

    tags?: string[];
}
```

Future systems should consume this interface rather than raw dictionary data.

---

# Companion Panel Integration

The Dictionary tab displays:

────────────────────────

Selected Word

Dictionary Form

Reading

Meaning(s)

Part of Speech

JLPT Level

Frequency (optional)

────────────────────────

The layout should prioritize readability over information density.

---

# Error Handling

If no dictionary match is found:

Display a friendly message.

Example:

"No dictionary entry was found.

Try selecting a single word instead of an entire sentence."

The panel should never appear empty.

---

# Performance

Dictionary lookup should feel instantaneous.

Target:

- Typical lookup: <100ms
- Maximum acceptable latency: <300ms

The user should not perceive a delay.

---

# Future Compatibility

The Dictionary Engine is designed to become the foundation for:

- AI Tutor
- Grammar explanations
- Flashcards
- Learning statistics
- Vocabulary review
- Sentence analysis

Those systems must consume DictionaryEntry objects rather than performing their own dictionary lookups.

---

# Milestone 4

Objective:

When a user selects a single Japanese word:

1. Retrieve the selected text.

2. Analyze the word.

3. Look up the dictionary entry.

4. Display:

- Dictionary Form
- Reading
- English Meaning

Success Criteria:

Selecting:

食べました

Displays:

Dictionary Form:
食べる

Reading:
たべる

Meaning:
to eat

No AI functionality is included in this milestone.

Grammar explanations, sentence analysis, and tutoring are introduced in later chapters.