# Implementation Plan — Milestone 9.0 (Card Generation Foundation)

Implement the Card Generation Engine responsible for transforming Language Analysis results into reusable study cards.

---

## User Review Required

> [!IMPORTANT]
>
> - Card generation is completely independent of Anki.
> - The GeneratedCard model is the single source of truth.
> - AI enhances cards but never overrides deterministic analysis.
> - Every card is previewed before export.
> - Exporters consume GeneratedCard without modifying it.

---

## Architecture

Language Analysis

↓

CardGenerator

↓

GeneratedCard

↓

Preview

↓

Exporter

↓

AnkiConnect

---

## Proposed Changes

### Data Models

#### [NEW] lib/card-generator/types.ts

Introduce:

```ts
GeneratedCard

CardFront

CardBack

CardMetadata

CardTemplate

CardGenerationRequest

CardGenerationResult
```

---

### Card Generation

#### [NEW] lib/card-generator/card-generator.ts

Responsibilities:

- Build GeneratedCard
- Populate deterministic fields
- Apply template
- Validate completeness

---

### Template Engine

#### [NEW] lib/card-generator/template-engine.ts

Support

- Word
- Sentence
- Cloze

Front-side Furigana follows Settings.

---

### Validation

#### [NEW] lib/card-generator/card-validator.ts

Validate

- Meaning exists
- Reading exists
- Front not empty
- Back not empty

---

### Preview UI

#### [NEW] components/card-generator/card-preview.tsx

Render

Front

↓

Flip Animation

↓

Back

---

#### [NEW] components/card-generator/card-view.tsx

Contains

- Template selector
- Preview
- Generate button
- Export button (disabled)

---

### Integration

#### [MODIFY] companion-panel.tsx

Replace placeholder Card Generator tab with CardView.

---

## Verification

- Generated card matches deterministic analysis.
- Furigana setting respected.
- Templates switch correctly.
- Preview matches GeneratedCard.