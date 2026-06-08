import { TRACKING_EVENTS, type TrackingEventName, type TrackingEventParams } from "utils/analytics-events"

export const ANALYTICS_CONSENT_STORAGE_KEY = "analytics_consent"

type AnalyticsConsentValue = "granted" | "denied"

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }

  // Typed access to the opt-in analytics env var (otherwise inferred as `any`).
  interface ImportMetaEnv {
    readonly PUBLIC_GA_MEASUREMENT_ID?: string
  }
}

const getGtag = () => {
  if (typeof window === "undefined") {
    return null
  }

  return typeof window.gtag === "function" ? window.gtag : null
}

export const getMeasurementId = () => {
  const id = import.meta.env.PUBLIC_GA_MEASUREMENT_ID
  return id?.trim() ? id : null
}

export const isAnalyticsConfigured = () => {
  return Boolean(getMeasurementId())
}

export const getStoredAnalyticsConsent = () => {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)

  if (value === "granted" || value === "denied") {
    return value
  }

  return null
}

export const setStoredAnalyticsConsent = (value: AnalyticsConsentValue) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value)
}

export const applyDefaultConsent = () => {
  const gtag = getGtag()

  if (!gtag) {
    return
  }

  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
}

export const updateAnalyticsConsent = (value: AnalyticsConsentValue) => {
  const gtag = getGtag()

  if (!gtag) {
    return
  }

  const analyticsStorage = value === "granted" ? "granted" : "denied"

  gtag("consent", "update", {
    analytics_storage: analyticsStorage,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
}

export const trackPageView = (path: string) => {
  const measurementId = getMeasurementId()
  const gtag = getGtag()

  if (!measurementId || !gtag || getStoredAnalyticsConsent() !== "granted") {
    return
  }

  gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
  })
}

export const trackEvent = <TEventName extends TrackingEventName>(
  eventName: TEventName,
  params?: TrackingEventParams[TEventName]
) => {
  const measurementId = getMeasurementId()
  const gtag = getGtag()

  if (!measurementId || !gtag || getStoredAnalyticsConsent() !== "granted") {
    return
  }

  gtag("event", eventName, params ?? {})
}

export { TRACKING_EVENTS }
