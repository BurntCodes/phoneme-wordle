"use client";

import { useEffect, useState } from "react";
import WordSearchGrid from "./WordSearchGrid";
import {
  buildPuzzle,
  matchWord,
  WORD_SEARCH_WORDS,
  type Coord,
  type WordSearchPuzzle,
} from "@/lib/wordSearch";

const GRID_SIZE = 10;

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

export default function WordSearchGame() {
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    newPuzzle();
  }, []);

  function newPuzzle() {
    setPuzzle(buildPuzzle(WORD_SEARCH_WORDS, GRID_SIZE, GRID_SIZE));
    setFoundWords(new Set());
    setFoundCells(new Set());
  }

  function handleSelectionComplete(path: Coord[]) {
    if (!puzzle) return;
    const match = matchWord(path, puzzle.grid, WORD_SEARCH_WORDS, foundWords);
    if (!match) return;

    setFoundWords((prev) => new Set(prev).add(match));
    setFoundCells((prev) => {
      const next = new Set(prev);
      path.forEach(({ row, col }) => next.add(cellKey(row, col)));
      return next;
    });
  }

  if (!puzzle) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400">Loading…</p>
    );
  }

  const allFound = foundWords.size === WORD_SEARCH_WORDS.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {allFound && (
        <p className="text-center font-medium text-green-700 dark:text-green-400">
          Found every word!
        </p>
      )}

      <WordSearchGrid
        grid={puzzle.grid}
        foundCells={foundCells}
        onSelectionComplete={handleSelectionComplete}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {WORD_SEARCH_WORDS.map((word) => (
          <span
            key={word.word}
            className={`rounded-md px-3 py-1 text-sm font-medium ${
              foundWords.has(word.word)
                ? "bg-green-100 text-green-700 line-through dark:bg-green-900/40 dark:text-green-300"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {word.phonemes.join(" ")}
            {foundWords.has(word.word) && ` — ${word.word}`}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={newPuzzle}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        New Puzzle
      </button>
    </div>
  );
}
