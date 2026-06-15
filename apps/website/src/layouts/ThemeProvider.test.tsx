import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider, useTheme } from "layouts/ThemeProvider"

// A tiny consumer that surfaces the theme state and lets a test flip it.
const Probe = () => {
  const { darkMode, setDarkMode } = useTheme()
  return <button onClick={() => setDarkMode((value) => !value)}>{darkMode ? "dark" : "light"}</button>
}

const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
    stubMatchMedia(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("applies a stored dark theme to <html> on mount", () => {
    localStorage.setItem("theme", "dark")

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass("dark")
    expect(screen.getByRole("button")).toHaveTextContent("dark")
  })

  it("removes the dark class for a stored light theme", () => {
    localStorage.setItem("theme", "light")

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )

    expect(document.documentElement).not.toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("light")
  })

  it("falls back to the system preference when nothing is stored", () => {
    stubMatchMedia(true)

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("dark")
  })

  it("toggles the class and persists when the consumer flips the mode", () => {
    localStorage.setItem("theme", "light")

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByRole("button"))

    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("dark")
  })
})
