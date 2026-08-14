"use client";

import { useState } from "react";
import WordleHost from "./WordleHost";
import { MAX_GUESSES } from "@/lib/wordle";

const DIFFICULTIES = [3, 4, 5] as const;

export default function WordleGame() {
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(3);
  const [round, setRound] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {DIFFICULTIES.map((length) => (
          <button
            key={length}
            type="button"
            onClick={() => setDifficulty(length)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              difficulty === length
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {length} phonemes
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          New Game
        </button>
      </div>

      <WordleHost difficulty={difficulty} round={round} maxGuesses={MAX_GUESSES} />
    </div>
  );
}
