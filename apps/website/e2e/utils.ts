import { expect, type Page } from "@playwright/test"

/**
 * Wait until every Astro island on the page has hydrated. Astro removes the
 * `ssr` attribute from `<astro-island>` once the component mounts, so an empty
 * match is a deterministic "the page is interactive" signal. The server-rendered
 * markup (nav, hint chip, keycap badges) looks ready long before React attaches
 * its listeners, so tests that dispatch keyboard or pointer events must wait for
 * this instead of relying on visible content.
 */
export const waitForHydration = async (page: Page) => {
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0)
}

/** `page.goto` + {@link waitForHydration}: land on a fully interactive page. */
export const gotoHydrated = async (page: Page, path: string) => {
  await page.goto(path)
  await waitForHydration(page)
}
