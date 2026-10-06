import { test, expect, type Locator, type Page } from "@playwright/test";
import { createPlayableActivities, getStats, removeTestData, TEST_PREFIX } from "./helpers";

test.beforeEach(async ({ request }) => removeTestData(request));
test.afterEach(async ({ request }) => removeTestData(request));

function metric(page: Page, label: string): Locator {
  return page.locator("dt", { hasText: label }).locator("xpath=following-sibling::dd").locator("span").first();
}

test("both health endpoints report the database as up", async ({ request }) => {
  for (const path of ["/health", "/api/health"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", database: "up" });
  }
});

test("dashboard figures match the statistics API", async ({ page, request }) => {
  const stats = await getStats(request);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard", level: 2 })).toBeVisible();
  await expect(page.getByText("System healthy — database connected")).toBeVisible();

  await expect(metric(page, "Total generated outputs")).toHaveText(String(stats.generation.total));
  await expect(metric(page, "Successful generations")).toHaveText(String(stats.generation.successful));
  await expect(metric(page, "Failed generations")).toHaveText(String(stats.generation.failed));
  await expect(metric(page, "Activities created")).toHaveText(String(stats.totals.activities));
});

test("generating a Wordle activity is recorded and shown on the dashboard", async ({ page, request }) => {
  const { wordleName } = await createPlayableActivities(request);
  const before = (await getStats(request)).generation.successful;

  await page.goto("/wordle");
  await page.getByRole("button", { name: wordleName }).click();
  await expect(page.locator(".pwe-grid .pwe-row").first()).toBeVisible();
  await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Generate HTML" }).click()]);

  // One event for building the puzzle and one for exporting it.
  await expect
    .poll(async () => (await getStats(request)).generation.successful)
    .toBeGreaterThanOrEqual(before + 2);

  const after = await getStats(request);
  await page.goto("/dashboard");
  await expect(metric(page, "Successful generations")).toHaveText(String(after.generation.successful));
});

test("time spent on a page is recorded when the player moves on", async ({ page, request }) => {
  const before = (await getStats(request)).pageViews.total;

  await page.goto("/about");
  await page.waitForTimeout(1200);
  await page.goto("/");

  await expect.poll(async () => (await getStats(request)).pageViews.total).toBeGreaterThan(before);
  expect((await getStats(request)).pageViews.averageDurationMs).toBeGreaterThan(0);
});

test("an unplayable Wordle activity fails visibly, is counted, and raises a warning", async ({ page, request }) => {
  const { wordListId } = await createPlayableActivities(request);
  const unplayableName = `${TEST_PREFIX}unplayable`;
  const created = await request.post("/api/activities", {
    data: { name: unplayableName, type: "WORDLE", wordListId, difficulty: 9, maxGuesses: 6 },
  });
  expect(created.ok()).toBeTruthy();
  const failedBefore = (await getStats(request)).generation.failed;

  await page.goto("/wordle");
  await page.getByRole("button", { name: unplayableName }).click();
  await expect(page.getByRole("alert").filter({ hasText: "No words with 9 phonemes" })).toBeVisible();

  await expect
    .poll(async () => (await getStats(request)).generation.failed)
    .toBeGreaterThanOrEqual(failedBefore + 1);

  await page.goto("/dashboard");
  const alerts = page.getByRole("region", { name: "Alerts" });
  await expect(alerts).toContainText("Wordle activities with no word matching their phoneme count");
  await expect(alerts).toContainText(unplayableName);
  await expect(page.getByRole("region", { name: "Recent failures" })).toContainText("No words with 9 phonemes");
});

test("dashboard warns about a word list with no words", async ({ page, request }) => {
  const emptyName = `${TEST_PREFIX}empty list`;
  const created = await request.post("/api/word-lists", { data: { name: emptyName } });
  expect(created.ok()).toBeTruthy();

  await page.goto("/dashboard");
  const alerts = page.getByRole("region", { name: "Alerts" });
  await expect(alerts).toContainText("Word lists with no words");
  await expect(alerts).toContainText(emptyName);
});
