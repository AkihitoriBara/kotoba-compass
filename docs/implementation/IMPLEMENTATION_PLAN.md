# Implementation Plan - Milestone 6
# Name Provider

This document outlines the architecture, data model, preprocessing pipeline, provider integration, and Companion Panel UI for the Name Provider of the Kotoba Compass Language Analysis Engine.

---

## 1. Data Source Recommendation: Yomidan JMnedict Release
We recommend the pre-built, proper name JSON database release maintained by the Yomitan community:
- **Download URL**: `https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/JMnedict.zip`
- **Why**: JMnedict contains over 740,000 entries of proper nouns (names, places, organizations, stations, works, characters). This source is compact, formatted in a flat array schema, and actively maintained.

---

## 2. Preprocessing & Build Pipeline

We will create a new build script `scripts/build-jmnedict.ts` in the project root.

### Pipeline Flow
```
Download ──► Extract ──► Normalize ──► Validate ──► Bucket ──► Write
```

1. **Download**: Download the `JMnedict.zip` file.
2. **Extract**: Scan and unzip all `term_bank_*.json` files (containing chunks of proper names) using `adm-zip`.
3. **Normalize**: Map the array entry values into names, readings, classifications, and gloss meanings. Map raw tag classifications to the unified `NameType` values (e.g., mapping `org` -> `organization` and `work`/`char` -> `fiction`).
4. **Validate**:
   - Verify that the `written` expression, `reading` kana, and proper name `type` fields exist.
   - Ignore any entry where these key fields are missing or malformed, logging warnings for developer visibility.
5. **Bucket**: Split into **100** hash buckets using `written.charCodeAt(0) % 100` to maintain absolute consistency with the Vocabulary and Kanji Providers.
6. **Write**: Save the bucket JSON files to `apps/extension/public/dictionaries/names/bucket_*.json`.

### Automation & Repository Rules
- Preprocessing is automated via `pnpm build:names`.
- The split JSON bucket files are committed to Git under `apps/extension/public/dictionaries/names/`. This allows developers to use the database immediately without running heavy zip-downloads and compilations locally during setup.

---

## 3. Data Model

We will update [types.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/analysis/types.ts) to define a strongly typed `NameEntry` and `NameType` interface:

```typescript
export type NameType =
  | 'person'
  | 'surname'
  | 'given'
  | 'place'
  | 'company'
  | 'organization'
  | 'station'
  | 'fiction'
  | 'other';

export interface NameEntry {
  written: string;     // The proper noun (e.g., "東京", "山田")
  reading: string;     // Kana reading (e.g., "とうきょう", "やまだ")
  meanings: string[];  // English translations/meanings (e.g., ["Tokyo"])
  type: NameType;      // The mapped proper name classification category
  tags?: string[];     // Optional tag identifiers for future use
  priority?: number;   // Optional priority rank for sorting/scoring
}
```

---

## 4. Provider Registry Integration & Architecture

The registry-based plugin model in `LanguageAnalysisEngine` allows us to add the Name Provider without altering the engine's core query pipelines.

### Architecture Flow
```
                           ┌─────────────────────────┐
                           │ LanguageAnalysisEngine  │
                           └────────────┬────────────┘
                                        │
                                        ▼ (Broadcasts candidates)
              ┌───────────────────────────────────────────┐
              │        registeredProviders: Array         │
              └───────┬─────────────────┬───────────┬─────┘
                      │ (Vocabulary)    │ (Kanji)   │ (Names)
                      ▼                 ▼           ▼
            ┌──────────────────┐      ┌──────────┐ ┌────────────┐
            │VocabularyProvider│      │  Kanji   │ │NameProvider│
            └──────────────────┘      └──────────┘ └────────────┘
```

### Provider Data Flow
Rather than querying independently, the engine uses the candidates resolved from selection to perform enrichment.
```
DeinflectionCandidate[] (from selection)
            │
            ▼
NameProvider (queries hashed local public/dictionaries/names/ JSON files)
            │
            ▼
NameEntry[] (appended to analysis result)
```

### NameProvider Implementation & Caching Details
1. Extends `LanguageProvider<NameEntry>`.
2. Loops through incoming `DeinflectionCandidate` word forms, hashes them (`written.charCodeAt(0) % 100`), fetches the bucket asset (`dictionaries/names/bucket_X.json`), and queries the matching name details.
3. **Runtime Bucket Caching**: Matches the Vocabulary and Kanji Providers by maintaining a private `bucketCache` Map inside `NameProvider`. Loaded bucket array data is cached in memory on the first request to eliminate duplicate fetches during a browsing session.
4. Returns the compiled array of `NameEntry` objects.

---

## 5. Companion Panel UI & Mockup

In the **Dictionary** tab, proper names will render as sub-cards below vocabulary entries (or as standalone cards if no vocabulary matches exist).

### UI Design Strategy
- **Visual Badges**: Mapped name categories will display visually distinct tag pills (e.g., purple for `Place`, teal for `Organization`, indigo for `Surname`, rose for `Given Name`) to help learners immediately identify name semantics.
- **Visual Separators**: Section headers will demarcate "Proper Names" cleanly when mixed results occur.

### UI Mockup
```
┌──────────────────────────────────────────────┐
│  KOTOBA COMPASS                              │
├──────────────────────────────────────────────┤
│  [Dictionary]    [AI Tutor]    [Mining Card] │
├──────────────────────────────────────────────┤
│                                              │
│  Selected: 東京                               │
│  ┌────────────────────────────────────────┐  │
│  │  東京 (とうきょう)                       │  │
│  │  1. Tokyo                              │  │
│  │  [place]                               │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Selected: 山田                               │
│  ┌────────────────────────────────────────┐  │
│  │  山田 (やまだ)                           │  │
│  │  1. Yamada (Surname)                   │  │
│  │  [surname]                             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 6. Future Architecture: Configurable Companion Panel Settings

To support extensibility, future milestones will introduce configurability:
1. **Extension Settings**: A user-facing settings view allowing users to toggle individual Companion Panel sections independently (e.g. Dictionary, Kanji, Names, Grammar, AI Tutor, Mining Cards).
2. **Provider Skipping**: The registry orchestrator can check these settings. If a specific section (e.g., Names) is disabled by the user, the engine can skip the corresponding provider query (`NameProvider`) entirely to conserve resources and avoid disk reads.
3. **Scope for this Milestone**: In this milestone, we will build the underlying registry results, but we will not build the settings UI or add skipped query execution logic.

---

## 7. Verification Strategy

### Automated Verification
We will add unit test checks to our test script `C:\Users\Akihitori\.gemini\antigravity-ide\brain\<id>/scratch/test_analysis.ts`:
- **Place Name**: Query `東京` (expected to return proper name entry classified as `place` with meaning `Tokyo`).
- **Surname**: Query `山田` (expected to return proper name entry classified as `surname` with meaning `Yamada`).
- **Given Name**: Query `太郎` (expected to return proper name entry classified as `given` with meaning `Tarou`).
- **Mixed Match (Multi-Provider)**: Query `京都` (expected to return Vocabulary entry for `京都` AND a proper name entry classified as `place` with meaning `Kyoto`, and both components display).
- **Non-name/English**: Query `OpenAI` (expected to yield vocabulary/names empty state).

### Manual Verification
- Highlight `東京` or `山田` on Wikipedia, click the Action Chip, and verify that the Companion Panel displays the name entry card with its respective category pill.
