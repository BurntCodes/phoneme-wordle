"use client";

import { PHONEME_LABELS } from "@/lib/phonemes";

export default function WordSearchCell({
  row,
  col,
  phoneme,
  highlighted,
  found,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
}: {
  row: number;
  col: number;
  phoneme: string;
  highlighted: boolean;
  found: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onTouchStart: () => void;
}) {
  const label = PHONEME_LABELS[phoneme];

  return (
    <div className="group relative">
      <div
        data-row={row}
        data-col={col}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onTouchStart={onTouchStart}
        className={`flex aspect-square w-9 select-none items-center justify-center rounded border text-sm font-semibold transition-colors sm:w-10 ${
          found
            ? "border-green-600 bg-green-100 text-green-800 dark:border-green-500 dark:bg-green-900/40 dark:text-green-300"
            : highlighted
              ? "border-amber-500 bg-amber-100 text-amber-900 dark:border-amber-400 dark:bg-amber-900/40 dark:text-amber-200"
              : "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {phoneme}
      </div>
      {label && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-zinc-100 dark:text-zinc-900"
        >
          {label.letters} (as in {label.example})
        </div>
      )}
    </div>
  );
}
