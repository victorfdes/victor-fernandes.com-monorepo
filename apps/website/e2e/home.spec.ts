import { test, expect } from "@playwright/test"
import { gotoHydrated } from "./utils"

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

  test("renders the two-column footer content", async ({ page }) => {
    await page.goto("/")

    const footer = page.getByRole("contentinfo")
    await expect(footer.getByRole("img", { name: "Victor Fernandes - Logo" })).toBeVisible()
    await expect(footer.getByRole("navigation", { name: "Footer navigation" })).toBeVisible()

    for (const linkName of ["Blog", "Resume", "Contact"]) {
      await expect(footer.getByRole("link", { name: linkName })).toBeVisible()
    }

    await expect(footer.getByRole("heading", { name: /Looking to scale your app/i })).toBeVisible()
    await expect(footer.getByRole("link", { name: /Let's Talk/i })).toHaveAttribute("href", "/contact")

    await expect(footer.getByRole("heading", { name: /Ask AI about Victor/i })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Ask ChatGPT about Victor Fernandes" })).toHaveAttribute(
      "href",
      /^https:\/\/chatgpt\.com\/\?q=/
    )

    await expect(footer.getByRole("heading", { name: /Loads like a rocket/i })).toBeVisible()
    await expect(footer.getByRole("link", { name: /Lighthouse/ })).toBeVisible()
    await expect(footer.getByRole("link", { name: /OpenSSF Scorecard/ })).toHaveAttribute(
      "href",
      "https://scorecard.dev/viewer/?uri=github.com/victorfdes/victor-fernandes.com-monorepo"
    )
    const scorecardDial = footer.getByLabel(/OpenSSF Scorecard score \d{1,2}\.\d/)
    await expect(scorecardDial).toBeVisible()
    await expect(scorecardDial).toContainText(/\d{1,2}\.\d/)

    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy")
    await expect(footer.getByRole("link", { name: /LinkedIn profile/i })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/vicfdes"
    )
  })

  test("places footer sections responsively", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/")

    const footer = page.getByRole("contentinfo")
    const brandSection = footer.locator('section[aria-labelledby="footer-brand"]')
    const statusPanel = footer.locator('section[aria-labelledby="footer-system-status"]')
    const desktopBrandBox = await brandSection.boundingBox()
    const desktopStatusBox = await statusPanel.boundingBox()

    expect(desktopBrandBox).not.toBeNull()
    expect(desktopStatusBox).not.toBeNull()
    if (!desktopBrandBox || !desktopStatusBox) {
      throw new Error("Footer sections should be measurable on desktop")
    }

    expect(desktopStatusBox.x).toBeGreaterThan(desktopBrandBox.x)

    const statusCells = footer.getByTestId("footer-status-cell")
    await expect(statusCells).toHaveCount(4)
    const desktopCellBoxes = await Promise.all(
      [0, 1, 2, 3].map(async (index) => {
        const box = await statusCells.nth(index).boundingBox()
        expect(box).not.toBeNull()
        if (!box) {
          throw new Error(`Footer status cell ${index} should be measurable on desktop`)
        }
        return box
      })
    )
    const [topLeftCell, topRightCell, bottomLeftCell, bottomRightCell] = desktopCellBoxes

    if (!topLeftCell || !topRightCell || !bottomLeftCell || !bottomRightCell) {
      throw new Error("Footer status cells should form four measurable desktop quadrants")
    }

    expect(Math.abs(topLeftCell.width - topRightCell.width)).toBeLessThanOrEqual(2)
    expect(Math.abs(bottomLeftCell.width - bottomRightCell.width)).toBeLessThanOrEqual(2)
    expect(Math.abs(topLeftCell.height - bottomLeftCell.height)).toBeLessThanOrEqual(2)
    expect(Math.abs(topRightCell.height - bottomRightCell.height)).toBeLessThanOrEqual(2)

    await page.setViewportSize({ width: 390, height: 900 })
    await page.reload()

    const mobileBrandBox = await brandSection.boundingBox()
    const mobileStatusBox = await statusPanel.boundingBox()

    expect(mobileBrandBox).not.toBeNull()
    expect(mobileStatusBox).not.toBeNull()
    if (!mobileBrandBox || !mobileStatusBox) {
      throw new Error("Footer sections should be measurable on mobile")
    }

    expect(mobileStatusBox.y).toBeGreaterThan(mobileBrandBox.y)
  })
})

