export const TRACKING_EVENTS = {
  CLICKED_DOWNLOAD_RESUME: "clicked_download_resume",
  CLICKED_CONTACT_EMAIL: "clicked_contact_email",
  CLICKED_COPY_EMAIL: "clicked_copy_email",
  CLICKED_SOCIAL_LINK: "clicked_social_link",
} as const

export type TrackingEventName = (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS]

export type TrackingEventParams = {
  [TRACKING_EVENTS.CLICKED_DOWNLOAD_RESUME]: {
    source?: string
  }
  [TRACKING_EVENTS.CLICKED_CONTACT_EMAIL]: {
    source?: string
  }
  [TRACKING_EVENTS.CLICKED_COPY_EMAIL]: {
    source?: string
  }
  [TRACKING_EVENTS.CLICKED_SOCIAL_LINK]: {
    network: "github" | "linkedin" | "x"
    source?: string
  }
}
