import { render, screen } from "@testing-library/react"
import { Diagram } from "./Diagram"

describe("Diagram", () => {
  it("exposes one accessible diagram and switches between decorative theme assets", () => {
    render(<Diagram id="what-frontend-tests-are-actually-for-coverage-decision" />)

    const diagram = screen.getByRole("img", { name: /how a file earns a test.*for any file/i })
    expect(diagram).toHaveAttribute("data-diagram", "what-frontend-tests-are-actually-for-coverage-decision")
    expect(diagram).toHaveAttribute("tabindex", "0")

    const lightImage = screen.getByTestId("what-frontend-tests-are-actually-for-coverage-decision-light")
    const darkImage = screen.getByTestId("what-frontend-tests-are-actually-for-coverage-decision-dark")

    expect(lightImage).toHaveAttribute("src", "/i/what-frontend-tests-are-actually-for-coverage-decision.svg")
    expect(lightImage).toHaveAttribute("width", "714")
    expect(lightImage).toHaveAttribute("height", "804")
    expect(lightImage).toHaveAttribute("loading", "lazy")
    expect(lightImage).toHaveAttribute("aria-hidden", "true")
    expect(lightImage).toHaveClass("opacity-100", "[grid-area:1/1]", "dark:opacity-0")

    expect(darkImage).toHaveAttribute("src", "/i/what-frontend-tests-are-actually-for-coverage-decision-dark.svg")
    expect(darkImage).toHaveAttribute("aria-hidden", "true")
    expect(darkImage).toHaveAttribute("loading", "lazy")
    expect(darkImage).toHaveAttribute("width", "714")
    expect(darkImage).toHaveAttribute("height", "804")
    expect(darkImage).toHaveClass("opacity-0", "[grid-area:1/1]", "dark:opacity-100")
    expect(darkImage).toHaveStyle({ minWidth: "714px" })
  })
})
