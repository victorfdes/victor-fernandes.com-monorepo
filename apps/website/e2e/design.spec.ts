import { expect, test } from "@playwright/test"
import { gotoHydrated } from "./utils"

// The design page is the only surface rendering every token and class at once, so these
// assertions are the guard against a class silently disappearing from the stylesheet — a
// specimen that renders nothing still looks plausible on a pale page.
test.describe("design system page", () => {
  test("renders a filled swatch for every colour token", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const swatches = page.locator('section[aria-labelledby="tokens"] li span[aria-hidden="true"]')
    const count = await swatches.count()
    expect(count).toBeGreaterThan(10)

    // A token whose utility was never generated paints transparent; every swatch must resolve
    // to a real colour.
    for (let index = 0; index < count; index += 1) {
      const background = await swatches.nth(index).evaluate((el) => globalThis.getComputedStyle(el).backgroundColor)
      expect(background).not.toBe("rgba(0, 0, 0, 0)")
    }
  })

  test("renders the pill shapes SmartButton composes from", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const marks = page.locator('section[aria-labelledby="marks"]')
    await expect(marks.locator(".pill").first()).toBeVisible()
    await expect(marks.locator(".pill-accent")).toBeVisible()
    await expect(marks.locator(".icon-pill")).toBeVisible()
    await expect(marks.locator(".stat-ring")).toBeVisible()

    // The button and the hand-styled pill must share one definition, so their radius matches.
    const radiusOf = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((el) => globalThis.getComputedStyle(el).borderRadius)
    expect(await radiusOf('section[aria-labelledby="actions"] button')).toBe(await radiusOf(".pill"))
  })

  test("keeps both themes legible from one set of tokens", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const inkOf = () => page.evaluate(() => globalThis.getComputedStyle(document.body).color)
    const light = await inkOf()

    await page.evaluate(() => document.documentElement.classList.add("dark"))
    const dark = await inkOf()

    // One class on <html> is the whole switch: no rule is written twice.
    expect(dark).not.toBe(light)
  })
})
