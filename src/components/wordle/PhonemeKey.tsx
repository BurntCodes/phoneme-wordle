"use client";

import { PHONEME_LABELS } from "@/lib/phonemes";
import type { PhonemeStatus } from "@/lib/wordle";

const STATUS_CLASSES: Record<PhonemeStatus, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-amber-500 text-white border-amber-500",
  absent:
    "bg-zinc-400 text-white border-zinc-400 dark:bg-zinc-700 dark:border-zinc-700",
};

export default function PhonemeKey({
  symbol,
  status,
  onPress,
}: {
  symbol: string;
  status?: PhonemeStatus;
  onPress: (symbol: string) => void;
}) {
  const label = PHONEME_LABELS[symbol];

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onPress(symbol)}
        aria-label={
          label ? `/${symbol}/, ${label.letters} as in ${label.example}` : symbol
        }
        className={`min-w-9 rounded-md border px-2.5 py-2 text-sm font-medium transition-colors ${
          status
            ? STATUS_CLASSES[status]
            : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        }`}
      >
        {symbol}
      </button>
      {label && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block group-focus-within:block dark:bg-zinc-100 dark:text-zinc-900"
        >
          {label.letters} (as in {label.example})
        </div>
      )}
    </div>
  );
}
