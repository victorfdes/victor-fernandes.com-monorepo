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

vi.mock("components/VictorBanner", () => ({ default: () => null }))

// Identifiable stand-ins so tests can assert the copy/check icon swap without
// reaching into rendered SVG markup.
vi.mock("react-icons/pi", () => ({
  PiCheckBold: () => <span data-testid="icon-check" />,
  PiCopyBold: () => <span data-testid="icon-copy" />,
  PiCircleFill: () => null,
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
  })

  it("copies the de-obfuscated email and tracks the copy", async () => {
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("vic@fdes.pro")
    expect(mockedTrackEvent).toHaveBeenCalledWith(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })
  })

  it("reverses a custom emailReversed prop before copying", async () => {
    render(<ContactCard emailReversed="moc.elpmaxe@olleh" />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("hello@example.com")
  })

  it("shows the check icon after a successful copy and reverts it after 3 seconds", async () => {
    vi.useFakeTimers()
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))
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

  it("keeps the copy icon when the clipboard write is rejected", async () => {
    clipboardWriteText.mockRejectedValue(new Error("clipboard denied"))
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))
    // Flush the rejected clipboard promise so the .catch() path runs
    await act(async () => {
      await Promise.resolve()
    })

    expect(clipboardWriteText).toHaveBeenCalledWith("vic@fdes.pro")
    expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument()
    expect(screen.getByTestId("icon-copy")).toBeInTheDocument()
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
