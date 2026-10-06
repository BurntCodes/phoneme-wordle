import type { APIRequestContext } from "@playwright/test";

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
