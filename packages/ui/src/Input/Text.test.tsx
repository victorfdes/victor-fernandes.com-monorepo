import { render, screen } from "@testing-library/react"
import { TextInput } from "./Text"

describe("TextInput", () => {
  it("renders an accessible input", () => {
    render(<TextInput aria-label="Email" defaultValue="" />)
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument()
  })

  it("renders left and right slots", () => {
    render(
      <TextInput
        aria-label="Email"
        leftSlot={<span data-testid="left">@</span>}
        rightSlot={<button data-testid="right">copy</button>}
      />
    )
    expect(screen.getByTestId("left")).toBeInTheDocument()
    expect(screen.getByTestId("right")).toBeInTheDocument()
  })

  it("reflects the disabled state on the native input", () => {
    render(<TextInput aria-label="Email" disabled />)
    expect(screen.getByRole("textbox", { name: "Email" })).toBeDisabled()
  })

  it("forwards arbitrary input attributes", () => {
    render(<TextInput aria-label="Email" name="email" readOnly value="a@b.co" onChange={() => {}} />)
    const input = screen.getByRole("textbox", { name: "Email" })
    expect(input).toHaveAttribute("name", "email")
    expect(input).toHaveAttribute("readonly")
  })
})
