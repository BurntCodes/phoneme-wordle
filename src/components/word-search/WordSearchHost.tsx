"use client";

import { useEffect, useRef, type RefObject } from "react";
import { PHONEME_LABELS } from "@/lib/phonemes";
import { loadEngineScript } from "@/lib/loadEngineScript";
import { buildPuzzle, WORD_SEARCH_WORDS, type WordSearchPuzzle } from "@/lib/wordSearch";

interface EngineHandle {
  destroy: () => void;
}

declare global {
  interface Window {
    PhonemeWordSearchEngine?: {
      mount: (container: HTMLElement, options: unknown) => EngineHandle;
    };
  }
}

const ENGINE_SRC = "/engines/word-search-engine.js";
const GRID_SIZE = 10;

export default function WordSearchHost({
  round,
  puzzleRef,
}: {
  round: number;
  puzzleRef: RefObject<WordSearchPuzzle | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let handle: EngineHandle | null = null;
    let cancelled = false;

    loadEngineScript(ENGINE_SRC).then(() => {
      if (cancelled || !containerRef.current || !window.PhonemeWordSearchEngine) return;
      const puzzle = buildPuzzle(WORD_SEARCH_WORDS, GRID_SIZE, GRID_SIZE);
      puzzleRef.current = puzzle;
      handle = window.PhonemeWordSearchEngine.mount(containerRef.current, {
        grid: puzzle.grid,
        words: WORD_SEARCH_WORDS,
        labels: PHONEME_LABELS,
      });
    });

    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [round, puzzleRef]);

  return <div ref={containerRef} />;
}
