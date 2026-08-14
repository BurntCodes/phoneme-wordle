import type { PhonemeStatus, ScoredGuess } from "@/lib/wordle";

const STATUS_CLASSES: Record<PhonemeStatus, string> = {
  correct: "bg-green-600 border-green-600 text-white",
  present: "bg-amber-500 border-amber-500 text-white",
  absent:
    "bg-zinc-400 border-zinc-400 text-white dark:bg-zinc-700 dark:border-zinc-700",
};

export default function GuessGrid({
  guesses,
  currentGuess,
  wordLength,
  maxGuesses,
}: {
  guesses: ScoredGuess[];
  currentGuess: string[];
  wordLength: number;
  maxGuesses: number;
}) {
  const rows: ScoredGuess[] = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    if (rowIndex < guesses.length) return guesses[rowIndex];
    if (rowIndex === guesses.length) return { phonemes: currentGuess, statuses: [] };
    return { phonemes: [], statuses: [] };
  });

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5">
          {Array.from({ length: wordLength }, (_, cellIndex) => {
            const phoneme = row.phonemes[cellIndex];
            const status = row.statuses[cellIndex];
            return (
              <div
                key={cellIndex}
                className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-lg font-semibold ${
                  status
                    ? STATUS_CLASSES[status]
                    : phoneme
                      ? "border-zinc-400 text-zinc-900 dark:border-zinc-500 dark:text-zinc-50"
                      : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {phoneme ?? ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
