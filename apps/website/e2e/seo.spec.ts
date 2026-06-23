import { test, expect, type Page } from "@playwright/test"

// Page-behavioural, like the rest of the suite: assert the documents expose the right SEO
// signals (status, robots, social images, JSON-LD) without coupling to any post's prose.

const metaContent = (page: Page, selector: string) => page.locator(selector).first().getAttribute("content")

test.describe("404 page", () => {
  test("returns a 404 with navigation back into the site and a noindex directive", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist")
    expect(response?.status()).toBe(404)

    await expect(page.getByRole("heading", { level: 1, name: /not found/i })).toBeVisible()
    await expect(page.getByRole("link", { name: "Back home" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Read the blog" })).toBeVisible()

    expect(await metaContent(page, 'meta[name="robots"]')).toBe("noindex,follow")
  })
})

test.describe("indexing directives", () => {
  test("noindexes the thin taxonomy index listing but leaves the per-term archive indexable", async ({ page }) => {
    await page.goto("/blog/categories")
    expect(await metaContent(page, 'meta[name="robots"]')).toBe("noindex,follow")

    // Drill into a real category archive (no hardcoded slug); it should stay indexable.
    await page.locator('a[href^="/blog/categories/"]').first().click()
    await expect(page).toHaveURL(/\/blog\/categories\/.+/)
    expect(await page.locator('meta[name="robots"]').count()).toBe(0)
  })
})

test.describe("social previews + structured data", () => {
  test("home exposes absolute OG/Twitter images and Person/WebSite JSON-LD", async ({ page }) => {
    await page.goto("/")

    expect(await metaContent(page, 'meta[property="og:image"]')).toMatch(/^https:\/\//)
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toMatch(/^https:\/\//)
    expect(await metaContent(page, 'meta[name="twitter:card"]')).toBe("summary_large_image")

    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(ld).toContain("WebSite")
    expect(ld).toContain("Person")
  })

  test("a blog post exposes an article-typed image and BlogPosting JSON-LD", async ({ page }) => {
    await page.goto("/blog")
    await page.locator("article h2 a").first().click()
    await expect(page).toHaveURL(/\/blog\/.+/)

    expect(await metaContent(page, 'meta[property="og:type"]')).toBe("article")
    expect(await metaContent(page, 'meta[property="og:image"]')).toMatch(/^https:\/\//)

    const ld = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(ld).toContain("BlogPosting")
  })
})
