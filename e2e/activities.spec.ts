import { readFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import {
  createPlayableActivities,
  PLAYABLE_WORDS,
  removeTestData,
  SEARCH_SIZE,
  WORDLE_ROWS,
} from "./helpers";

let wordleName: string;
let searchName: string;

test.beforeEach(async ({ request }) => {
  await removeTestData(request);
  ({ wordleName, searchName } = await createPlayableActivities(request));
});
test.afterEach(async ({ request }) => removeTestData(request));

async function openWordle(page: Page) {
  await page.goto("/wordle");
  await page.getByRole("button", { name: wordleName }).click();
  await expect(page.locator(".pwe-grid .pwe-row")).toHaveCount(WORDLE_ROWS);
}

async function openWordSearch(page: Page) {
  await page.goto("/word-search");
  await page.getByRole("button", { name: searchName }).click();
  const grid = page.getByRole("grid", { name: "Word search puzzle grid" });
  await expect(grid.getByRole("gridcell")).toHaveCount(SEARCH_SIZE * SEARCH_SIZE);
  return grid;
}

async function downloadGeneratedHtml(page: Page, filename: string) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Generate HTML" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(filename);
  return readFile(await download.path(), "utf8");
}

test("player guesses the Wordle word and wins", async ({ page }) => {
  await openWordle(page);
  const message = page.locator(".pwe-message");
  const grid = page.locator(".pwe-grid");

  let winningRow = -1;
  for (const [index, word] of PLAYABLE_WORDS.entries()) {
    for (const symbol of word.phonemes) {
      await page.locator(`.pwe-key[aria-label^="${symbol},"]`).click();
    }
    await page.getByRole("button", { name: "Submit" }).click();
    if (/Correct!/.test(await message.innerText())) {
      winningRow = index;
      break;
    }
  }

  expect(winningRow).toBeGreaterThanOrEqual(0);
  await expect(message).toHaveText(/Correct! The word was (bed|deck|said)\./);
  await expect(grid.locator(".pwe-row").nth(winningRow).locator(".pwe-correct")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
});

test("Wordle rejects an incomplete guess", async ({ page }) => {
  await openWordle(page);

  await page.locator('.pwe-key[aria-label^="b,"]').click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.locator(".pwe-message")).toHaveText("Not enough phonemes yet.");
  await expect(page.locator(".pwe-grid .pwe-row").first().locator(".pwe-cell.pwe-filled")).toHaveCount(1);
});

test("generated Wordle HTML is a standalone playable file", async ({ page }) => {
  await openWordle(page);
  const html = await downloadGeneratedHtml(page, "phoneme-wordle.html");

  expect(html).toContain("PhonemeWordleEngine.mount");
  expect(PLAYABLE_WORDS.some((word) => html.includes(`"word":"${word.text}"`))).toBe(true);

  const standalone = await page.context().newPage();
  await standalone.setContent(html);
  await expect(standalone.locator(".pwe-grid .pwe-row")).toHaveCount(WORDLE_ROWS);
  await expect(standalone.locator(".pwe-key").first()).toBeVisible();
});

test("Word Search shows a full grid and a fresh puzzle on request", async ({ page }) => {
  const grid = await openWordSearch(page);
  await expect(grid.getByRole("row")).toHaveCount(SEARCH_SIZE);

  await page.getByRole("button", { name: "New Puzzle" }).click();
  await expect(grid.getByRole("gridcell")).toHaveCount(SEARCH_SIZE * SEARCH_SIZE);
});

test("generated Word Search HTML is a standalone puzzle", async ({ page }) => {
  await openWordSearch(page);
  const html = await downloadGeneratedHtml(page, "phoneme-word-search.html");

  expect(html).toContain("PhonemeWordSearchEngine.mount");

  const standalone = await page.context().newPage();
  await standalone.setContent(html);
  await expect(standalone.getByRole("grid").getByRole("gridcell")).toHaveCount(SEARCH_SIZE * SEARCH_SIZE);
});
