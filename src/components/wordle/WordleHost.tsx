"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { loadEngineScript } from "@/lib/loadEngineScript";
import { fetchActivity, fetchWordList, fetchPhonemes, orderedPhonemes } from "@/lib/api/client";
import { buildKeyboardRows } from "@/lib/phonemeShape";
import type { WordleMountOptions } from "@/lib/wordleExport";

interface EngineHandle {
  destroy: () => void;
}

declare global {
  interface Window {
    PhonemeWordleEngine?: {
      mount: (container: HTMLElement, options: unknown) => EngineHandle;
    };
  }
}

const ENGINE_SRC = "/engines/wordle-engine.js";

export default function WordleHost({
  activityId,
  round,
  optionsRef,
}: {
  activityId: string;
  round: number;
  optionsRef: RefObject<WordleMountOptions | null>;
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
        const candidates = wordList.words.filter((w) => w.phonemes.length === activity.difficulty);
        if (candidates.length === 0) {
          throw new Error(`No words with ${activity.difficulty} phonemes in "${wordList.name}"`);
        }
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const { labels, consonantRows, vowelRows } = buildKeyboardRows(phonemes);

        const options: WordleMountOptions = {
          target: { word: chosen.text, phonemes: orderedPhonemes(chosen) },
          labels,
          consonantRows,
          vowelRows,
          maxGuesses: activity.maxGuesses ?? 6,
        };

        await loadEngineScript(ENGINE_SRC);
        if (cancelled || !containerRef.current || !window.PhonemeWordleEngine) return;

        optionsRef.current = options;
        handle = window.PhonemeWordleEngine.mount(containerRef.current, options);
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
