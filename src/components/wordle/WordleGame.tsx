"use client";

import { useEffect, useReducer, useState } from "react";
import GuessGrid from "./GuessGrid";
import PhonemeKeyboard from "./PhonemeKeyboard";
import {
  computeKeyStatuses,
  initialWordleState,
  MAX_GUESSES,
  pickRandomWord,
  wordleReducer,
} from "@/lib/wordle";

const DIFFICULTIES = [3, 4, 5] as const;

export default function WordleGame() {
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(3);
  const [state, dispatch] = useReducer(wordleReducer, initialWordleState);

  useEffect(() => {
    dispatch({ type: "NEW_GAME", target: pickRandomWord(difficulty) });
  }, [difficulty]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") dispatch({ type: "SUBMIT" });
      if (event.key === "Backspace") dispatch({ type: "BACKSPACE" });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const keyStatuses = computeKeyStatuses(state.guesses);

  if (!state.target) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400">Loading…</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
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
      </div>

      <GuessGrid
        guesses={state.guesses}
        currentGuess={state.currentGuess}
        wordLength={state.target.phonemes.length}
        maxGuesses={MAX_GUESSES}
      />

      {state.gameState === "won" && (
        <p className="text-center font-medium text-green-700 dark:text-green-400">
          Correct! The word was <strong>{state.target.word}</strong>.
        </p>
      )}
      {state.gameState === "lost" && (
        <p className="text-center font-medium text-red-700 dark:text-red-400">
          Out of guesses. The word was <strong>{state.target.word}</strong> (
          {state.target.phonemes.join(" ")}).
        </p>
      )}
      {state.message && state.gameState === "playing" && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          {state.message}
        </p>
      )}

      {state.gameState === "playing" ? (
        <>
          <PhonemeKeyboard
            keyStatuses={keyStatuses}
            onPress={(phoneme) => dispatch({ type: "PRESS", phoneme })}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACKSPACE" })}
              className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SUBMIT" })}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Submit
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: "NEW_GAME", target: pickRandomWord(difficulty) })}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New Game
        </button>
      )}
    </div>
  );
}
