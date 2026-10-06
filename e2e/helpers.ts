import { expect, type APIRequestContext } from "@playwright/test";

export const TEST_PREFIX = "E2E ";

// Deleting by name prefix also sweeps up rows left behind by an earlier
// run that crashed before its own cleanup could happen.
export async function removeTestData(request: APIRequestContext) {
  const { activities } = await (await request.get("/api/activities")).json();
  for (const activity of activities) {
    if (activity.name.startsWith(TEST_PREFIX)) await request.delete(`/api/activities/${activity.id}`);
  }

  const { wordLists } = await (await request.get("/api/word-lists")).json();
  for (const list of wordLists) {
    if (list.name.startsWith(TEST_PREFIX)) await request.delete(`/api/word-lists/${list.id}`);
  }
}

export const PLAYABLE_WORDS = [
  { text: "bed", phonemes: ["b", "e", "d"] },
  { text: "deck", phonemes: ["d", "e", "k"] },
  { text: "said", phonemes: ["s", "e", "d"] },
];

export const WORDLE_ROWS = 6;
export const SEARCH_SIZE = 8;

// Every word has three phonemes so the Wordle activity always has a valid
// target, and the candidates are few enough to be guessed within the row limit.
export async function createPlayableActivities(request: APIRequestContext) {
  const runId = Date.now().toString(36);
  const post = async (path: string, data: object) => {
    const response = await request.post(path, { data });
    expect(response.ok(), `POST ${path}`).toBeTruthy();
    return response.json();
  };

  const { wordList } = await post("/api/word-lists", { name: `${TEST_PREFIX}play list ${runId}` });
  for (const word of PLAYABLE_WORDS) await post(`/api/word-lists/${wordList.id}/words`, word);

  const wordleName = `${TEST_PREFIX}wordle ${runId}`;
  const searchName = `${TEST_PREFIX}search ${runId}`;
  await post("/api/activities", {
    name: wordleName,
    type: "WORDLE",
    wordListId: wordList.id,
    difficulty: 3,
    maxGuesses: WORDLE_ROWS,
  });
  await post("/api/activities", {
    name: searchName,
    type: "WORD_SEARCH",
    wordListId: wordList.id,
    gridRows: SEARCH_SIZE,
    gridCols: SEARCH_SIZE,
  });

  return { wordleName, searchName };
}
