import { defineConfig, devices } from "@playwright/test"

const PORT = 4321
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The Cloudflare adapter does not support `astro preview`, so drive the dev
  // server. Playwright builds nothing; it just waits for the server to be ready.
  webServer: {
    command: `pnpm run dev --port ${PORT} --force`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
