import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wordle" };

export default function WordlePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Wordle Builder
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        The phoneme keyboard, guess grid, and hover hints land here in the
        next build.
      </p>
    </div>
  );
}
