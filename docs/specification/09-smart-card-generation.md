# Chapter 9 — Smart Card Generation & Anki Integration

## Vision

Understanding Japanese is only the first step.

Long-term retention requires consistent review.

Kotoba Compass therefore includes a built-in Card Generation Engine capable of transforming analyzed Japanese into structured study cards with a single click.

The extension itself does not become a flashcard application.

Instead, it integrates seamlessly with existing spaced repetition systems, beginning with Anki through AnkiConnect.

---

## Design Goals

- One-click card generation.
- No manual copying between applications.
- AI enhances cards but never replaces deterministic analysis.
- Generated cards remain editable before export.
- Export architecture is provider independent.
- Anki is the first supported exporter rather than the only exporter.

---

## Architecture

Language Analysis Engine

↓

Card Generation Engine

↓

Generated Card

↓

Exporter

↓

AnkiConnect

---

## Principles

### Analysis First

Dictionary, grammar, kanji, names and translation are always generated before a card is built.

### AI Enhancement

AI contributes only:

- Natural example sentence
- Example translation
- Learning tip

AI never decides:

- Meaning
- Reading
- Grammar
- JLPT level

### Preview Before Export

Every generated card is previewed before it is exported.

### Export Independence

Generated cards are exporter agnostic.

Future exporters may include:

- CSV
- Mochi
- Quizlet
- Markdown

without changing the Card Generation Engine.

---

## Generated Card

Every card consists of

Front

- Japanese
- Optional Furigana
- Optional Image

Back

- Meaning
- Reading
- Grammar
- AI Example
- AI Explanation
- Optional Audio

Metadata

- Tags
- JLPT
- Source
- Export Information

---

## User Flow

Highlight Japanese

↓

Analyze

↓

Generate Card

↓

Preview

↓

Export

↓

Continue Reading

No interruption to the reading workflow.