"use client";

import { useState } from "react";
import WordSearchHost from "./WordSearchHost";

export default function WordSearchGame() {
  const [round, setRound] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <WordSearchHost round={round} />
      <button
        type="button"
        onClick={() => setRound((r) => r + 1)}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        New Puzzle
      </button>
    </div>
  );
}
