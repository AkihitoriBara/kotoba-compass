# Implementation Plan - Milestone 6
# Name Provider

This document outlines the architecture, data model, preprocessing pipeline, provider integration, and Companion Panel UI for the Name Provider of the Kotoba Compass Language Analysis Engine.

---

# Objective

Implement the Name Provider using JMnedict to identify Japanese proper nouns and enrich language analysis results.

The Name Provider extends the existing Provider Registry without modifying the LanguageAnalysisEngine architecture.

---

# Scope

Implement:

- JMnedict preprocessing pipeline
- NameProvider
- NameEntry interface
- Local name database
- Companion Panel name cards

Do NOT implement:

- Grammar analysis
- AI Tutor
- Mining Cards
- Sentence parsing

---

# 1. Data Source

Recommended source:

Yomitan JMnedict release.

The provider should use the latest English JMnedict package distributed by the Yomitan project.

Reason:

- actively maintained
- compact JSON format
- consistent with existing JMdict pipeline
- offline friendly

---

# 2. Build Pipeline

Pipeline

Download

↓

Extract

↓

Normalize

↓

Validate

↓

Bucket

↓

Write

Validation should verify:

- name exists
- reading exists
- type exists
- malformed entries skipped

Bucket strategy:

Hash written form

written.charCodeAt(0) % 100

Store under:

public/dictionaries/names/

---

# 3. Data Model

Introduce:

```ts
export interface NameEntry {
    written: string;

    reading: string;

    meanings: string[];

    type: NameType;
}
```

```ts
export type NameType =
    | "person"
    | "surname"
    | "given"
    | "place"
    | "company"
    | "organization"
    | "station"
    | "fiction"
    | "other";
```

---

# 4. Provider Integration

Architecture

Selected Text

↓

LanguageAnalysisEngine

↓

Provider Registry

↓

NameProvider

↓

NameEntry[]

Provider Responsibilities

- lookup names
- return structured entries
- ignore non-name results
- cache buckets

---

# 5. Companion Panel

Dictionary

↓

Names

Example

東京

Place

Reading

とうきょう

Meaning

Tokyo

Badge

Place

---

# 6. Verification

Test

東京

↓

returns

Place

---

山田

↓

returns

Surname

---

太郎

↓

returns

Given Name

---

OpenAI

↓

returns

No NameEntry

---

Build

pnpm typecheck

pnpm build

must succeed.