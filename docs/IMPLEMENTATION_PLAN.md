# Implementation Plan - Milestone 4
# Language Analysis Engine (Phase 1)

This document outlines the architecture, data structures, and implementation tasks for Phase 1 of the **Language Analysis Engine**. 

The goal of this milestone is to implement the local Vocabulary lookup system (via JMdict), allowing the in-page Companion Panel to resolve selected Japanese words into their base forms, readings, and definitions offline.

---

## 1. Dictionary Selection & Recommendation

### Recommended Dictionary: JMdict (English)
We recommend **JMdict** (maintained by EDRDG). It is the industry standard for Japanese dictionary lookups, covering over 180,000 entries with detailed readings, parts of speech, and glosses.

### Data Format Optimization
We will use a pre-processed version of JMdict in a simplified, array-based JSON format (similar to the format used by Yomitan dictionaries). This format strips out verbose XML tags and structure, compressing the entire dictionary database down to a lightweight footprint suitable for extension bundling.

---

## 2. Local Storage Strategy & Directory Structure

Instead of using a heavy database like IndexedDB (which requires a slow 5–10 second import stage on the first run and can suffer from storage capacity limits or profile corruption), we will use a **Prefix-Split Hash-Bucket JSON** system.

### Directory Structure
To prepare the extension for future providers, assets will be organized into specific subdirectories:
```
apps/extension/assets/dictionaries/
├── vocabulary/     <-- Hashed JSON buckets for JMdict (Milestone 4)
├── kanji/          <-- Placeholder for future KANJIDIC files
└── names/          <-- Placeholder for future JMnedict files
```

### Hash-Bucket Structure
- The JMdict lexicon will be split at build time into 100 individual JSON bucket files located under the `vocabulary` directory:
  `assets/dictionaries/vocabulary/bucket_0.json` to `assets/dictionaries/vocabulary/bucket_99.json`
- The hash function determines the bucket for a word based on its first character:
  `const bucketIndex = word.charCodeAt(0) % 100;`
- Each JSON bucket file contains an array of words hashed to that index (averaging ~1,800 entries per bucket, resulting in files of ~150KB).

### Lookup Sequence
1. The extension computes the bucket index for the query text.
2. It fetches the corresponding bucket file asynchronously:
   `await fetch(browser.runtime.getURL(`assets/dictionaries/vocabulary/bucket_${bucketIndex}.json`))`
3. It parses the JSON file (taking <2ms) and filters the records in memory for exact matches.
4. Lookup latency is expected to be under **15–20ms**, running entirely offline with zero background memory footprint when idle.

---

## 3. Dictionary Build Pipeline Clarification

### How the Dictionary is Obtained and Converted
1. **Source Data**: We obtain a raw JSON release of the EDRDG JMdict file (from the community-supported `jmdict-simplified` project).
2. **Build Preprocessing**: We write a node script `scripts/build-dictionary.js` in the project root. This script:
   - Reads the raw JSON dictionary file.
   - Cleans up metadata and strips verbose fields (like non-English definitions or redundant tags).
   - Formats the entries into minimized arrays to save space.
   - Hashes words based on their first character and writes them into the 100 split bucket JSON files under `apps/extension/assets/dictionaries/vocabulary/`.

### Automation and Repository Rules
- **One-time Generation & Git Commit**: The preprocessed bucket JSON files are **committed to Git** as static assets. Because the dictionary data is stable, this avoids requiring every developer to download and build a 150MB raw database during standard workspace setup.
- **Source vs. Artifact boundaries**:
  - `scripts/build-dictionary.js` is a **source code file** and is committed to Git.
  - The raw input JSON database file is **excluded** from Git via `.gitignore`.
  - The preprocessed split bucket files (`assets/dictionaries/vocabulary/bucket_*.json`) are committed to Git.

---

## 4. Deinflection Strategy Justification

Our pipeline performs **Deinflection Upfront**:
```
Selection ──► Normalization ──► Deinflection ──► Dictionary Lookup
```
Instead of a fallback-based deinflection (`Lookup -> If not found -> Deinflect -> Lookup`):

### Why Deinflection Upfront is Better
1. **Parallel Execution**:
   In the Registry Provider pattern, all registered providers (Vocabulary, Kanji, Names) execute their queries in parallel. By generating a list of candidate stems (`DeinflectionCandidate[]`) upfront, the engine can broadcast these candidates to all providers in a single parallel sweep. 
   If we used a fallback-based sequence, the execution path would become strictly sequential (Vocabulary first, then deinflect, then query vocabulary again, then query names), adding latency and complicating the registry pipeline.
