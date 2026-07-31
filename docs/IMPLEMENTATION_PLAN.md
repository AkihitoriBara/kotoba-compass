# Implementation Plan - Milestone 5
# Kanji Provider

This document outlines the architecture, data model, build pipeline, and user interface for the **Kanji Provider** integration of the Kotoba Compass Language Analysis Engine.

---

## 1. KANJIDIC2 Data Source & Recommendation

### Recommended Source: Yomidan KANJIDIC English Release
We recommend downloading the pre-processed KANJIDIC2 English zip release maintained by the Yomitan community:
- **Download URL**: `https://github.com/yomidevs/jmdict-yomitan/releases/latest/download/KANJIDIC_english.zip`
- **Why**: This source is updated regularly, maps directly to EDRDG KANJIDIC2 definitions, and utilizes a highly compact array-based JSON format (`kanji_bank_1.json`) which strips out heavy XML tagging.

---

## 2. Preprocessing & Build Pipeline

We will create a new build script `scripts/build-kanjidic.ts` in the project root.

### Pipeline Flow
```
Download ──► Extract ──► Normalize ──► Validate ──► Bucket ──► Write
```

1. **Download**: Download the raw zip from the repository release.
2. **Extract**: Extract `kanji_bank_1.json` using `adm-zip`.
3. **Normalize**: Map array indices to structured records, parsing fields like Kunyomi, Onyomi, stroke count, meanings, and radical.
4. **Validate**:
   - Check that required fields (`kanji`, `meanings`, `strokeCount`) are present.
   - Verify that `strokeCount` is a valid numeric value.
   - Check that the `kanji` character is a valid single-character kanji (using standard Unicode range `[\u4e00-\u9faf]`).
   - Log warnings and skip any entries that are malformed.
5. **Bucket**: Split into **100** hash buckets using `kanji.charCodeAt(0) % 100` to remain consistent with the Vocabulary Provider hash strategy.
6. **Write**: Write JSON files under `public/dictionaries/kanji/bucket_*.json`.

### Automation & Repository Rules
- Preprocessing is automated via `pnpm build:kanji` (executed as a one-time build step).
- The split JSON bucket files are committed to Git under `apps/extension/public/dictionaries/kanji/`. This prevents requiring developers to download and parse a 6MB raw database during standard setup.

---

## 3. Data Model

We will update [types.ts](file:///d:/All%20Coding%20Stuff/kotoba-compass/apps/extension/lib/analysis/types.ts) to define a strongly typed `KanjiEntry` interface, replacing the current empty placeholder:

```typescript
export interface KanjiEntry {
  kanji: string;        // The kanji character (e.g. "猫")
  onyomi: string[];     // Onyomi readings in katakana (e.g. ["ビョウ"])
  kunyomi: string[];    // Kunyomi readings in hiragana (e.g. ["ねこ"])
  meanings: string[];   // English meanings/glosses (e.g. ["cat"])
  strokeCount: number;  // Number of strokes (e.g. 11)
  radical?: string;     // Radical representation/tag (e.g. "犬")
  jlptLevel?: number;   // JLPT level (e.g., 5 for N5, 1 for N1)
  frequency?: number;   // Frequency rank (e.g., 100 for top-100)
  grade?: number;       // School grade level (1-6 for elementary, 8 for general)
}
```

---

## 4. Provider Registry Integration & Architecture

The registry-based plugin model in `LanguageAnalysisEngine` allows us to add the Kanji Provider without altering the engine's core query pipelines.

### Architecture Flow
```
                           ┌─────────────────────────┐
                           │ LanguageAnalysisEngine  │
                           └────────────┬────────────┘
                                        │
                                        ▼ (Broadcasts candidates)
                       ┌─────────────────────────────────┐
                       │   registeredProviders: Array    │
                       └───────┬─────────────────┬───────┘
                               │ (Vocabulary)    │ (Kanji)
                               ▼                 ▼
                     ┌──────────────────┐      ┌──────────────────┐
                     │VocabularyProvider│      │  KanjiProvider   │
                     └──────────────────┘      └──────────────────┘
```

### Provider Data Flow
Rather than querying independently, the engine uses the candidates resolved from selection to perform enrichment.
```
DictionaryEntry[] (from VocabularyProvider)
            │
            ▼
Extract Unique Kanji (regex filters unique kanji characters)
            │
            ▼
KanjiProvider (queries hashed local JSON files)
            │
            ▼
KanjiEntry[] (appended to analysis result)
```

### KanjiProvider Implementation Details
1. Extends `LanguageProvider<KanjiEntry>`.
2. Extracts unique kanji characters from incoming `DeinflectionCandidate` word forms using a regex helper:
   `const kanjiChars = [...new Set(candidates.flatMap(c => c.text.match(/[\u4e00-\u9faf]/g) || []))];`
3. Loops through each unique kanji character, hashes it (`kanji.charCodeAt(0) % 100` for consistency), fetches its bucket asset (`dictionaries/kanji/bucket_X.json`), and queries the matching kanji details.
4. Returns the compiled array of `KanjiEntry` objects.

---

## 5. Companion Panel UI & Mockup

In the **Dictionary** tab, resolved kanji details will render below the primary vocabulary entry card.

### UI Design Strategy
- **Visual Rhythm**: Kanji entries will fade in sequentially below the vocabulary card to create a smooth, native look.
- **Badge pills**: Onyomi and Kunyomi will be visually styled with distinct background pills (e.g., light blue for Onyomi, light orange for Kunyomi) to help learners distinguish Chinese vs. Japanese readings easily.
- **Radical and Strokes**: Compact, metadata pills aligned in a header row.

### UI Mockup
```
┌──────────────────────────────────────────────┐
│  KOTOBA COMPASS                              │
├──────────────────────────────────────────────┤
│  [Dictionary]    [AI Tutor]    [Mining Card] │
├──────────────────────────────────────────────┤
│                                              │
│  Selected: 猫                                 │
│  ┌────────────────────────────────────────┐  │
│  │  猫 (ねこ)                             │  │
│  │  1. cat (esp. domestic)                │  │
│  │  [noun]                                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Kanji Characters                            │
│  ┌────────────────────────────────────────┐  │
│  │  猫                                     │  │
│  │  Strokes: 11   Radical: 犬             │  │
│  │                                        │  │
│  │  On:  [ ビョウ ]                       │  │
│  │  Kun: [ ねこ ]                         │  │
│  │                                        │  │
│  │  Meanings:                             │  │
│  │  1. cat                                │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 6. Verification Strategy

### Automated Verification
We will add unit test checks to our test script `C:\Users\Akihitori\.gemini\antigravity-ide\brain\<id>/scratch/test_analysis.ts`:
- **Word**: Query `猫` (expected to return the vocabulary meaning "cat" AND a matching `KanjiEntry` for `猫` with 11 strokes, Kunyomi "ねこ", Onyomi "ビョウ").
- **Multiple Kanji Word**: Query `漢字` (expected to return vocabulary entry AND exactly two `KanjiEntry` objects for `漢` and `字` respectively).
- **Mixed Kanji/Kana Word**: Query `食べる` (expected to return vocabulary entry for `食べる` AND exactly one `KanjiEntry` corresponding to `食`. Kana characters `べる` must be ignored).
- **Kana Only**: Query `たべる` (expected to return vocabulary entry but no Kanji entries).

### Manual Verification
- Highlight `猫` on Wikipedia, click the Action Chip, and verify the Companion Panel renders both the vocabulary card and the kanji details sub-cards.