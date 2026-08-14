export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Phoneme Wordle Builder
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          CSE3CWA — Assessment 1: Frontend design and usability
        </p>
      </div>
    </header>
  );
}
