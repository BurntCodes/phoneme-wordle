"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { loadEngineScript } from "@/lib/loadEngineScript";
import { fetchActivity, fetchWordList, fetchPhonemes, orderedPhonemes } from "@/lib/api/client";
import { buildKeyboardRows } from "@/lib/phonemeShape";
import { buildPuzzle } from "@/lib/wordSearch";
import type { WordSearchMountOptions } from "@/lib/wordSearchExport";

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
const DEFAULT_GRID_SIZE = 10;

export default function WordSearchHost({
  activityId,
  round,
  optionsRef,
}: {
  activityId: string;
  round: number;
  optionsRef: RefObject<WordSearchMountOptions | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let handle: EngineHandle | null = null;
    let cancelled = false;

    (async () => {
      setError(null);
      try {
        const [activity, phonemes] = await Promise.all([fetchActivity(activityId), fetchPhonemes()]);
        const wordList = await fetchWordList(activity.wordListId);
        const words = wordList.words.map((w) => ({ word: w.text, phonemes: orderedPhonemes(w) }));
        if (words.length === 0) {
          throw new Error(`"${wordList.name}" has no words`);
        }

        const puzzle = buildPuzzle(
          words,
          activity.gridRows ?? DEFAULT_GRID_SIZE,
          activity.gridCols ?? DEFAULT_GRID_SIZE,
        );
        const { labels } = buildKeyboardRows(phonemes);
        const options: WordSearchMountOptions = { grid: puzzle.grid, words, labels };

        await loadEngineScript(ENGINE_SRC);
        if (cancelled || !containerRef.current || !window.PhonemeWordSearchEngine) return;

        optionsRef.current = options;
        handle = window.PhonemeWordSearchEngine.mount(containerRef.current, options);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load activity");
      }
    })();

    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [activityId, round, optionsRef]);

  if (error) {
    return <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>;
  }
  return <div ref={containerRef} />;
}
