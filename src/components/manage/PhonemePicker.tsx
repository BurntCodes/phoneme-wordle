"use client";

import type { ApiPhoneme } from "@/lib/api/client";
import { buildKeyboardRows } from "@/lib/phonemeShape";

// IPA symbols aren't typeable on a normal keyboard, so phoneme sequences are
// built by clicking buttons (same grouping as the live Wordle keyboard)
// rather than free text -- this also makes bad input structurally
// impossible instead of something to validate after the fact.
export default function PhonemePicker({
  phonemes,
  value,
  onChange,
}: {
  phonemes: ApiPhoneme[];
  value: string[];
  onChange: (phonemes: string[]) => void;
}) {
  const { labels, consonantRows, vowelRows } = buildKeyboardRows(phonemes);

  return (
    <div className="space-y-3">
      <div className="flex min-h-10 flex-wrap items-center gap-1 rounded-md border border-zinc-200 p-2 dark:border-zinc-700">
        {value.length === 0 && (
          <span className="text-sm text-zinc-400 dark:text-zinc-500">No phonemes selected</span>
        )}
        {value.map((symbol, index) => (
          <button
            key={`${symbol}-${index}`}
            type="button"
            title="Remove"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="rounded bg-zinc-900 px-2 py-1 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {symbol} ×
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {[...consonantRows, ...vowelRows].map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-1">
            {row.map((symbol) => (
              <button
                key={symbol}
                type="button"
                title={`${labels[symbol]?.letters} — ${labels[symbol]?.example}`}
                onClick={() => onChange([...value, symbol])}
                className="rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {symbol}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
