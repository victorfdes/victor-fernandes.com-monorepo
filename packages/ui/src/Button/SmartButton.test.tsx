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
    expect(button).toHaveClass("icon-pill")
    // The visible label text is hidden but present for screen readers.
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("applies the requested intent's styles", () => {
    render(<SmartButton intent="secondary">Outlined</SmartButton>)
    expect(screen.getByRole("button", { name: "Outlined" })).toHaveClass("pill-accent")
  })

  it("renders a trailing icon without letting it into the accessible name", () => {
    // Which side the icon sits on is visual; what matters here is that the decoration never
    // reaches assistive tech, so the button still announces as plain "Download".
    render(
      <SmartButton icon={<svg data-testid="icon" />} iconPosition="right">
        Download
      </SmartButton>
    )

    expect(screen.getByRole("button", { name: "Download" })).toHaveTextContent("Download")
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("takes its shape from the shared pill classes rather than restating the geometry", () => {
    // The contract this asserts is that .pill/.icon-pill in theme.css are the single definition
    // of the one raised shape in the system — a hand-styled pill and this component must match.
    const { rerender } = render(<SmartButton>Let's talk</SmartButton>)
    expect(screen.getByRole("button", { name: "Let's talk" })).toHaveClass("pill")

    rerender(<SmartButton aria-label="Close" icon={<svg data-testid="icon" />} />)
    const iconButton = screen.getByRole("button", { name: "Close" })
    expect(iconButton).toHaveClass("icon-pill")
    expect(iconButton).not.toHaveClass("pill")
  })
})
