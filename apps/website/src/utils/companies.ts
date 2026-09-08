/**
 * `accent` is the company's own brand colour, used only as a 7px dot beside its wordmark.
 * The mark itself is painted as a mask in the page's ink (see `.wordmark`), so the row reads
 * as one accent; the dot is the single place each brand keeps its own hue, which is enough to
 * tell the rows apart without three logos competing for attention.
 */
export const COMPANY_DATA = {
  SIFTHUB: {
    key: "SIFTHUB",
    name: "SiftHub",
    logo: "/logo/sifthub.svg",
  },
  UPWORK: {
    key: "UPWORK",
    accent: "#6fda44",
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
    accent: "#f04444",
    name: "CleverTap",
    logo: "/logo/clevertap.svg",
  },
  MEDIA_NET: {
    key: "MEDIA_NET",
    accent: "#e91e63",
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

/**
 * The brand dot's colour, or undefined for a company that has none.
 *
 * COMPANY_DATA is deliberately heterogeneous — only the companies shown as rows carry an
 * `accent` — so reading `.accent` off the union needs narrowing. Doing it here once keeps every
 * call site from repeating an `in` check that TypeScript loses across JSX boundaries anyway.
 */
export const companyAccent = (company: CompanyDatum): string | undefined =>
  "accent" in company ? company.accent : undefined

/** Safe lookup: returns the company record for an arbitrary string, or undefined. */
export const getCompanyData = (key: string): CompanyDatum | undefined =>
  Object.hasOwn(COMPANY_DATA, key) ? COMPANY_DATA[key as keyof typeof COMPANY_DATA] : undefined
