import { render, screen } from "@testing-library/react"
import { SmartLink } from "./SmartLink"

describe("SmartLink", () => {
  it("renders internal links as plain anchors", () => {
    render(<SmartLink href="/blog">Blog</SmartLink>)
    const link = screen.getByRole("link", { name: "Blog" })
    expect(link).toHaveAttribute("href", "/blog")
    expect(link).not.toHaveAttribute("target")
  })

  it("adds safe rel/target for external links", () => {
    render(<SmartLink href="https://github.com/victorfdes">GitHub</SmartLink>)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("announces external navigation to screen readers only", () => {
    render(
      <SmartLink href="https://example.com" showExternalIcon>
        Example
      </SmartLink>
    )
    // The hint text exists for assistive tech but is visually hidden.
    expect(screen.getByText("(opens in a new tab)")).toHaveClass("sr-only")
  })

  it("does not render the external icon for internal links", () => {
    render(
      <SmartLink href="/about" showExternalIcon>
        About
      </SmartLink>
    )
    // No external hint means no external treatment (icon + sr-only label).
    expect(screen.queryByText("(opens in a new tab)")).not.toBeInTheDocument()
  })
})
