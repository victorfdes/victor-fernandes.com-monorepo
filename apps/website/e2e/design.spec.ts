import { expect, test, type Locator } from "@playwright/test"
import { gotoHydrated } from "./utils"

// The DepthCard tilt, the layer parallax, and the orbit lift are pure CSS hover/focus
// state — jsdom can't observe any of it, so the unit test only covers structure and prop
// pass-through. These assertions close that gap through the real page.

/** Resting layers sit at an identity transform; a tilted card reports a matrix3d. */
const transformOf = (locator: Locator) => locator.evaluate((element) => globalThis.getComputedStyle(element).transform)

const isIdentity = (transform: string) => transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)"

test.describe("DepthCard on the design system page", () => {
  test("renders its content and keeps each action interactive", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const card = page.locator(".depth-card").first()
    await expect(card.getByText("Orb glass")).toBeVisible()

    // The card supplies the circle; the caller's own <button> stays reachable by role.
    await expect(card.getByRole("button", { name: "Instagram" })).toBeVisible()
    await expect(card.getByRole("listitem")).toHaveCount(3)
  })

  test("tilts the card and lifts the orbit stack on hover", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const card = page.locator(".depth-card").first()
    const body = card.locator(".depth-card__body")
    const innerCircle = card.locator(".depth-card__circle").last()

    expect(isIdentity(await transformOf(body))).toBe(true)
    const restingCircle = await transformOf(innerCircle)

    await card.hover()

    // Poll rather than assert once: the tilt runs over 700ms.
    await expect.poll(async () => isIdentity(await transformOf(body))).toBe(false)
    await expect.poll(async () => transformOf(innerCircle)).not.toBe(restingCircle)
  })

  test("tilts for keyboard users too, via :focus-within", async ({ page }) => {
    await gotoHydrated(page, "/design")

    const card = page.locator(".depth-card").first()
    const body = card.locator(".depth-card__body")

    expect(isIdentity(await transformOf(body))).toBe(true)

    // Focus an action directly: the pointer never touches the card, so only the
    // :focus-within branch can produce the tilt.
    await card.getByRole("button", { name: "Instagram" }).focus()

    await expect.poll(async () => isIdentity(await transformOf(body))).toBe(false)
  })
})
