import { test, expect } from "@playwright/test"

// Regression guard for the gtag bootstrap in Layout.astro. gtag.js only treats a
// dataLayer entry as a command when it is the native `arguments` object; a plain
// array (e.g. produced by a `(...args)` rest param) is silently ignored, so every
// js/consent/config/event call is dropped and GA never fires. The first dataLayer
// entry is our synchronous `gtag("js", …)` call, pushed before the async gtag.js
// loader can touch the queue, so it is a deterministic probe.
//
// Only runs where analytics is configured (a measurement id is present); in CI the
// id is unset, the bootstrap script isn't emitted, and the test skips.
test.describe("analytics bootstrap", () => {
  test("pushes gtag commands as arguments objects, not arrays", async ({ page }) => {
    await page.goto("/")

    const configured = await page.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag === "function")
    test.skip(!configured, "analytics not configured (no PUBLIC_GA_MEASUREMENT_ID) in this environment")

    const firstEntryType = await page.evaluate(() => {
      const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer
      return Object.prototype.toString.call(dataLayer?.[0])
    })

    // "[object Array]" here means the bug has regressed.
    expect(firstEntryType).toBe("[object Arguments]")
  })
})
