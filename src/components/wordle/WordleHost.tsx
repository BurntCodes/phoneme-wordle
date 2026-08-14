"use client";

import { useEffect, useRef } from "react";
import { CONSONANT_GROUPS, VOWEL_GROUPS, PHONEME_LABELS } from "@/lib/phonemes";
import { loadEngineScript } from "@/lib/loadEngineScript";
import { pickRandomWord } from "@/lib/wordle";

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
  difficulty,
  round,
  maxGuesses,
}: {
  difficulty: number;
  round: number;
  maxGuesses: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let handle: EngineHandle | null = null;
    let cancelled = false;

    loadEngineScript(ENGINE_SRC).then(() => {
      if (cancelled || !containerRef.current || !window.PhonemeWordleEngine) return;
      handle = window.PhonemeWordleEngine.mount(containerRef.current, {
        target: pickRandomWord(difficulty),
        labels: PHONEME_LABELS,
        consonantRows: Object.values(CONSONANT_GROUPS),
        vowelRows: Object.values(VOWEL_GROUPS),
        maxGuesses,
      });
    });

    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [difficulty, round, maxGuesses]);

  return <div ref={containerRef} />;
}