2. **Exposing Inflection Pathways for Grammar Explanations**:
   The upfront deinflection step generates not only candidates but also their **inflection pathways** (the grammatical suffixes stripped, such as `polite + past` or `causative + passive`). 
   Surfacing this grammar pathway data is a key requirement of the project specification (Chapter 7), as future AI Tutor and grammar components will consume this pathway to explain sentences to the user without needing to recalculate verb stems themselves.
3. **No Overhead**:
   The exact selected text is always included as the first candidate in the list (with `rulesApplied = []`). Looking up a few candidate stems along with the original word is highly optimized, adding negligible overhead in our hashed-bucket file loader.

---

## 5. Data Interfaces

We will define clean, standardized, and strongly typed TypeScript interfaces for dictionary records and the engine's query results:

```typescript
export interface DictionaryEntry {
  word: string;           // Base/dictionary form (e.g., "食べる")
  reading: string;        // Kana reading (e.g., "たべる")
  meanings: string[];     // English definition glosses
  partOfSpeech: string[]; // Grammatical tags (e.g., ["v1", "vt"])
  jlpt?: string;          // JLPT level (e.g., "N5")
  frequency?: number;     // Word frequency rank (optional)
  tags?: string[];        // Additional tags (e.g., "common")
}

export interface DeinflectionCandidate {
  text: string;           // The deinflected word form
  rulesApplied: string[]; // List of grammar rules applied in reverse
}

// Strong type definitions for future modules
export interface KanjiEntry {
  // To be populated in future milestones
}

export interface NameEntry {
  // To be populated in future milestones
}

export interface LanguageAnalysisResult {
  sourceText: string;         // Original highlighted selection (e.g., "食べました")
  entries: DictionaryEntry[]; // Vocabulary matches found
  kanji?: KanjiEntry[];       // Strongly typed Kanji entries (placeholder)
  names?: NameEntry[];        // Strongly typed Name entries (placeholder)
}
```

---

## 6. Language Analysis Engine Architecture

The analysis engine is built around a plug-and-play **Provider Registry Pattern**.

```typescript
export interface LanguageProvider {
  name: string;
  lookup(candidates: DeinflectionCandidate[]): Promise<any[]>;
}

export class LanguageAnalysisEngine {
  private providers: LanguageProvider[] = [];
  private deinflector: Deinflector;

  constructor() {
    this.deinflector = new Deinflector();
  }

  public registerProvider(provider: LanguageProvider): void {
    this.providers.push(provider);
  }

  public async analyze(text: string): Promise<LanguageAnalysisResult> {
    const normalized = text.trim().normalize('NFC');
    const candidates = this.deinflector.deinflect(normalized);
    
    // Run all registered providers in parallel
    const providerLookups = await Promise.all(
      this.providers.map(async (provider) => {
        try {
          return {
            name: provider.name,
            entries: await provider.lookup(candidates),
          };
        } catch (e) {
          console.error(`[LanguageAnalysisEngine] Provider ${provider.name} failed:`, e);
          return { name: provider.name, entries: [] };
        }
      })
    );

    // Merge lookups
    const vocabResult = providerLookups.find((p) => p.name === 'vocabulary');
    const kanjiResult = providerLookups.find((p) => p.name === 'kanji');
    const nameResult = providerLookups.find((p) => p.name === 'names');
    
    return {
      sourceText: text,
      entries: vocabResult ? vocabResult.entries : [],
      kanji: kanjiResult ? kanjiResult.entries : [],
      names: nameResult ? nameResult.entries : [],
    };
  }
}
```

---

## 7. Proposed Changes

We will create and update the following files:

### New Directories
- `apps/extension/assets/dictionaries/vocabulary/` (contains split JSON dictionary files)
- `apps/extension/assets/dictionaries/kanji/` (placeholder)
- `apps/extension/assets/dictionaries/names/` (placeholder)
- `apps/extension/lib/analysis/` (contains engine, providers, and deinflector)

### New Files
- **`apps/extension/lib/analysis/deinflector.ts`**: Rule-based deinflection class. Generates word stems from suffix replacement tables.
- **`apps/extension/lib/analysis/vocabulary-provider.ts`**: Vocabulary lookup class. Performs hashing, loads asset buckets, and matches entries.
- **`apps/extension/lib/analysis/engine.ts`**: Orchestrates normalization, deinflection, provider execution, and result merging.
- **`apps/extension/components/dictionary-result.tsx`**: React view representing the dictionary form, reading, and definitions in a clean card format.

### Modified Files
- **`apps/extension/components/companion-panel.tsx`**: Show the `DictionaryResult` card when dictionary analysis completes successfully.
- **`apps/extension/hooks/use-selected-text.ts`**: Integrate `LanguageAnalysisEngine` to handle selected text resolution.
- **`wxt.config.ts`**: Configure WXT to treat the `assets/dictionaries/**/*.json` files as public resources so they are bundled into `.output/` and accessible via `browser.runtime.getURL`.