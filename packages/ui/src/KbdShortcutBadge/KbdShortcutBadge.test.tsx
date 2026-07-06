import { render, screen } from "@testing-library/react"
import { KbdShortcutBadge } from "./KbdShortcutBadge"

describe("KbdShortcutBadge", () => {
  it("renders the modifier label and the shortcut key", () => {
    render(<KbdShortcutBadge modifierLabel="Alt" shortcut={2} />)

    const modifier = screen.getByText("Alt")
    expect(modifier).toHaveAttribute("data-shortcut-modifier-label")
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("renders a bare key when no modifier label is given", () => {
    render(<KbdShortcutBadge shortcut={3} />)

    // Exactly the digit: no modifier span is rendered without a label.
    expect(screen.getByText("3")).toHaveTextContent(/^3$/)
  })

  it("stays out of view while hidden", () => {
    render(<KbdShortcutBadge modifierLabel="Alt" shortcut={1} hidden />)

    const badge = screen.getByText("1")
    expect(badge).not.toBeVisible()
    expect(badge).not.toHaveAttribute("hidden")
    expect(badge).toHaveStyle({ visibility: "hidden" })
  })

  it("uses the Option icon for the macOS modifier while keeping text for DOM sync", () => {
    render(<KbdShortcutBadge modifierLabel="⌥" shortcut={4} />)

    expect(screen.getByText("⌥")).toHaveAttribute("data-shortcut-modifier-label")
    expect(screen.getByTestId("shortcut-modifier-option-icon")).toBeInTheDocument()
    expect(screen.getByText("4")).toHaveClass("shortcut-modifier-symbol")
  })

  it("switches between idle and active accent styling", () => {
    const { rerender } = render(<KbdShortcutBadge modifierLabel="Alt" shortcut={1} />)

    expect(screen.getByText("1")).toHaveClass("secondary-text")

    rerender(<KbdShortcutBadge modifierLabel="Alt" shortcut={1} active />)

    expect(screen.getByText("1")).toHaveClass("border-cyan-600")
    expect(screen.getByText("1")).not.toHaveClass("secondary-text")
  })

  it("applies the large size variant and extra classes", () => {
    render(<KbdShortcutBadge modifierLabel="⌥" shortcut={4} size="lg" className="shortcut-reveal" />)

    const badge = screen.getByText("4")
    expect(badge).toHaveClass("h-7")
    expect(badge).toHaveClass("shortcut-reveal")
  })
})
