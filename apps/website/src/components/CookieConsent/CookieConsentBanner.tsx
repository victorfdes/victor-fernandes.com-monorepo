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
      className="shadow-hover-box fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-lg bg-zinc-50/95 backdrop-blur-md dark:bg-slate-900/95"
    >
      <h2 className="text-base font-semibold">Cookie consent</h2>
      <p className="mt-2 text-sm">
        This site uses analytics cookies to measure traffic and improve content. You can change your choice later by
        clearing site storage.
      </p>
      <p className="mt-2 text-sm">
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
