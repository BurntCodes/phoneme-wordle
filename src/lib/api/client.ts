export interface ApiPhoneme {
  symbol: string;
  letters: string;
  example: string;
  category: "CONSONANT" | "VOWEL";
  subgroup: string;
  displayOrder: number;
}

export interface ApiWordPhoneme {
  phonemeSymbol: string;
  position: number;
}

export interface ApiWord {
  id: string;
  text: string;
  phonemes: ApiWordPhoneme[];
}

export interface ApiWordList {
  id: string;
  name: string;
  words: ApiWord[];
}

export interface ApiWordListSummary {
  id: string;
  name: string;
  _count: { words: number; activities: number };
}

export interface ApiActivity {
  id: string;
  name: string;
  type: "WORDLE" | "WORD_SEARCH";
  wordListId: string;
  difficulty: number | null;
  maxGuesses: number | null;
  gridRows: number | null;
  gridCols: number | null;
  hintsEnabled: boolean;
}

export type ActivityCreateInput =
  | { name: string; type: "WORDLE"; wordListId: string; difficulty: number; maxGuesses: number; hintsEnabled?: boolean }
  | { name: string; type: "WORD_SEARCH"; wordListId: string; gridRows: number; gridCols: number; hintsEnabled?: boolean };

export interface ActivityUpdateInput {
  name?: string;
  wordListId?: string;
  difficulty?: number | null;
  maxGuesses?: number | null;
  gridRows?: number | null;
  gridCols?: number | null;
  hintsEnabled?: boolean;
}

function jsonInit(method: string, data?: unknown): RequestInit {
  return {
    method,
    ...(data !== undefined
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }
      : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed with status ${res.status}`);
  }
  // DELETE routes return 204 No Content -- res.json() would throw on an empty body.
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function fetchActivities(type: "WORDLE" | "WORD_SEARCH"): Promise<ApiActivity[]> {
  return apiFetch<{ activities: ApiActivity[] }>(`/api/activities?type=${type}`).then((d) => d.activities);
}

export function fetchAllActivities(): Promise<ApiActivity[]> {
  return apiFetch<{ activities: ApiActivity[] }>("/api/activities").then((d) => d.activities);
}

export function fetchActivity(id: string): Promise<ApiActivity> {
  return apiFetch<{ activity: ApiActivity }>(`/api/activities/${id}`).then((d) => d.activity);
}

export function createActivity(data: ActivityCreateInput): Promise<ApiActivity> {
  return apiFetch<{ activity: ApiActivity }>("/api/activities", jsonInit("POST", data)).then((d) => d.activity);
}

export function updateActivity(id: string, data: ActivityUpdateInput): Promise<ApiActivity> {
  return apiFetch<{ activity: ApiActivity }>(`/api/activities/${id}`, jsonInit("PATCH", data)).then((d) => d.activity);
}

export function deleteActivity(id: string): Promise<void> {
  return apiFetch<void>(`/api/activities/${id}`, { method: "DELETE" });
}

export function fetchWordLists(): Promise<ApiWordListSummary[]> {
  return apiFetch<{ wordLists: ApiWordListSummary[] }>("/api/word-lists").then((d) => d.wordLists);
}

export function fetchWordList(id: string): Promise<ApiWordList> {
  return apiFetch<{ wordList: ApiWordList }>(`/api/word-lists/${id}`).then((d) => d.wordList);
}

export function createWordList(name: string): Promise<ApiWordList> {
  return apiFetch<{ wordList: ApiWordList }>("/api/word-lists", jsonInit("POST", { name })).then((d) => d.wordList);
}

export function renameWordList(id: string, name: string): Promise<ApiWordList> {
  return apiFetch<{ wordList: ApiWordList }>(`/api/word-lists/${id}`, jsonInit("PATCH", { name })).then(
    (d) => d.wordList,
  );
}

export function deleteWordList(id: string): Promise<void> {
  return apiFetch<void>(`/api/word-lists/${id}`, { method: "DELETE" });
}

export function addWord(wordListId: string, text: string, phonemes: string[]): Promise<ApiWord> {
  return apiFetch<{ word: ApiWord }>(`/api/word-lists/${wordListId}/words`, jsonInit("POST", { text, phonemes })).then(
    (d) => d.word,
  );
}

export function updateWord(id: string, data: { text?: string; phonemes?: string[] }): Promise<ApiWord> {
  return apiFetch<{ word: ApiWord }>(`/api/words/${id}`, jsonInit("PATCH", data)).then((d) => d.word);
}

export function deleteWord(id: string): Promise<void> {
  return apiFetch<void>(`/api/words/${id}`, { method: "DELETE" });
}

export function fetchPhonemes(): Promise<ApiPhoneme[]> {
  return apiFetch<{ phonemes: ApiPhoneme[] }>("/api/phonemes").then((d) => d.phonemes);
}

// Ordered phoneme symbols for a word, as fetched from the API (position is
// not guaranteed to arrive in order — the route sorts it, but sorting again
// here means callers never depend on that implicitly).
export function orderedPhonemes(word: ApiWord): string[] {
  return [...word.phonemes].sort((a, b) => a.position - b.position).map((p) => p.phonemeSymbol);
}
