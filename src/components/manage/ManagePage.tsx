"use client";

import { useState } from "react";
import WordListManager from "./WordListManager";
import ActivityManager from "./ActivityManager";

const TABS = ["Word Lists", "Activities"] as const;

export default function ManagePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Word Lists");

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Manage Content</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Create and edit the word lists and activity configurations that drive the Wordle and Word Search builders.
      </p>

      <div role="tablist" aria-label="Manage section" className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium ${
              tab === t
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Word Lists" ? <WordListManager /> : <ActivityManager />}
    </div>
  );
}
