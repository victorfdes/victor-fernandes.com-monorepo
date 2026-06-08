import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SmartButton } from "./SmartButton"

describe("SmartButton", () => {
  it("renders a <button> when no href is given and handles clicks", async () => {
    const onClick = vi.fn()
    render(<SmartButton onClick={onClick}>Click me</SmartButton>)

    const button = screen.getByRole("button", { name: "Click me" })
    expect(button.tagName).toBe("BUTTON")

    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("renders an internal link without target when href is internal", () => {
    render(<SmartButton href="/resume">Resume</SmartButton>)

    const link = screen.getByRole("link", { name: "Resume" })
    expect(link).toHaveAttribute("href", "/resume")
    expect(link).not.toHaveAttribute("target")
  })

  it("opens external links safely in a new tab", () => {
    render(<SmartButton href="https://example.com">External</SmartButton>)

    const link = screen.getByRole("link", { name: "External" })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("never applies an underline so it does not inherit the global anchor style", () => {
    render(<SmartButton href="/contact">Contact</SmartButton>)
    expect(screen.getByRole("link", { name: "Contact" })).toHaveClass("no-underline")
  })

  it("exposes an icon-only button's label to assistive tech", () => {
    render(<SmartButton aria-label="Close" icon={<svg data-testid="icon" />} />)

    const button = screen.getByRole("button", { name: "Close" })
    expect(button).toHaveClass("w-12")
    // The visible label text is hidden but present for screen readers.
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("applies the requested intent's styles", () => {
    render(<SmartButton intent="secondary">Outlined</SmartButton>)
    expect(screen.getByRole("button", { name: "Outlined" })).toHaveClass("border-2")
  })
})
