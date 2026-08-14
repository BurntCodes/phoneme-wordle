"use client";

import { useRef, useState } from "react";
import WordSearchHost from "./WordSearchHost";
import { generateWordSearchHtml } from "@/lib/wordSearchExport";
import { downloadHtmlFile } from "@/lib/htmlExport";
import type { WordSearchPuzzle } from "@/lib/wordSearch";

export default function WordSearchGame() {
  const [round, setRound] = useState(0);
  const puzzleRef = useRef<WordSearchPuzzle | null>(null);

  async function handleGenerate() {
    const puzzle = puzzleRef.current;
    if (!puzzle) return;
    const html = await generateWordSearchHtml(puzzle);
    downloadHtmlFile("phoneme-word-search.html", html);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <WordSearchHost round={round} puzzleRef={puzzleRef} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New Puzzle
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Generate HTML
        </button>
      </div>
    </div>
  );
}
