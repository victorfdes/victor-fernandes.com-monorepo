import { act, render, screen } from "@testing-library/react"
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

  describe("autoScroll (besides-post variant)", () => {
    type ObserverCallback = (entries: { isIntersecting: boolean; target: Element }[]) => void
    let observerCallback: ObserverCallback | undefined
    let scrollTo: ReturnType<typeof vi.fn>

    beforeEach(() => {
      observerCallback = undefined
      scrollTo = vi.fn()

      // jsdom omits Element.scrollTo; define it so the centring effect runs instead of bailing.
      Object.defineProperty(HTMLElement.prototype, "scrollTo", {
        configurable: true,
        writable: true,
        value: scrollTo,
      })

      // Capture the observer callback so a test can drive which heading is "active".
      class MockObserver {
        constructor(cb: ObserverCallback) {
          observerCallback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      }
      vi.stubGlobal("IntersectionObserver", MockObserver)

      // The observed section elements must exist or the observer effect bails early.
      for (const heading of headings) {
        const section = document.createElement("section")
        section.id = heading.id
        document.body.append(section)
      }

      globalThis.matchMedia = vi.fn().mockReturnValue({ matches: false })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      document.body.innerHTML = ""
      // @ts-expect-error -- remove the prototype shim added for jsdom
      delete HTMLElement.prototype.scrollTo
    })

    it("tags each entry with its heading id for the centring lookup", () => {
      render(<TableOfContents headings={headings} autoScroll />)

      const item = screen.getAllByRole("listitem").find((li) => li.textContent === "Content pipeline")
      expect(item).toHaveAttribute("data-toc-id", "content-pipeline")
    })

    it("makes the card a height-constrained scroll area", () => {
      render(<TableOfContents headings={headings} autoScroll />)

      expect(screen.getByRole("navigation", { name: /article sections/i })).toHaveClass("overflow-y-auto")
    })

    it("smoothly centres the active entry when the viewed section changes", () => {
      render(<TableOfContents headings={headings} autoScroll />)

      const target = document.createElement("section")
      target.id = "static-routes"
      act(() => observerCallback?.([{ isIntersecting: true, target }]))

      expect(scrollTo).toHaveBeenCalled()
      expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "smooth" }))
    })

    it("jumps without animation when the reader prefers reduced motion", () => {
      globalThis.matchMedia = vi.fn().mockReturnValue({ matches: true })

      render(<TableOfContents headings={headings} autoScroll />)

      expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: "auto" }))
    })

    it("does not scroll or constrain height without the flag", () => {
      render(<TableOfContents headings={headings} />)

      expect(screen.getByRole("navigation", { name: /article sections/i })).not.toHaveClass("overflow-y-auto")
      expect(scrollTo).not.toHaveBeenCalled()
    })
  })
})
