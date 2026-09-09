import { expect, test } from "@playwright/test"
import { gotoHydrated } from "./utils"

// The unit suite mocks @repo/ui wholesale, so it proves ContactCard's own logic and nothing
// about the real TextInput/SmartButton it renders into. These drive the shipped components.
//
// Playwright serves the built site from http://localhost:4322 — localhost is a secure context,
// so `navigator.clipboard` exists here and this exercises the native path, not the execCommand
// fallback. The fallback's origins (plain http on a LAN address) can't be reached from here.
test.describe("contact page", () => {
  const EMAIL = "vic@fdes.pro"

  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
  })

  test("copies the email to the clipboard", async ({ page }) => {
    // Hydration-gated: ContactCard is a client:idle island, so a click before it mounts is
    // swallowed and the clipboard stays empty.
    await gotoHydrated(page, "/contact")

    await page.getByRole("button", { name: "Copy email address" }).click()

    await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL)
  })

  test("confirms the copy visually and to screen readers, then reverts", async ({ page }) => {
    await gotoHydrated(page, "/contact")

    const status = page.getByRole("status")
    await expect(status).toHaveText("")

    await page.getByRole("button", { name: "Copy email address" }).click()

    await expect(status).toHaveText("Email address copied to clipboard")
    // The tooltip label is a pseudo-element, so it is read off the attribute that feeds it
    // rather than queried as a node.
    await expect(page.locator(".tooltip")).toHaveAttribute("data-tooltip", "Copied!")

    // The 3s timeout puts the button back into its resting state.
    await expect(status).toHaveText("", { timeout: 5000 })
    await expect(page.locator(".tooltip")).toHaveAttribute("data-tooltip", "Copy email address")
  })

  test("never ships the address in the static HTML", async ({ page }) => {
    // The value is stored reversed precisely so a crawler reading the response body finds
    // nothing. Asserted against the raw payload, before any JS runs.
    const response = await page.goto("/contact")
    expect(await response!.text()).not.toContain(EMAIL)
  })

  test("copying does not also trigger the field's mailto", async ({ page }) => {
    await gotoHydrated(page, "/contact")

    // The copy button sits inside the email field, whose own click handler assigns
    // location.href = mailto:. stopPropagation is what keeps a copy from doing both.
    await page.getByRole("button", { name: "Copy email address" }).click()

    await expect(page).toHaveURL(/\/contact\/?$/)
    await expect(page.getByRole("textbox", { name: "Email address" })).toBeVisible()
  })
})
