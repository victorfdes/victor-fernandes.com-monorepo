import { expect, test } from "@playwright/test"
import diagramManifest from "../src/components/blog/_data/diagram-manifest.generated.json" with { type: "json" }
import { gotoHydrated } from "./utils"

test("an MDX diagram loads both themes and switches without an empty frame", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" })
  await page.setViewportSize({ height: 800, width: 480 })
  await gotoHydrated(page, "/blog/what-frontend-tests-are-actually-for")

  const id = "what-frontend-tests-are-actually-for-coverage-decision"
  const diagram = page.locator(`[data-diagram="${id}"]`)
  const light = page.getByTestId(`${id}-light`)
  const dark = page.getByTestId(`${id}-dark`)
  await diagram.scrollIntoViewIfNeeded()

  await expect
    .poll(async () =>
      Promise.all(
        [light, dark].map((image) =>
          image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)
        )
      )
    )
    .toEqual([true, true])
  await expect(light).toHaveCSS("opacity", "1")
  await expect(dark).toHaveCSS("opacity", "0")

  await page.getByRole("button", { name: /toggle navigation/i }).click()
  await page.getByRole("button", { name: /switch to dark theme/i }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(light).toHaveCSS("opacity", "0")
  await expect(dark).toHaveCSS("opacity", "1")

  await diagram.focus()
  await expect(diagram).toBeFocused()
  expect(await diagram.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true)
  await page.keyboard.press("ArrowRight")
  await expect.poll(async () => diagram.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
})

for (const diagram of Object.values(diagramManifest)) {
  for (const theme of ["light", "dark"] as const) {
    test(`${diagram.id} has stable ${theme} structure`, async ({ page }) => {
      const src = theme === "light" ? diagram.lightSrc : diagram.darkSrc
      const width = Math.ceil(diagram.width)
      const height = Math.ceil(diagram.height)
      await page.setViewportSize({ height: height + 20, width: width + 20 })
      await page.goto(src)

      const svg = page.locator("svg")
      await expect(svg.locator("title")).toHaveText(diagram.title)
      await expect(svg.locator("desc")).toHaveText(diagram.description)

      // Text glyph rasterization varies by operating system. Hide labels so this
      // snapshot locks node placement, connectors and arrowheads instead.
      await svg.evaluate(
        (element, dimensions) => {
          element.setAttribute("height", String(dimensions.height))
          element.setAttribute("width", String(dimensions.width))
          element.removeAttribute("style")
          const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
          style.textContent = "text, foreignObject { visibility: hidden !important; }"
          element.append(style)
        },
        { height, width }
      )

      await expect(svg).toHaveScreenshot(`${diagram.id}-${theme}.png`, {
        animations: "disabled",
        maxDiffPixelRatio: 0.001,
      })
    })
  }
}
