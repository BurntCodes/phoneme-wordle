import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3100";
const EXTERNAL_URL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  // Tests create and delete real rows and read global dashboard counters, so
  // running them in parallel against one database would make them interfere.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: EXTERNAL_URL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: EXTERNAL_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: `http://localhost:${PORT}/health`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
