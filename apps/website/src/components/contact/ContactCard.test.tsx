import { fireEvent, render, screen } from "@testing-library/react"
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
  })

  it("copies the de-obfuscated email and tracks the copy", () => {
    render(<ContactCard />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))

    expect(clipboardWriteText).toHaveBeenCalledWith("vic@fdes.pro")
    expect(mockedTrackEvent).toHaveBeenCalledWith(TRACKING_EVENTS.CLICKED_COPY_EMAIL, { source: "contact" })
  })

  it("reverses a custom emailReversed prop before copying", () => {
    render(<ContactCard emailReversed="moc.elpmaxe@olleh" />)

    fireEvent.click(screen.getByRole("button", { name: "Copy" }))

    expect(clipboardWriteText).toHaveBeenCalledWith("hello@example.com")
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
