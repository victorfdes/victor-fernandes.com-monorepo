import {
  getStoredAnalyticsConsent,
  isAnalyticsConfigured,
  setStoredAnalyticsConsent,
  trackEvent,
  trackPageView,
  updateAnalyticsConsent,
} from "utils/analytics"

const STORAGE_KEY = "analytics_consent"

// Consent gating is the regulatory part of this module: nothing may reach gtag
// unless analytics is configured, gtag exists, and consent is explicitly granted.
describe("analytics", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    localStorage.clear()
    Reflect.deleteProperty(globalThis, "gtag")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("isAnalyticsConfigured", () => {
    it("is true only when a non-blank measurement id is set", () => {
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "G-ABC123")
      expect(isAnalyticsConfigured()).toBe(true)
    })

    it("is false when the id is blank", () => {
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "   ")
      expect(isAnalyticsConfigured()).toBe(false)
    })
  })

  describe("stored consent", () => {
    it("round-trips a granted choice through localStorage", () => {
      expect(getStoredAnalyticsConsent()).toBeNull()
      setStoredAnalyticsConsent("granted")
      expect(localStorage.getItem(STORAGE_KEY)).toBe("granted")
      expect(getStoredAnalyticsConsent()).toBe("granted")
    })

    it("treats an unrecognised stored value as no choice", () => {
      localStorage.setItem(STORAGE_KEY, "maybe")
      expect(getStoredAnalyticsConsent()).toBeNull()
    })
  })

  describe("updateAnalyticsConsent", () => {
    it("is a no-op when gtag is absent", () => {
      expect(() => updateAnalyticsConsent("granted")).not.toThrow()
    })

    it("grants analytics storage while keeping ad signals denied", () => {
      const gtag = vi.fn()
      globalThis.gtag = gtag

      updateAnalyticsConsent("granted")

      expect(gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      })
    })

    it("denies analytics storage when consent is withdrawn", () => {
      const gtag = vi.fn()
      globalThis.gtag = gtag

      updateAnalyticsConsent("denied")

      expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "denied" }))
    })
  })

  describe("trackPageView / trackEvent guards", () => {
    const grant = () => {
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "G-ABC123")
      globalThis.gtag = vi.fn()
      setStoredAnalyticsConsent("granted")
    }

    it("does not emit without a measurement id", () => {
      globalThis.gtag = vi.fn()
      setStoredAnalyticsConsent("granted")
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "")

      trackPageView("/x")
      trackEvent("clicked_copy_email", { source: "contact" })

      expect(globalThis.gtag).not.toHaveBeenCalled()
    })

    it("does not throw (or emit) when gtag is missing", () => {
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "G-ABC123")
      setStoredAnalyticsConsent("granted")

      expect(() => trackPageView("/x")).not.toThrow()
      expect(() => trackEvent("clicked_copy_email")).not.toThrow()
    })

    it("does not emit until consent is granted", () => {
      vi.stubEnv("PUBLIC_GA_MEASUREMENT_ID", "G-ABC123")
      globalThis.gtag = vi.fn()
      setStoredAnalyticsConsent("denied")

      trackPageView("/x")
      trackEvent("clicked_copy_email")

      expect(globalThis.gtag).not.toHaveBeenCalled()
    })

    it("emits a page_view with path and location once allowed", () => {
      grant()

      trackPageView("/blog")

      expect(globalThis.gtag).toHaveBeenCalledWith("event", "page_view", {
        page_path: "/blog",
        page_location: globalThis.location.href,
      })
    })

    it("emits a named event, defaulting missing params to an empty object", () => {
      grant()

      trackEvent("clicked_copy_email")

      expect(globalThis.gtag).toHaveBeenCalledWith("event", "clicked_copy_email", {})
    })

    it("forwards typed event params verbatim", () => {
      grant()

      trackEvent("clicked_social_link", { network: "github", source: "footer" })

      expect(globalThis.gtag).toHaveBeenCalledWith("event", "clicked_social_link", {
        network: "github",
        source: "footer",
      })
    })
  })
})
