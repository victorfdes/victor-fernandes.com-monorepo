import { expect, test } from "@playwright/test"
import diagramManifest from "../src/components/blog/_data/diagram-manifest.generated.json" with { type: "json" }

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
