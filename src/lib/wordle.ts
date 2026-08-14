import { PHONEME_WORDS, type PhonemeWord } from "@/lib/phonemes";

export const MAX_GUESSES = 6;

export function pickRandomWord(length: number): PhonemeWord {
  const candidates = PHONEME_WORDS.filter((w) => w.phonemes.length === length);
  return candidates[Math.floor(Math.random() * candidates.length)];
}
