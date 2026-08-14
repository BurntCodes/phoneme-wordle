import { PHONEME_WORDS, type PhonemeWord } from "@/lib/phonemes";

export type PhonemeStatus = "correct" | "present" | "absent";

export function scoreGuess(guess: string[], target: string[]): PhonemeStatus[] {
  const result: PhonemeStatus[] = new Array(target.length).fill("absent");
  const remaining = new Map<string, number>();

  target.forEach((phoneme, i) => {
    if (guess[i] === phoneme) {
      result[i] = "correct";
    } else {
      remaining.set(phoneme, (remaining.get(phoneme) ?? 0) + 1);
    }
  });

  guess.forEach((phoneme, i) => {
    if (result[i] === "correct") return;
    const count = remaining.get(phoneme) ?? 0;
    if (count > 0) {
      result[i] = "present";
      remaining.set(phoneme, count - 1);
    }
  });

  return result;
}

export function pickRandomWord(length: number): PhonemeWord {
  const candidates = PHONEME_WORDS.filter((w) => w.phonemes.length === length);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export interface ScoredGuess {
  phonemes: string[];
  statuses: PhonemeStatus[];
}

const STATUS_RANK: Record<PhonemeStatus, number> = { absent: 0, present: 1, correct: 2 };

export function computeKeyStatuses(guesses: ScoredGuess[]): Record<string, PhonemeStatus> {
  const result: Record<string, PhonemeStatus> = {};

  for (const guess of guesses) {
    guess.phonemes.forEach((phoneme, i) => {
      const status = guess.statuses[i];
      const existing = result[phoneme];
      if (!existing || STATUS_RANK[status] > STATUS_RANK[existing]) {
        result[phoneme] = status;
      }
    });
  }

  return result;
}

export type GameState = "playing" | "won" | "lost";

export interface WordleState {
  target: PhonemeWord | null;
  guesses: ScoredGuess[];
  currentGuess: string[];
  gameState: GameState;
  message: string;
}

export type WordleAction =
  | { type: "NEW_GAME"; target: PhonemeWord }
  | { type: "PRESS"; phoneme: string }
  | { type: "BACKSPACE" }
  | { type: "SUBMIT" };

export const MAX_GUESSES = 6;

export const initialWordleState: WordleState = {
  target: null,
  guesses: [],
  currentGuess: [],
  gameState: "playing",
  message: "",
};

export function wordleReducer(state: WordleState, action: WordleAction): WordleState {
  switch (action.type) {
    case "NEW_GAME":
      return { ...initialWordleState, target: action.target };

    case "PRESS": {
      if (!state.target || state.gameState !== "playing") return state;
      if (state.currentGuess.length >= state.target.phonemes.length) return state;
      return { ...state, currentGuess: [...state.currentGuess, action.phoneme] };
    }

    case "BACKSPACE": {
      if (state.gameState !== "playing") return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
    }

    case "SUBMIT": {
      if (!state.target || state.gameState !== "playing") return state;
      if (state.currentGuess.length !== state.target.phonemes.length) {
        return { ...state, message: "Not enough phonemes yet." };
      }

      const statuses = scoreGuess(state.currentGuess, state.target.phonemes);
      const nextGuesses = [...state.guesses, { phonemes: state.currentGuess, statuses }];
      const won = statuses.every((s) => s === "correct");
      const lost = !won && nextGuesses.length >= MAX_GUESSES;

      return {
        ...state,
        guesses: nextGuesses,
        currentGuess: [],
        message: "",
        gameState: won ? "won" : lost ? "lost" : "playing",
      };
    }

    default:
      return state;
  }
}
