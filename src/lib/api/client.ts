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

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export function fetchActivities(type: "WORDLE" | "WORD_SEARCH"): Promise<ApiActivity[]> {
  return apiFetch<{ activities: ApiActivity[] }>(`/api/activities?type=${type}`).then((d) => d.activities);
}

export function fetchActivity(id: string): Promise<ApiActivity> {
  return apiFetch<{ activity: ApiActivity }>(`/api/activities/${id}`).then((d) => d.activity);
}

export function fetchWordList(id: string): Promise<ApiWordList> {
  return apiFetch<{ wordList: ApiWordList }>(`/api/word-lists/${id}`).then((d) => d.wordList);
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
