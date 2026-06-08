import { test, expect } from "@playwright/test"

test.describe("home page", () => {
  test("renders the hero and applies the Mulish font", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Victor Fernandes/)
    await expect(page.getByRole("heading", { level: 1, name: /Victor Fernandes/i })).toBeVisible()

    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(fontFamily).toContain("Mulish")
  })

  test("does not leak the screen-reader-only external link hint into the layout", async ({ page }) => {
    await page.goto("/")

    const hints = page.getByText("(opens in a new tab)")
    const count = await hints.count()
    expect(count).toBeGreaterThan(0) // present for assistive tech

    for (let i = 0; i < count; i += 1) {
      const box = await hints.nth(i).boundingBox()
      // sr-only collapses the element to a 1px clip rect.
      expect(box?.width ?? 0).toBeLessThanOrEqual(2)
    }
  })
})

test.describe("off-canvas menu", () => {
  test("starts off-screen, opens from the right, and closes again", async ({ page }) => {
    await page.goto("/")
    // Located by attribute (not role): when closed the panel is `aria-hidden`
    // + `inert`, so it is intentionally absent from the accessibility tree.
    const menu = page.locator('aside[aria-label="Site menu"]')

    // Hidden: translated fully to the right of the viewport.
    const viewport = page.viewportSize()!
    const closedBox = await menu.boundingBox()
    expect(closedBox!.x).toBeGreaterThanOrEqual(viewport.width - 1)

    await page.getByRole("button", { name: /toggle navigation/i }).click()
    await expect(menu).toHaveClass(/translate-x-0/)
    await page.waitForTimeout(600) // let the 500ms slide-in settle
    const openBox = await menu.boundingBox()
    expect(openBox!.x).toBeLessThan(viewport.width)

    await page.getByRole("button", { name: "Close menu" }).click()
    await expect(menu).toHaveClass(/translate-x-full/)
  })
})

test.describe("theme toggle", () => {
  test("toggles dark mode and persists the choice across reloads", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("button", { name: /toggle navigation/i }).click()

    await page.getByRole("button", { name: /switch to dark theme/i }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator("html")).toHaveClass(/dark/)
  })
})
