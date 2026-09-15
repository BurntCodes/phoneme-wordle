import type { ApiPhoneme } from "@/lib/api/client";

export interface PhonemeLabelMap {
  [symbol: string]: { letters: string; example: string };
}

// Reshapes the flat /api/phonemes response into what the engines expect:
// a label lookup plus phonemes grouped into rows by subgroup, in the same
// order the original CONSONANT_GROUPS/VOWEL_GROUPS constants declared them
// (displayOrder is a single running counter across the whole seed walk, so
// sorting by it and grouping by subgroup reconstructs that order exactly).
export function buildKeyboardRows(phonemes: ApiPhoneme[]): {
  labels: PhonemeLabelMap;
  consonantRows: string[][];
  vowelRows: string[][];
} {
  const sorted = [...phonemes].sort((a, b) => a.displayOrder - b.displayOrder);

  const labels: PhonemeLabelMap = {};
  const consonantGroups = new Map<string, string[]>();
  const vowelGroups = new Map<string, string[]>();

  for (const p of sorted) {
    labels[p.symbol] = { letters: p.letters, example: p.example };
    const target = p.category === "CONSONANT" ? consonantGroups : vowelGroups;
    const row = target.get(p.subgroup) ?? [];
    row.push(p.symbol);
    target.set(p.subgroup, row);
  }

  return {
    labels,
    consonantRows: Array.from(consonantGroups.values()),
    vowelRows: Array.from(vowelGroups.values()),
  };
}
