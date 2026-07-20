import { defineConfig, devices } from "@playwright/test"

// Not 4321: that's `astro dev`'s default port, and `reuseExistingServer` must
// never silently point the suite at a dev server instead of the built site.
const PORT = 4322
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Structural diagram snapshots hide text before capture, so their pixels are
  // platform-independent. Omit the OS suffix so macOS authors and Linux CI verify
  // the same committed baseline rather than maintaining duplicate goldens.
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Serve the production build (`dist/` is plain static output since ADR 0006
  // dropped the Cloudflare adapter): tests exercise exactly what deploys, with
  // none of the dev server's on-demand compiles or mid-test full reloads. The
  // `e2e` turbo task depends on `build`, so `pnpm e2e` keeps dist fresh.
  webServer: {
    command: `pnpm run preview --port ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
