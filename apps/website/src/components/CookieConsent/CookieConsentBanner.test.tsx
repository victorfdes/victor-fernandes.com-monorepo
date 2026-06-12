import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  getStoredAnalyticsConsent,
  isAnalyticsConfigured,
  setStoredAnalyticsConsent,
  trackPageView,
  updateAnalyticsConsent,
} from "utils/analytics"
import CookieConsentBanner from "./CookieConsentBanner"

vi.mock("utils/analytics", () => ({
  isAnalyticsConfigured: vi.fn(),
  getStoredAnalyticsConsent: vi.fn(),
  setStoredAnalyticsConsent: vi.fn(),
  updateAnalyticsConsent: vi.fn(),
  trackPageView: vi.fn(),
}))

// Lightweight stand-ins so the test exercises the banner's consent logic without
// pulling the real design-system components (and their build output) into jsdom.
vi.mock("@repo/ui", () => ({
  SmartButton: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  SmartLink: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const mockedIsConfigured = vi.mocked(isAnalyticsConfigured)
const mockedGetConsent = vi.mocked(getStoredAnalyticsConsent)

const queryBanner = () => screen.queryByRole("region", { name: "Cookie consent" })

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedIsConfigured.mockReturnValue(true)
    mockedGetConsent.mockReturnValue(null)
  })

  it("prompts for consent when analytics is configured and no choice is stored", () => {
    render(<CookieConsentBanner />)

    expect(queryBanner()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument()
  })

  it("stores and applies consent, tracks the page, then hides when accepted", () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole("button", { name: "Accept" }))

    expect(setStoredAnalyticsConsent).toHaveBeenCalledWith("granted")
    expect(updateAnalyticsConsent).toHaveBeenCalledWith("granted")
    expect(trackPageView).toHaveBeenCalledTimes(1)
    expect(queryBanner()).not.toBeInTheDocument()
  })

  it("stores denial and hides, without tracking, when declined", () => {
    render(<CookieConsentBanner />)

    fireEvent.click(screen.getByRole("button", { name: "Decline" }))

    expect(setStoredAnalyticsConsent).toHaveBeenCalledWith("denied")
    expect(updateAnalyticsConsent).toHaveBeenCalledWith("denied")
    expect(trackPageView).not.toHaveBeenCalled()
    expect(queryBanner()).not.toBeInTheDocument()
  })

  it("re-applies a stored choice silently instead of prompting", () => {
    mockedGetConsent.mockReturnValue("granted")

    render(<CookieConsentBanner />)

    expect(updateAnalyticsConsent).toHaveBeenCalledWith("granted")
    expect(queryBanner()).not.toBeInTheDocument()
  })

  it("renders nothing when analytics is not configured", () => {
    mockedIsConfigured.mockReturnValue(false)

    render(<CookieConsentBanner />)

    expect(queryBanner()).not.toBeInTheDocument()
    expect(updateAnalyticsConsent).not.toHaveBeenCalled()
  })
})
