import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import OffCanvas from "./OffCanvas"

const menuItems = [
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
]
const socialLinks = { linkedin: "https://linkedin.com", twitter: "https://x.com", github: "https://github.com" }

describe("OffCanvas", () => {
  it("is inert and hidden from the a11y tree when closed", () => {
    render(<OffCanvas menuOpen={false} setMenuOpen={() => {}} menuItems={menuItems} socialLinks={socialLinks} />)
    const panel = screen.getByLabelText("Site menu")
    expect(panel).toHaveAttribute("aria-hidden", "true")
    expect(panel).toHaveClass("translate-x-full")
  })

  it("slides in and exposes navigation when open", () => {
    render(<OffCanvas menuOpen setMenuOpen={() => {}} menuItems={menuItems} socialLinks={socialLinks} />)
    const panel = screen.getByLabelText("Site menu")
    expect(panel).toHaveClass("translate-x-0")
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog")
  })

  it("calls setMenuOpen(false) when the close button is clicked", async () => {
    const setMenuOpen = vi.fn()
    render(<OffCanvas menuOpen setMenuOpen={setMenuOpen} menuItems={menuItems} socialLinks={socialLinks} />)
    await userEvent.click(screen.getByRole("button", { name: "Close menu" }))
    expect(setMenuOpen).toHaveBeenCalledWith(false)
  })

  it("closes on the Escape key while open", async () => {
    const setMenuOpen = vi.fn()
    render(<OffCanvas menuOpen setMenuOpen={setMenuOpen} menuItems={menuItems} socialLinks={socialLinks} />)
    await userEvent.keyboard("{Escape}")
    expect(setMenuOpen).toHaveBeenCalledWith(false)
  })

  it("renders a keycap badge and exposes the shortcut when one is provided", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={[{ label: "Blog", href: "/blog", shortcut: 2 }]}
        socialLinks={socialLinks}
      />
    )
    const link = screen.getByRole("link", { name: "Blog" })
    expect(link).toHaveAttribute("aria-keyshortcuts", "2")
    expect(link).toHaveTextContent("2")
  })

  it("prefixes the badge and shortcut with the modifier when one is given", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={[{ label: "Blog", href: "/blog", shortcut: 2 }]}
        shortcutModifier="Alt"
        socialLinks={socialLinks}
      />
    )
    const link = screen.getByRole("link", { name: "Blog" })
    expect(link).toHaveAttribute("aria-keyshortcuts", "Alt+2")
    expect(link).toHaveTextContent("Alt2")
  })

  it("can use a separate visual modifier label while keeping ARIA on Alt", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={[{ label: "Blog", href: "/blog", shortcut: 2 }]}
        shortcutModifier="Alt"
        shortcutModifierLabel="⌥"
        socialLinks={socialLinks}
      />
    )
    const link = screen.getByRole("link", { name: "Blog" })
    expect(link).toHaveAttribute("aria-keyshortcuts", "Alt+2")
    expect(link).toHaveTextContent("⌥2")
  })

  it("can hide shortcut badges until the parent surface reveals them", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={[{ label: "Blog", href: "/blog", shortcut: 2 }]}
        shortcutModifier="Alt"
        showShortcuts={false}
        socialLinks={socialLinks}
      />
    )
    expect(screen.getByText("Alt", { selector: "[data-shortcut-modifier-label]" })).not.toBeVisible()
  })

  it("marks the current page with aria-current and leaves the others unset", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={[
          { label: "Blog", href: "/blog", current: true },
          { label: "Resume", href: "/resume" },
        ]}
        socialLinks={socialLinks}
      />
    )
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Resume" })).not.toHaveAttribute("aria-current")
  })

  it("omits the keycap and shortcut attribute for items without a shortcut", () => {
    render(<OffCanvas menuOpen setMenuOpen={() => {}} menuItems={menuItems} socialLinks={socialLinks} />)
    expect(screen.getByRole("link", { name: "Blog" })).not.toHaveAttribute("aria-keyshortcuts")
  })

  it("renders the optional top slot (e.g. a theme toggle)", () => {
    render(
      <OffCanvas
        menuOpen
        setMenuOpen={() => {}}
        menuItems={menuItems}
        socialLinks={socialLinks}
        topSlot={<button>Toggle theme</button>}
      />
    )
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument()
  })
})
