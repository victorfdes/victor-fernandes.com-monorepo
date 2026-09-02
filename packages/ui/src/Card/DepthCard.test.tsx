import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DepthCard } from "./DepthCard"

describe("DepthCard", () => {
  it("renders the title and the body content", () => {
    render(
      <DepthCard color="#00ffd6" title="Orb glass">
        Soft pill body with stacked glass.
      </DepthCard>
    )

    expect(screen.getByText("Orb glass")).toBeInTheDocument()
    expect(screen.getByText("Soft pill body with stacked glass.")).toBeInTheDocument()
  })

  it("renders one circle per action, in the order given", () => {
    render(
      <DepthCard
        color="#00ffd6"
        title="Orb glass"
        actions={[
          <button key="first" type="button">
            First
          </button>,
          <button key="second" type="button">
            Second
          </button>,
        ]}
      />
    )

    const circles = screen.getAllByRole("listitem")
    expect(circles).toHaveLength(2)
    expect(circles[0]).toHaveTextContent("First")
    expect(circles[1]).toHaveTextContent("Second")
  })

  it("lets an action keep its own click handler", async () => {
    const onClick = vi.fn()
    render(
      <DepthCard
        color="#00ffd6"
        title="Orb glass"
        actions={[
          <button key="share" type="button" onClick={onClick} aria-label="Share">
            <svg />
          </button>,
        ]}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: "Share" }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("lets an action keep its own href", () => {
    render(
      <DepthCard
        color="#00ffd6"
        title="Orb glass"
        actions={[
          <a key="gh" href="https://github.com/victorfdes" aria-label="GitHub">
            <svg />
          </a>,
        ]}
      />
    )

    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/victorfdes")
  })

  it("hands the colour to the stylesheet as a custom property", () => {
    render(<DepthCard color="rgb(0, 255, 214)" title="Orb glass" />)

    // The inline custom property is the only channel a runtime colour can take — every
    // other tone is mixed from it in theme.css — so it is worth asserting directly.
    expect(screen.getByTestId("depth-card")).toHaveStyle({ "--depth-card-accent": "rgb(0, 255, 214)" })
  })

  it("renders the CTA only when one is given", () => {
    const { rerender } = render(<DepthCard color="#00ffd6" title="Orb glass" cta={<span>Open</span>} />)
    expect(screen.getByText("Open")).toBeInTheDocument()

    rerender(<DepthCard color="#00ffd6" title="Orb glass" />)
    expect(screen.queryByText("Open")).not.toBeInTheDocument()
  })

  it("places the logo in the innermost orbit circle", () => {
    render(<DepthCard color="#00ffd6" title="Orb glass" logo={<svg data-testid="depth-card-logo" />} />)

    // The stack renders outermost-first; the logo rides the innermost disc, which is
    // the one that travels furthest forward on hover.
    expect(screen.getByTestId("depth-card-orbit-inner")).toContainElement(screen.getByTestId("depth-card-logo"))
  })

  it("keeps its own class when given a consumer className", () => {
    render(<DepthCard color="#00ffd6" title="Orb glass" className="max-w-none" />)

    expect(screen.getByTestId("depth-card")).toHaveClass("depth-card", "max-w-none")
  })
})
