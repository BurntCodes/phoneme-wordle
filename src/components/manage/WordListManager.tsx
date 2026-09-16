"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  fetchWordLists,
  fetchWordList,
  fetchPhonemes,
  createWordList,
  renameWordList,
  deleteWordList,
  addWord,
  updateWord,
  deleteWord,
  orderedPhonemes,
  type ApiWordListSummary,
  type ApiWordList,
  type ApiPhoneme,
  type ApiWord,
} from "@/lib/api/client";
import PhonemePicker from "./PhonemePicker";

const inputClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800";
const primaryButtonClass =
  "rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
const secondaryButtonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

export default function WordListManager() {
  const [lists, setLists] = useState<ApiWordListSummary[] | null>(null);
  const [phonemes, setPhonemes] = useState<ApiPhoneme[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApiWordList | null>(null);

  const [newListName, setNewListName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [newWordText, setNewWordText] = useState("");
  const [newWordPhonemes, setNewWordPhonemes] = useState<string[]>([]);

  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPhonemes, setEditPhonemes] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([fetchWordLists(), fetchPhonemes()])
      .then(([l, p]) => {
        setLists(l);
        setPhonemes(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load word lists"));
  }, []);

  async function refreshLists() {
    setLists(await fetchWordLists());
  }

  async function refreshDetail(id: string) {
    setDetail(await fetchWordList(id));
  }

  async function toggleExpand(id: string) {
    setError(null);
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setEditingWordId(null);
    try {
      await refreshDetail(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load word list");
    }
  }

  async function handleCreateList(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createWordList(newListName.trim());
      setNewListName("");
      await refreshLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create word list");
    }
  }

  async function handleRename(id: string) {
    setError(null);
    try {
      await renameWordList(id, renameValue.trim());
      setRenamingId(null);
      await refreshLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename word list");
    }
  }

  async function handleDeleteList(id: string) {
    if (!window.confirm("Delete this word list and all its words?")) return;
    setError(null);
    try {
      await deleteWordList(id);
      if (expandedId === id) {
        setExpandedId(null);
        setDetail(null);
      }
      await refreshLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete word list");
    }
  }

  async function handleAddWord(e: FormEvent, wordListId: string) {
    e.preventDefault();
    setError(null);
    try {
      await addWord(wordListId, newWordText.trim(), newWordPhonemes);
      setNewWordText("");
      setNewWordPhonemes([]);
      await refreshDetail(wordListId);
      await refreshLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add word");
    }
  }

  function startEditWord(word: ApiWord) {
    setEditingWordId(word.id);
    setEditText(word.text);
    setEditPhonemes(orderedPhonemes(word));
  }

  async function handleSaveWord(wordListId: string) {
    if (!editingWordId) return;
    setError(null);
    try {
      await updateWord(editingWordId, { text: editText.trim(), phonemes: editPhonemes });
      setEditingWordId(null);
      await refreshDetail(wordListId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update word");
    }
  }

  async function handleDeleteWord(id: string, wordListId: string) {
    if (!window.confirm("Delete this word?")) return;
    setError(null);
    try {
      await deleteWord(id);
      await refreshDetail(wordListId);
      await refreshLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete word");
    }
  }

  if (error) {
    return <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!lists || !phonemes) {
    return <p className="text-zinc-500 dark:text-zinc-400">Loading word lists…</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateList} className="flex gap-2">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New word list name"
          className={`${inputClass} flex-1`}
          required
        />
        <button type="submit" className={primaryButtonClass}>
          Create list
        </button>
      </form>

      <ul className="space-y-2">
        {lists.map((list) => (
          <li key={list.id} className="rounded-md border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between gap-2 p-3">
              {renamingId === list.id ? (
                <div className="flex flex-1 gap-2">
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <button type="button" onClick={() => handleRename(list.id)} className={primaryButtonClass}>
                    Save
                  </button>
                  <button type="button" onClick={() => setRenamingId(null)} className={secondaryButtonClass}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggleExpand(list.id)}
                    className="flex-1 text-left font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {list.name}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      ({list._count.words} words, {list._count.activities} activities)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(list.id);
                      setRenameValue(list.name);
                    }}
                    className={secondaryButtonClass}
                  >
                    Rename
                  </button>
                  <button type="button" onClick={() => handleDeleteList(list.id)} className={secondaryButtonClass}>
                    Delete
                  </button>
                </>
              )}
            </div>

            {expandedId === list.id && (
              <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-700">
                {!detail ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {detail.words.map((word) => (
                        <li key={word.id} className="rounded-md border border-zinc-100 p-2 dark:border-zinc-800">
                          {editingWordId === word.id ? (
                            <div className="space-y-2">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className={inputClass}
                              />
                              <PhonemePicker phonemes={phonemes} value={editPhonemes} onChange={setEditPhonemes} />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveWord(list.id)}
                                  className={primaryButtonClass}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingWordId(null)}
                                  className={secondaryButtonClass}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span>
                                <strong>{word.text}</strong>{" "}
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                  /{orderedPhonemes(word).join(" ")}/
                                </span>
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditWord(word)}
                                  className={secondaryButtonClass}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWord(word.id, list.id)}
                                  className={secondaryButtonClass}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                      {detail.words.length === 0 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No words yet.</p>
                      )}
                    </ul>

                    <form onSubmit={(e) => handleAddWord(e, list.id)} className="space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <input
                        value={newWordText}
                        onChange={(e) => setNewWordText(e.target.value)}
                        placeholder="Word"
                        className={inputClass}
                        required
                      />
                      <PhonemePicker phonemes={phonemes} value={newWordPhonemes} onChange={setNewWordPhonemes} />
                      <button
                        type="submit"
                        disabled={newWordPhonemes.length === 0}
                        className={primaryButtonClass}
                      >
                        Add word
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
        {lists.length === 0 && <p className="text-sm text-zinc-500 dark:text-zinc-400">No word lists yet.</p>}
      </ul>
    </div>
  );
}
