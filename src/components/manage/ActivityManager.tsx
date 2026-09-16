"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchAllActivities,
  fetchWordLists,
  createActivity,
  updateActivity,
  deleteActivity,
  type ApiActivity,
  type ApiWordListSummary,
  type ActivityCreateInput,
} from "@/lib/api/client";

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800";
const primaryButtonClass =
  "rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
const secondaryButtonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

type FormState = {
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  wordListId: string;
  difficulty: string;
  maxGuesses: string;
  gridRows: string;
  gridCols: string;
  hintsEnabled: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  type: "WORDLE",
  wordListId: "",
  difficulty: "3",
  maxGuesses: "6",
  gridRows: "10",
  gridCols: "10",
  hintsEnabled: false,
};

export default function ActivityManager() {
  const [activities, setActivities] = useState<ApiActivity[] | null>(null);
  const [wordLists, setWordLists] = useState<ApiWordListSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    Promise.all([fetchAllActivities(), fetchWordLists()])
      .then(([a, w]) => {
        setActivities(a);
        setWordLists(w);
        setForm((f) => ({ ...f, wordListId: f.wordListId || w[0]?.id || "" }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load activities"));
  }, []);

  async function refresh() {
    setActivities(await fetchAllActivities());
  }

  function wordListName(id: string): string {
    return wordLists?.find((w) => w.id === id)?.name ?? id;
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, wordListId: wordLists?.[0]?.id ?? "" });
  }

  function startEdit(activity: ApiActivity) {
    setEditingId(activity.id);
    setForm({
      name: activity.name,
      type: activity.type,
      wordListId: activity.wordListId,
      difficulty: String(activity.difficulty ?? 3),
      maxGuesses: String(activity.maxGuesses ?? 6),
      gridRows: String(activity.gridRows ?? 10),
      gridCols: String(activity.gridCols ?? 10),
      hintsEnabled: activity.hintsEnabled,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await updateActivity(editingId, {
          name: form.name.trim(),
          wordListId: form.wordListId,
          hintsEnabled: form.hintsEnabled,
          ...(form.type === "WORDLE"
            ? { difficulty: Number(form.difficulty), maxGuesses: Number(form.maxGuesses) }
            : { gridRows: Number(form.gridRows), gridCols: Number(form.gridCols) }),
        });
        setEditingId(null);
      } else {
        const base = { name: form.name.trim(), wordListId: form.wordListId, hintsEnabled: form.hintsEnabled };
        const input: ActivityCreateInput =
          form.type === "WORDLE"
            ? { ...base, type: "WORDLE", difficulty: Number(form.difficulty), maxGuesses: Number(form.maxGuesses) }
            : { ...base, type: "WORD_SEARCH", gridRows: Number(form.gridRows), gridCols: Number(form.gridCols) };
        await createActivity(input);
      }
      setForm({ ...EMPTY_FORM, wordListId: wordLists?.[0]?.id ?? "" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this activity?")) return;
    setError(null);
    try {
      await deleteActivity(id);
      if (editingId === id) setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity");
    }
  }

  if (error) {
    return <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!activities || !wordLists) {
    return <p className="text-zinc-500 dark:text-zinc-400">Loading activities…</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
          >
            <span>
              <strong className="text-zinc-900 dark:text-zinc-50">{activity.name}</strong>{" "}
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {activity.type === "WORDLE"
                  ? `Wordle · ${activity.difficulty} phonemes · ${activity.maxGuesses} guesses`
                  : `Word Search · ${activity.gridRows}×${activity.gridCols}`}{" "}
                · {wordListName(activity.wordListId)}
              </span>
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => startEdit(activity)} className={secondaryButtonClass}>
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(activity.id)} className={secondaryButtonClass}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {activities.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No activities yet.</p>}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{editingId ? "Edit activity" : "New activity"}</h4>

        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Activity name"
          className={`${inputClass} w-full`}
          required
        />

        <div className="flex gap-2">
          <select
            value={form.type}
            disabled={!!editingId}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState["type"] }))}
            className={inputClass}
          >
            <option value="WORDLE">Wordle</option>
            <option value="WORD_SEARCH">Word Search</option>
          </select>

          <select
            value={form.wordListId}
            onChange={(e) => setForm((f) => ({ ...f, wordListId: e.target.value }))}
            className={inputClass}
            required
          >
            {wordLists.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {form.type === "WORDLE" ? (
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm">
              Difficulty (phonemes)
              <input
                type="number"
                min={1}
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                className={`${inputClass} w-20`}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              Max guesses
              <input
                type="number"
                min={1}
                value={form.maxGuesses}
                onChange={(e) => setForm((f) => ({ ...f, maxGuesses: e.target.value }))}
                className={`${inputClass} w-20`}
              />
            </label>
          </div>
        ) : (
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm">
              Grid rows
              <input
                type="number"
                min={1}
                value={form.gridRows}
                onChange={(e) => setForm((f) => ({ ...f, gridRows: e.target.value }))}
                className={`${inputClass} w-20`}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              Grid cols
              <input
                type="number"
                min={1}
                value={form.gridCols}
                onChange={(e) => setForm((f) => ({ ...f, gridCols: e.target.value }))}
                className={`${inputClass} w-20`}
              />
            </label>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.hintsEnabled}
            onChange={(e) => setForm((f) => ({ ...f, hintsEnabled: e.target.checked }))}
          />
          Hints enabled
        </label>

        <div className="flex gap-2">
          <button type="submit" className={primaryButtonClass}>
            {editingId ? "Save changes" : "Create activity"}
          </button>
          {editingId && (
            <button type="button" onClick={startCreate} className={secondaryButtonClass}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
