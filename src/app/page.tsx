import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-16">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Build phoneme-based classroom activities
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This builder helps Speech Pathology teachers create Wordle-style
          and Word Search activities using phoneme symbols instead of
          standard spelling, then generate a single HTML file students can
          play in any browser.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/wordle"
          className="rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        >
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Wordle</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Build a phoneme-based guessing game.
          </p>
        </Link>
        <Link
          href="/word-search"
          className="rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        >
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Word Search</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Build a phoneme-based word search puzzle.
          </p>
        </Link>
      </div>
    </div>
  );
}
