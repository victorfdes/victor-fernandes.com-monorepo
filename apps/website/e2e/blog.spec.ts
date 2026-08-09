import { test, expect } from "@playwright/test"

// These tests assert the blog *pages* behave, not what any particular post says.
// They navigate via the first available link, so adding/removing/renaming posts
// never breaks them. Specific prose lives in unit tests, not here.
test.describe("blog index", () => {
  test("lists posts with a featured image and a computed reading time", async ({ page }) => {
    await page.goto("/blog")
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible()

    const firstCard = page.locator("article").first()
    await expect(firstCard).toBeVisible()

    // Featured image renders (the bug this guards): present, visible, and served from the build
    // output rather than resized per request — no `/cdn-cgi/image/` transform URLs anywhere.
    const image = firstCard.locator("img").first()
    await expect(image).toBeVisible()
    await expect(image).toHaveAttribute("src", /^\/_astro\/.+\.webp$/)
    await expect(image).toHaveAttribute("srcset", /\/_astro\/.+\.webp 240w/)
    await expect(image).not.toHaveAttribute("srcset", /cdn-cgi\/image/)
    // Cards must not pull the wide hero candidates.
    await expect(image).not.toHaveAttribute("srcset", /\s640w/)

    // Reading time is computed, not a hardcoded placeholder.
    await expect(page.getByText(/\d+ min read/).first()).toBeVisible()
  })

  test("uses the available desktop width instead of leaving a sparse two-column row", async ({ page }) => {
    await page.setViewportSize({ width: 1188, height: 900 })
    await page.goto("/blog")

    const cards = page.locator("article")
    expect(await cards.count()).toBeGreaterThan(2)

    const firstCardBox = await cards.first().boundingBox()
    const secondCardBox = await cards.nth(1).boundingBox()
    const thirdCardBox = await cards.nth(2).boundingBox()

    expect(firstCardBox).not.toBeNull()
    expect(secondCardBox).not.toBeNull()
    expect(thirdCardBox).not.toBeNull()
    if (!firstCardBox || !secondCardBox || !thirdCardBox) {
      throw new Error("Blog cards should be measurable on desktop")
    }

    expect(firstCardBox.width).toBeGreaterThan(340)
    expect(secondCardBox.width).toBeGreaterThan(340)
    expect(thirdCardBox.width).toBeGreaterThan(340)
    expect(Math.abs(firstCardBox.y - secondCardBox.y)).toBeLessThanOrEqual(2)
    expect(Math.abs(firstCardBox.y - thirdCardBox.y)).toBeLessThanOrEqual(2)
    expect(secondCardBox.x).toBeGreaterThan(firstCardBox.x)
    expect(thirdCardBox.x).toBeGreaterThan(secondCardBox.x)
  })

  test("navigates into a post that renders its hero, TOC, and content", async ({ page }) => {
    await page.goto("/blog")
    await page.locator("article h2 a").first().click()

    await expect(page).toHaveURL(/\/blog\/.+/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible()

    const hero = page.locator("article img").first()
    await expect(hero).toBeVisible()
    await expect(hero).toHaveAttribute("src", /^\/_astro\/.+\.webp$/)

    // The preload must request the exact same candidate set as the <img>, or the LCP image is
    // downloaded twice.
    const preload = page.locator('link[rel="preload"][as="image"]')
    await expect(preload).toHaveAttribute("imagesrcset", (await hero.getAttribute("srcset")) ?? "")

    await expect(page.getByRole("navigation", { name: /article sections/i }).first()).toBeVisible()
  })
})

test.describe("blog taxonomy", () => {
  test("tags index resolves through to a tag page listing posts", async ({ page }) => {
    await page.goto("/blog/tags")
    await expect(page.getByRole("heading", { level: 1, name: "Tags" })).toBeVisible()

    // Scope to taxonomy links (not the site-nav menu) without hardcoding a slug.
    await page.locator('a[href^="/blog/tags/"]').first().click()
    await expect(page).toHaveURL(/\/blog\/tags\/.+/)
    await expect(page.getByRole("heading", { level: 1, name: /^Tag:/ })).toBeVisible()
    await expect(page.locator("article").first()).toBeVisible()
  })

  test("categories index resolves through to a category page listing posts", async ({ page }) => {
    await page.goto("/blog/categories")
    await expect(page.getByRole("heading", { level: 1, name: "Categories" })).toBeVisible()

    // Scope to taxonomy links (not the site-nav menu) without hardcoding a slug.
    await page.locator('a[href^="/blog/categories/"]').first().click()
    await expect(page).toHaveURL(/\/blog\/categories\/.+/)
    await expect(page.getByRole("heading", { level: 1, name: /^Category:/ })).toBeVisible()
    await expect(page.locator("article").first()).toBeVisible()
  })
})
