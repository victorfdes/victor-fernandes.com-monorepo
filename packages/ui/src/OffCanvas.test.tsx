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
