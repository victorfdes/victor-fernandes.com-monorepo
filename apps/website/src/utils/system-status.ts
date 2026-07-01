// Realtime quality metrics for the footer "Loads like a rocket?" panel.
//
// The site is statically built, so these numbers are fetched client-side from
// public, CORS-enabled APIs (no token, no proxy needed — both projects are public
// and answer anonymous cross-origin requests):
//   - SonarCloud measures: security/reliability ratings, technical debt, coverage
//   - OpenSSF Scorecard:    aggregate supply-chain score
// The endpoint usage mirrors scripts/sonar-issues.mjs (the token-free CLI reader).

export const SONAR_PROJECT_KEY = "victorfdes_victor-fernandes.com-monorepo"
const SONAR_METRIC_KEYS = ["security_rating", "reliability_rating", "sqale_index", "coverage"] as const
const SCORECARD_REPO = "github.com/victorfdes/victor-fernandes.com-monorepo"

const sonarMeasuresUrl = (): string => {
  const url = new URL("https://sonarcloud.io/api/measures/component")
  url.searchParams.set("component", SONAR_PROJECT_KEY)
  url.searchParams.set("metricKeys", SONAR_METRIC_KEYS.join(","))
  return url.href
}

const scorecardApiUrl = (): string => `https://api.securityscorecards.dev/projects/${SCORECARD_REPO}`

export type Rating = "A" | "B" | "C" | "D" | "E"

export interface SonarMetrics {
  security: Rating
  reliability: Rating
  technicalDebt: string
  coverage: string
}

const RATING_LETTERS: readonly Rating[] = ["A", "B", "C", "D", "E"]

// Sonar encodes ratings as the floats "1.0".."5.0"; map them to the A–E letters it
// shows in its UI. Unknown/missing values fall back to "A" so the chip never renders blank.
export const mapRating = (value: string | undefined): Rating => RATING_LETTERS[Math.round(Number(value)) - 1] ?? "A"

// `sqale_index` is technical debt in minutes. Sonar renders it against an 8-hour work
// day, e.g. 90 -> "1h 30min", 480 -> "1d". Zero debt keeps the panel's "0d" wording.
export const formatTechnicalDebt = (minutes: number): string => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0d"
  const minutesPerDay = 8 * 60
  const days = Math.floor(minutes / minutesPerDay)
  const hours = Math.floor((minutes % minutesPerDay) / 60)
  const mins = Math.round(minutes % 60)
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (mins && !days) parts.push(`${mins}min`)
  return parts.join(" ") || "0d"
}

// Trim coverage to one decimal, dropping a trailing ".0" so 95 -> "95%", 95.2 -> "95.2%".
export const formatCoverage = (value: string | undefined): string => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return "—"
  return `${Number(parsed.toFixed(1))}%`
}

// Letter-grade colours for the rating chips so a downgrade never renders green.
export const ratingTone = (rating: Rating): string => {
  switch (rating) {
    case "A":
    case "B":
      return "text-emerald-700 dark:text-emerald-400"
    case "C":
      return "text-amber-700 dark:text-amber-400"
    default:
      return "text-red-700 dark:text-red-400"
  }
}

interface SonarApiResponse {
  component?: { measures?: { metric: string; value?: string }[] }
}

export const fetchSonarMetrics = async (signal?: AbortSignal): Promise<SonarMetrics> => {
  const response = await fetch(sonarMeasuresUrl(), { signal: signal ?? null })
  if (!response.ok) throw new Error(`SonarCloud HTTP ${response.status}`)
  const data = (await response.json()) as SonarApiResponse
  const measures = new Map((data.component?.measures ?? []).map((measure) => [measure.metric, measure.value]))
  return {
    security: mapRating(measures.get("security_rating")),
    reliability: mapRating(measures.get("reliability_rating")),
    technicalDebt: formatTechnicalDebt(Number(measures.get("sqale_index"))),
    coverage: formatCoverage(measures.get("coverage")),
  }
}

interface ScorecardApiResponse {
  score?: number
}

export const fetchScorecard = async (signal?: AbortSignal): Promise<number> => {
  const response = await fetch(scorecardApiUrl(), { signal: signal ?? null })
  if (!response.ok) throw new Error(`OpenSSF Scorecard HTTP ${response.status}`)
  const data = (await response.json()) as ScorecardApiResponse
  if (typeof data.score !== "number") throw new Error("OpenSSF Scorecard: missing score")
  return data.score
}

// A short-lived sessionStorage cache so navigating between pages shows the last live
// value instantly (and avoids re-hitting the APIs on every page view). Best-effort:
// any failure (privacy mode, quota, SSR) falls back to baseline values silently.
const CACHE_TTL_MS = 10 * 60 * 1000
const cacheKeyFor = (key: string): string => `system-status:${key}`

interface CacheEntry<T> {
  value: T
  at: number
}

export const readCache = (key: string): unknown => {
  try {
    const raw = sessionStorage.getItem(cacheKeyFor(key))
    if (!raw) return undefined
    const entry = JSON.parse(raw) as CacheEntry<unknown>
    if (Date.now() - entry.at > CACHE_TTL_MS) return undefined
    return entry.value
  } catch {
    return undefined
  }
}

export const writeCache = (key: string, value: unknown): void => {
  try {
    sessionStorage.setItem(cacheKeyFor(key), JSON.stringify({ value, at: Date.now() } satisfies CacheEntry<unknown>))
  } catch {
    // Caching is an optimisation, not a requirement — ignore storage failures.
  }
}
