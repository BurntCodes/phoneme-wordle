"use client";

import { useEffect, useRef, useState } from "react";
import WordleHost from "./WordleHost";
import { fetchActivities, type ApiActivity } from "@/lib/api/client";
import { generateWordleHtml, type WordleMountOptions } from "@/lib/wordleExport";
import { downloadHtmlFile } from "@/lib/htmlExport";

export default function WordleGame() {
  const [activities, setActivities] = useState<ApiActivity[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const optionsRef = useRef<WordleMountOptions | null>(null);

  useEffect(() => {
    fetchActivities("WORDLE")
      .then((list) => {
        setActivities(list);
        setSelectedId((current) => current ?? list[0]?.id ?? null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load activities"));
  }, []);

  async function handleGenerate() {
    const options = optionsRef.current;
    if (!options) return;
    const html = await generateWordleHtml(options);
    downloadHtmlFile("phoneme-wordle.html", html);
  }

  if (loadError) {
    return <p role="alert" className="text-red-600 dark:text-red-400">{loadError}</p>;
  }

  if (!activities) {
    return <p className="text-zinc-500 dark:text-zinc-400">Loading activities…</p>;
  }

  if (activities.length === 0 || !selectedId) {
    return <p className="text-zinc-500 dark:text-zinc-400">No Wordle activities configured yet.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => setSelectedId(activity.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedId === activity.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {activity.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          New Game
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Generate HTML
        </button>
      </div>

      <WordleHost activityId={selectedId} round={round} optionsRef={optionsRef} />
    </div>
  );
}
