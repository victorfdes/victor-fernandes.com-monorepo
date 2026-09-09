import { act, fireEvent, render, screen } from "@testing-library/react"
import type { MouseEvent, ReactNode } from "react"
import { trackEvent, TRACKING_EVENTS } from "utils/analytics"
import ContactCard from "./ContactCard"

// Stub the side-effecting dispatch; the component only needs trackEvent and the
// (stable) event-name constants from this module.
vi.mock("utils/analytics", () => ({
  trackEvent: vi.fn(),
  TRACKING_EVENTS: {
    CLICKED_DOWNLOAD_RESUME: "clicked_download_resume",
    CLICKED_CONTACT_EMAIL: "clicked_contact_email",
    CLICKED_COPY_EMAIL: "clicked_copy_email",
    CLICKED_SOCIAL_LINK: "clicked_social_link",
  },
}))

// Identifiable stand-ins so tests can assert the copy/check icon swap without
// reaching into rendered SVG markup.
vi.mock("react-icons/pi", () => ({
  PiCheckBold: () => <span data-testid="icon-check" />,
  PiCopyBold: () => <span data-testid="icon-copy" />,
  PiEnvelopeSimpleBold: () => null,
}))

// Lightweight stand-ins for the design-system components so the test exercises
// ContactCard's own logic without pulling @repo/ui's build output into jsdom.
vi.mock("@repo/ui", () => ({
  TextInput: ({
    value,
    onClick,
    rightSlot,
    ...rest
  }: {
    value: string
    onClick?: () => void
    rightSlot?: ReactNode
    "aria-label"?: string
  }) => (
    <div>
      <input readOnly value={value} onClick={onClick} aria-label={rest["aria-label"]} />
      {rightSlot}
    </div>
  ),
  SmartButton: ({
    onClick,
    icon,
    ...rest
  }: {
    onClick?: (event: MouseEvent) => void
    icon?: ReactNode
    "aria-label"?: string
  }) => (
    <button aria-label={rest["aria-label"]} onClick={onClick}>
      {icon}
    </button>
  ),
}))

const mockedTrackEvent = vi.mocked(trackEvent)
const clipboardWriteText = vi.fn()
const execCommand = vi.fn()

// jsdom does not implement execCommand at all, so there is no property to spy on — it has to be
// defined outright. Same for `navigator.clipboard`, which a non-secure context leaves undefined.
const stubExecCommand = (result: boolean | (() => never)) => {
  execCommand.mockImplementation(typeof result === "function" ? result : () => result)
  Object.defineProperty(document, "execCommand", { configurable: true, writable: true, value: execCommand })
}

describe("ContactCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clipboardWriteText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteText },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    Reflect.deleteProperty(document, "execCommand")
  })

  it("copies the de-obfuscated email and tracks the copy", async () => {
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("vic@fdes.pro")
    expect(mockedTrackEvent).toHaveBeenCalledWith(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })
  })

  it("reverses a custom emailReversed prop before copying", async () => {
    render(<ContactCard emailReversed="moc.elpmaxe@olleh" />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("hello@example.com")
  })

  it("shows the check icon after a successful copy and reverts it after 3 seconds", async () => {
    vi.useFakeTimers()
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    // Flush the resolved clipboard promise so the .then() state update runs
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId("icon-check")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument()
    expect(screen.getByTestId("icon-copy")).toBeInTheDocument()
  })

  it("announces the copy to screen readers, not just through the icon", async () => {
    render(<ContactCard />)

    // The status region is empty until a copy lands, so nothing is announced on first paint.
    expect(screen.getByRole("status")).toHaveTextContent("")

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByRole("status")).toHaveTextContent("Email address copied to clipboard")
  })

  it("falls back to execCommand when the async clipboard API is absent", async () => {
    // What a non-secure context (plain http on a LAN address) actually looks like: reaching for
    // .writeText here would throw synchronously, which is the bug this path exists to survive.
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined })
    stubExecCommand(true)
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(execCommand).toHaveBeenCalledWith("copy")
    expect(screen.getByTestId("icon-check")).toBeInTheDocument()
  })

  it("falls back to execCommand when the clipboard write is rejected", async () => {
    clipboardWriteText.mockRejectedValue(new Error("clipboard denied"))
    stubExecCommand(true)
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    // Flush the rejected clipboard promise so the catch path runs
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("vic@fdes.pro")
    expect(execCommand).toHaveBeenCalledWith("copy")
    expect(screen.getByTestId("icon-check")).toBeInTheDocument()
  })

  it("keeps the copy icon when both copy paths fail", async () => {
    clipboardWriteText.mockRejectedValue(new Error("clipboard denied"))
    stubExecCommand(false)
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument()
    expect(screen.getByTestId("icon-copy")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("")
  })

  it("keeps the copy icon when execCommand itself throws", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined })
    stubExecCommand(() => {
      throw new Error("execCommand unavailable")
    })
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId("icon-copy")).toBeInTheDocument()
  })

  it("removes the fallback textarea from the DOM after copying", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined })
    stubExecCommand(true)
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => {
      await Promise.resolve()
    })

    // Node access on purpose: the fallback textarea is aria-hidden and appended to <body>
    // outside the render container, so no Testing Library query can see it either way.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelectorAll("textarea")).toHaveLength(0)
  })

  it("opens a mailto for the de-obfuscated email and tracks the click", () => {
    // jsdom can't navigate; a stub captures the href the handler assigns.
    vi.stubGlobal("location", { href: "" })
    render(<ContactCard />)

    fireEvent.click(screen.getByLabelText("Email address"))

    expect(globalThis.location.href).toBe("mailto:vic@fdes.pro")
    expect(mockedTrackEvent).toHaveBeenCalledWith(TRACKING_EVENTS.CLICKED_CONTACT_EMAIL, { source: "contact" })
  })
})
