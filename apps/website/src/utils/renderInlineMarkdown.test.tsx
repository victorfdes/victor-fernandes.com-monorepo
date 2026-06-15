import { render, screen } from "@testing-library/react"
import { renderInlineMarkdown } from "utils/renderInlineMarkdown"

const renderMarkdown = (input: string) => render(<div data-testid="out">{renderInlineMarkdown(input)}</div>)

describe("renderInlineMarkdown", () => {
  it("returns plain text unchanged", () => {
    renderMarkdown("just text")

    expect(screen.getByText("just text").tagName).toBe("DIV")
  })

  it("renders ~text~ as <strong>", () => {
    renderMarkdown("a ~bold~ word")

    expect(screen.getByText("bold").tagName).toBe("STRONG")
    expect(screen.getByTestId("out")).toHaveTextContent("a bold word")
  })

  it("renders *text* as <em>", () => {
    renderMarkdown("an *italic* word")

    expect(screen.getByText("italic").tagName).toBe("EM")
  })

  it("nests ~*text*~ as <strong><em>", () => {
    renderMarkdown("~*both*~")

    expect(screen.getByText("both", { selector: "strong > em" })).toBeInTheDocument()
  })

  it("leaves an unmatched delimiter literal", () => {
    renderMarkdown("~oops")

    expect(screen.getByText("~oops").tagName).toBe("DIV")
  })

  it("renders each emphasis run in a string", () => {
    renderMarkdown("~a~ and ~b~")

    expect(screen.getByText("a").tagName).toBe("STRONG")
    expect(screen.getByText("b").tagName).toBe("STRONG")
  })

  it("renders nothing for empty input", () => {
    renderMarkdown("")

    expect(screen.getByTestId("out")).toBeEmptyDOMElement()
  })
})
