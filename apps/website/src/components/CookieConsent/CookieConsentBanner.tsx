import { SmartButton, SmartLink } from "@repo/ui"
import { useEffect, useState } from "react"
import {
  getStoredAnalyticsConsent,
  isAnalyticsConfigured,
  setStoredAnalyticsConsent,
  trackPageView,
  updateAnalyticsConsent,
} from "utils/analytics"

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isAnalyticsConfigured()) {
      return
    }

    const storedConsent = getStoredAnalyticsConsent()

    if (!storedConsent) {
      setIsVisible(true)
      return
    }

    updateAnalyticsConsent(storedConsent)
  }, [])

  const handleAccept = () => {
    setStoredAnalyticsConsent("granted")
    updateAnalyticsConsent("granted")
    trackPageView(`${globalThis.location.pathname}${globalThis.location.search}`)
    setIsVisible(false)
  }

  const handleDecline = () => {
    setStoredAnalyticsConsent("denied")
    updateAnalyticsConsent("denied")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <section
      aria-label="Cookie consent"
      // The one place a raised surface is still right: it floats over the page rather than
      // sitting in its flow, so it needs an edge the hairline system cannot give it.
      className="border-line bg-surface/95 fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-lg rounded-xl border p-6 shadow-lg backdrop-blur-md"
    >
      <h2 className="text-ink m-0 pb-0 text-base font-normal normal-case">Cookie consent</h2>
      <p className="text-ink-2 mt-2 text-sm">
        This site uses analytics cookies to measure traffic and improve content. You can change your choice later by
        clearing site storage.
      </p>
      <p className="text-ink-2 mt-2 text-sm">
        Read the <SmartLink href="/privacy">privacy policy</SmartLink> for details.
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <SmartButton intent="secondary" onClick={handleDecline}>
          Decline
        </SmartButton>
        <SmartButton intent="primary" onClick={handleAccept}>
          Accept
        </SmartButton>
      </div>
    </section>
  )
}

export default CookieConsentBanner
