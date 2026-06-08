import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

// Runtime accessibility gate. Static `jsx-a11y`/`astro` lint catches markup issues;
// this asserts the rendered, hydrated pages have no serious/critical WCAG violations.
const ROUTES = ["/", "/resume", "/blog", "/blog/tags", "/blog/categories", "/contact", "/privacy"]

const scan = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()

  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical")

  // Surface a readable summary in the failure message.
  return blocking.map((v) => `${v.id}: ${v.help}`)
}

test.describe("accessibility (axe-core)", () => {
  for (const route of ROUTES) {
    test(`${route} has no serious or critical violations`, async ({ page }) => {
      await page.goto(route)
      expect(await scan(page)).toEqual([])
    })
  }

  // Post pages are dynamic; reach one via the index so the slug isn't hardcoded.
  // Covers the featured-image hero markup and the rendered prose.
  test("a blog post has no serious or critical violations", async ({ page }) => {
    await page.goto("/blog")
    await page.locator("article h2 a").first().click()
    await expect(page).toHaveURL(/\/blog\/.+/)
    expect(await scan(page)).toEqual([])
  })
})
