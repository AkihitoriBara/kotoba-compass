import { NameEntry, ProcessedName } from '../types';

/**
 * Stage 3: Groups and merges name cards with identical written forms.
 */
export class NameMerger {
  public static process(names: NameEntry[], sourceText: string): ProcessedName[] {
    const groups = new Map<string, NameEntry[]>();

    // Group names by written form
    for (const name of names) {
      const key = name.written;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(name);
    }

    const mergedNames: ProcessedName[] = [];

    // Merge properties for each group
    for (const [written, entries] of groups.entries()) {
      const readings = Array.from(new Set(entries.map((e) => e.reading)));
      const meanings = Array.from(new Set(entries.flatMap((e) => e.meanings)));
      const types = Array.from(new Set(entries.map((e) => e.type)));
      const tags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));
      
      // Determine priority: lowest priority value (best rank) wins
      const priorities = entries
        .map((e) => e.priority)
        .filter((p): p is number => p !== undefined);
      const priority = priorities.length > 0 ? Math.min(...priorities) : undefined;

      mergedNames.push({
        written,
        readings,
        meanings,
        types,
        tags: tags.length > 0 ? tags : undefined,
        priority,
      });
    }

    // Sort Processed Names:
    // 1. Exact match with sourceText first
    // 2. Priority ascending (smaller value = higher priority)
    const norm = sourceText.trim();
    mergedNames.sort((a, b) => {
      const exactA = a.written === norm;
      const exactB = b.written === norm;

      if (exactA && !exactB) return -1;
      if (!exactA && exactB) return 1;

      const prioA = a.priority !== undefined ? a.priority : Infinity;
      const prioB = b.priority !== undefined ? b.priority : Infinity;

      return prioA - prioB;
    });

    return mergedNames;
  }
}
