import { render, screen } from "@testing-library/react"
import WaveDivider from "./Wave"

describe("WaveDivider", () => {
  it("renders an inline presentational SVG instead of a public image asset", () => {
    render(<WaveDivider />)

    const svg = screen.getByTestId("wave-divider-svg")

    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
    expect(svg).toHaveAttribute("viewBox", "0 0 402 24")
    expect(svg).toHaveClass("h-full", "w-full", "opacity-50")

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("keeps the divider wrapper classes unchanged", () => {
    render(<WaveDivider />)

    expect(screen.getByTestId("wave-divider")).toHaveClass(
      "pointer-events-none",
      "relative",
      "h-11.25",
      "w-full",
      "select-none",
      "overflow-hidden",
      "leading-0",
      "text-zinc-600"
    )
  })
})
