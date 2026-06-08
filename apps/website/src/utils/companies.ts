export const COMPANY_DATA = {
  SIFTHUB: {
    key: "SIFTHUB",
    name: "SiftHub",
    logo: "/logo/sifthub.svg",
  },
  UPWORK: {
    key: "UPWORK",
    name: "Upwork",
    logo: "/logo/upwork.svg",
  },
  AIRBASE: {
    key: "AIRBASE",
    name: "Airbase",
    logo: "/logo/airbase.svg",
  },
  CLEVERTAP: {
    key: "CLEVERTAP",
    name: "CleverTap",
    logo: "/logo/clevertap.svg",
  },
  MEDIA_NET: {
    key: "MEDIA_NET",
    name: "Media.net",
    logo: "/logo/media-net.svg",
  },
  PROMISEC: {
    key: "PROMISEC",
    name: "Promisec Ltd",
    logo: "/logo/promisec.svg",
  },
}

export type CompanyDatum = (typeof COMPANY_DATA)[keyof typeof COMPANY_DATA]

/** Safe lookup: returns the company record for an arbitrary string, or undefined. */
export const getCompanyData = (key: string): CompanyDatum | undefined =>
  Object.hasOwn(COMPANY_DATA, key) ? COMPANY_DATA[key as keyof typeof COMPANY_DATA] : undefined
