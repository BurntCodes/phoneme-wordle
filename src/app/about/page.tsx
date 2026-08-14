import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          About this project
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This is a builder for phoneme-based classroom activities, aimed at
          Speech Pathology students and teachers. Teachers configure an
          activity, preview it, and generate a standalone HTML file that
          plays in any web browser.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <strong>Assessment 1 is frontend only.</strong> This stage focuses
          on the builder&apos;s interface, usability, and responsive design.
          A database and dynamic word-list management are introduced in
          later assessments.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          The tools
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Wordle</strong> — a phoneme-based guessing game, built
            around a single target word for this assessment.
          </li>
          <li>
            <strong>Word Search</strong> — a phoneme-based word search built
            from a small fixed word list.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Walkthrough video
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">Video link goes here.</p>
      </section>

      <section className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        <p>Luke Daniel Robinson</p>
        <p>Student ID: 18104496</p>
      </section>
    </div>
  );
}
