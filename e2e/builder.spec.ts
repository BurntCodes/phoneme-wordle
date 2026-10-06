import { test, expect } from "@playwright/test";
import { removeTestData, TEST_PREFIX } from "./helpers";

test.beforeEach(async ({ request }) => removeTestData(request));
test.afterEach(async ({ request }) => removeTestData(request));

test("teacher builds a word list and a Wordle activity, then edits and deletes them", async ({ page }) => {
  const runId = Date.now().toString(36);
  const listName = `${TEST_PREFIX}list ${runId}`;
  const renamedList = `${listName} renamed`;
  const activityName = `${TEST_PREFIX}activity ${runId}`;

  page.on("dialog", (dialog) => dialog.accept());

  const listRow = (name: string) =>
    page.getByRole("listitem").filter({ has: page.getByRole("button", { name }) });
  const activityRow = () => page.getByRole("listitem").filter({ hasText: activityName });

  await page.goto("/manage");

  await test.step("create a word list", async () => {
    await page.getByPlaceholder("New word list name").fill(listName);
    await page.getByRole("button", { name: "Create list" }).click();
    await expect(listRow(listName)).toContainText("(0 words, 0 activities)");
  });

  await test.step("add a word built from phonemes", async () => {
    await listRow(listName).getByRole("button", { name: listName }).click();
    await page.getByPlaceholder("Word", { exact: true }).fill("bed");
    for (const symbol of ["b", "e", "d"]) {
      await page.getByRole("button", { name: symbol, exact: true }).click();
    }
    await page.getByRole("button", { name: "Add word" }).click();

    await expect(listRow(listName)).toContainText("bed");
    await expect(listRow(listName)).toContainText("/b e d/");
    await expect(listRow(listName)).toContainText("(1 words, 0 activities)");
  });

  await test.step("edit the word's text and phonemes", async () => {
    await listRow(listName).getByRole("button", { name: "Edit" }).click();
    const editRow = listRow(listName)
      .getByRole("listitem")
      .filter({ has: page.getByRole("button", { name: "Save" }) });
    await editRow.locator("input").fill("beds");
    await editRow.getByRole("button", { name: "z", exact: true }).click();
    await editRow.getByRole("button", { name: "Save" }).click();

    await expect(listRow(listName)).toContainText("beds");
    await expect(listRow(listName)).toContainText("/b e d z/");
  });

  await test.step("rename the word list", async () => {
    await listRow(listName).getByRole("button", { name: "Rename" }).click();
    // The row's name button is swapped for an input while renaming, so the
    // row is found by its Cancel button instead.
    const renameRow = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Cancel" }) });
    await renameRow.locator("input").first().fill(renamedList);
    await renameRow.getByRole("button", { name: "Save" }).click();

    await expect(listRow(renamedList)).toBeVisible();
  });

  await test.step("create a Wordle activity on that list", async () => {
    await page.getByRole("tab", { name: "Activities" }).click();
    await page.getByPlaceholder("Activity name").fill(activityName);
    await page.getByRole("combobox").nth(1).selectOption({ label: renamedList });
    await page.getByLabel("Difficulty (phonemes)").fill("4");
    await page.getByLabel("Max guesses").fill("5");
    await page.getByLabel("Hints enabled").check();
    await page.getByRole("button", { name: "Create activity" }).click();

    await expect(activityRow()).toContainText(`Wordle · 4 phonemes · 5 guesses · ${renamedList}`);
  });

  await test.step("edit the activity's settings", async () => {
    await activityRow().getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("Max guesses").fill("7");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(activityRow()).toContainText("7 guesses");
  });

  await test.step("delete the activity", async () => {
    await activityRow().getByRole("button", { name: "Delete" }).click();
    await expect(activityRow()).toHaveCount(0);
  });

  await test.step("delete the word, then the list", async () => {
    await page.getByRole("tab", { name: "Word Lists" }).click();
    await listRow(renamedList).getByRole("button", { name: renamedList }).click();
    const wordRow = listRow(renamedList).getByRole("listitem").filter({ hasText: "beds" });
    await wordRow.getByRole("button", { name: "Delete" }).click();
    await expect(listRow(renamedList)).toContainText("(0 words, 0 activities)");
    await expect(listRow(renamedList)).toContainText("No words yet.");

    await listRow(renamedList).getByRole("button", { name: "Delete" }).click();
    await expect(listRow(renamedList)).toHaveCount(0);
  });
});
