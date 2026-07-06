import { render, screen } from "@testing-library/react"
import AppErrorBoundary from "./AppErrorBoundary"

const Boom = (): never => {
  throw new Error("boom")
}

describe("AppErrorBoundary", () => {
  it("renders its children when nothing throws", () => {
    render(
      <AppErrorBoundary fallback={<p>fallback</p>}>
        <p>content</p>
      </AppErrorBoundary>
    )

    expect(screen.getByText("content")).toBeInTheDocument()
    expect(screen.queryByText("fallback")).not.toBeInTheDocument()
  })

  it("renders the fallback when a child throws during render", () => {
    // React logs the caught error; silence it so the test output stays clean.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    render(
      <AppErrorBoundary fallback={<p>fallback</p>}>
        <Boom />
      </AppErrorBoundary>
    )

    expect(screen.getByText("fallback")).toBeInTheDocument()
    expect(screen.queryByText("content")).not.toBeInTheDocument()
    consoleError.mockRestore()
  })
})
