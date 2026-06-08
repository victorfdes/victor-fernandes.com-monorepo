import { render, screen } from "@testing-library/react"
import { TableOfContents } from "./TableOfContents"

describe("TableOfContents", () => {
  const headings = [
    { id: "content-pipeline", text: "Content pipeline", level: 2 as const },
    { id: "static-routes", text: "Static routes", level: 3 as const },
  ]

  it("links article headings and indents nested sections", () => {
    render(<TableOfContents headings={headings} />)

    expect(screen.getByRole("link", { name: "Content pipeline" })).toHaveAttribute("href", "#content-pipeline")

    // The nested (level-3) heading's list item is indented.
    const nestedItem = screen.getAllByRole("listitem").find((item) => item.textContent === "Static routes")
    expect(nestedItem).toHaveClass("pl-4")
  })

  it("renders when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined)

    expect(() => render(<TableOfContents headings={headings} />)).not.toThrow()

    vi.unstubAllGlobals()
  })
})