test.describe("off-canvas menu", () => {
  test("starts off-screen, opens from the right, and closes again", async ({ page }) => {
    // Hydration-gated: the toggle-navigation button is React-driven, so a click
    // before hydration is swallowed and the menu never slides in.
    await gotoHydrated(page, "/")
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
    // Hydration-gated: a pre-hydration click on the React menu button is
    // silently swallowed, the off-canvas never opens, and the theme switch
    // stays hidden from the role query until the 30s timeout.
    await gotoHydrated(page, "/")
    await page.getByRole("button", { name: /toggle navigation/i }).click()

    await page.getByRole("button", { name: /switch to dark theme/i }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator("html")).toHaveClass(/dark/)
  })
})

test.describe("numbered nav shortcuts", () => {
  test("shows the shortcut badges without any key press, and no modifier hint", async ({ page }) => {
    await page.goto("/")

    // The badges are server-rendered and never revealed by JS, so they must be
    // there before hydration — no gotoHydrated, on purpose.
    const firstShortcut = page.getByRole("navigation", { name: "Main" }).locator(".kbd-key").first()
    await expect(firstShortcut).toBeVisible()
    await expect(firstShortcut).toContainText("Alt1")

    // The "hold Alt to reveal" hint chip is gone: nothing left to reveal.
    await expect(page.locator('[aria-label*="reveal keyboard shortcuts"]')).toHaveCount(0)
  })

  test("uses the Option symbol for the visible modifier on Mac", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, "userAgent", {
        get: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      })
    })
    await page.goto("/")

    // The head script tags <html> before paint; CSS then shows the ⌥ icon and hides
    // the "Alt" text, so the swap costs no re-render and no layout shift.
    await expect(page.locator("html")).toHaveClass(/shortcut-modifier-option/)

    const firstShortcut = page.getByRole("navigation", { name: "Main" }).locator(".kbd-key").first()
    await expect(firstShortcut.locator("[data-testid='shortcut-modifier-option-icon']")).toBeVisible()
    await expect(firstShortcut.locator("[data-shortcut-modifier-label]")).toBeHidden()
  })

  test("Alt+digit navigates to its section", async ({ page }) => {
    // gotoHydrated guarantees the island's global keydown listener is attached
    // before the (single) keypress, so no retry loop is needed.
    await gotoHydrated(page, "/")
    await page.keyboard.press("Alt+2") // Alt+2 == Blog (see utils/nav PRIMARY_NAV)
    await expect(page).toHaveURL(/\/blog\/?$/)
  })

  test("a bare digit does not navigate (WCAG 2.1.4)", async ({ page }) => {
    // Wait for hydration so we know the listener is attached, then confirm a modifier-less
    // digit is inert — the guarantee the Alt requirement exists to provide. (A bare
    // `waitFor` on the nav would match the server-rendered markup and prove nothing.)
    await gotoHydrated(page, "/")
    await page.keyboard.press("2")
    await expect(page).toHaveURL(/\/$/)
  })

  test("marks the current page in the top nav", async ({ page }) => {
    await page.goto("/blog")
    const mainNav = page.getByRole("navigation", { name: "Main" })
    await expect(mainNav.getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page")
    await expect(mainNav.getByRole("link", { name: "Resume" })).not.toHaveAttribute("aria-current")
  })

  test("stays inert while typing in a field", async ({ page }) => {
    await gotoHydrated(page, "/contact")
    // Focus (not click — click fires the mailto) the email field, then press the shortcut.
    await page.getByRole("textbox", { name: "Email address" }).focus()
    await page.keyboard.press("Alt+2")
    await expect(page).toHaveURL(/\/contact\/?$/)
  })
})

test.describe("footer status", () => {
  test("renders build-time metrics without browser-side status API fetches", async ({ page }) => {
    const statusApiRequests: string[] = []
    await page.route(/sonarcloud\.io|api\.securityscorecards\.dev/, async (route) => {
      statusApiRequests.push(route.request().url())
      await route.abort()
    })

    await page.goto("/")
    await expect(page.getByRole("link", { name: /Sonar Analysis/i })).toBeVisible()
    await expect(page.getByLabel(/OpenSSF Scorecard score/i)).toBeVisible()
    expect(statusApiRequests).toEqual([])
  })
})
