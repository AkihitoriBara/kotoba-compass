# Implementation Plan — Milestone 9.1 (AI Card Enhancement)

Implement the Card Enhancement Engine responsible for enriching deterministic GeneratedCards using AI.

The Card Generator remains responsible for deterministic information.

The Card Enhancement Engine only produces contextual learning material.

---

## User Review Required

> [!IMPORTANT]
>
> - AI never replaces deterministic analysis.
> - AI only enhances existing cards.
> - Enhancement providers remain completely provider independent.
> - Enhancement failures never prevent card generation.
> - Placeholder providers are used by default.

---

# Architecture

GeneratedCard

↓

CardEnhancementService

↓

PromptBuilder

↓

CardEnhancementProvider

↓

CardEnhancement

↓

EnhancedGeneratedCard

---

# Proposed Changes

## Data Models

### [NEW] lib/card-enhancement/types.ts

Introduce:

- CardEnhancementRequest
- CardEnhancement
- EnhancedGeneratedCard
- PromptMessages
- CardEnhancementProvider

CardEnhancement contains:

- exampleSentence
- exampleTranslation
- usageNote
- providerName
- model
- cached
- responseTimeMs

---

## Prompt Builder

### [NEW] lib/card-enhancement/prompt-builder.ts

Build provider-agnostic prompt messages.

PromptBuilder must know nothing about provider APIs.

Output:

```ts
interface PromptMessages {
    system: string;
    context: string;
    user: string;
}
```

---

## Enhancement Provider

### [NEW] lib/card-enhancement/mock-provider.ts

Implement deterministic mock responses.

Never generate random content.

Return repeatable outputs suitable for testing.

---

## Enhancement Service

### [NEW] lib/card-enhancement/enhancement-service.ts

Responsible for:

- provider selection
- prompt construction
- timeout handling
- request cancellation
- provider errors
- response normalization

The UI communicates ONLY with this service.

---

## Validation

### [NEW] lib/card-enhancement/validator.ts

Validate:

- example sentence exists
- translation exists
- usage note exists
- response length limits

Return structured validation errors.

---

## UI

### [MODIFY] components/card-generator/card-preview.tsx

Replace placeholder sections:

AI Example Sentence

Pronunciation Audio

with:

Example Sentence

Translation

Usage Note

Render loading placeholders while enhancement is generated.

If enhancement fails:

Display deterministic card only.

---

## Integration

### [MODIFY] components/card-generator/card-view.tsx

Generate deterministic card first.

Then asynchronously request enhancement.

Update preview once enhancement arrives.

Card generation must never wait indefinitely for AI.

---

## Constraints

Do NOT:

- Implement real AI APIs.
- Implement AnkiConnect.
- Implement audio generation.
- Implement image generation.

Mock provider only.

---

# Verification

Run:

- pnpm typecheck
- pnpm build

Manual verification:

- Enhancement appears.
- Loading state works.
- Failure gracefully falls back.
- Card remains exportable.