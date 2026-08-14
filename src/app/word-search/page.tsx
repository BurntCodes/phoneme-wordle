import type { Metadata } from "next";
import WordSearchGame from "@/components/word-search/WordSearchGame";

export const metadata: Metadata = { title: "Word Search" };

export default function WordSearchPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Word Search Builder
        </h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Drag across phonemes to find each word. Hover a cell to see its
          English letter equivalent.
        </p>
      </div>
      <WordSearchGame />
    </div>
  );
}
