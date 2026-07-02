// Build-time quality metrics for the footer "Loads like a rocket?" panel.
//
// These numbers only change when the repository is analysed after a merge, so the
// static build fetches them once from public APIs and renders the values into HTML:
//   - SonarCloud measures: security/reliability ratings, technical debt, coverage
//   - OpenSSF Scorecard:    aggregate supply-chain score
// The endpoint usage mirrors scripts/sonar-issues.mjs (the token-free CLI reader).

const SONAR_PROJECT_KEY = "victorfdes_victor-fernandes.com-monorepo"
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

interface SystemStatus {
  sonar: SonarMetrics
  scorecard: number
}

export const DEFAULT_SONAR_METRICS = {
  security: "A",
  reliability: "A",
  technicalDebt: "0d",
  coverage: "93.4%",
} satisfies SonarMetrics

export const DEFAULT_SCORECARD_SCORE = 6.8

const STATUS_TIMEOUT_MS = 2_000

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

const withFallback = async <T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  timeoutMs: number
): Promise<T> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetcher(controller.signal)
  } catch {
    return fallback
  } finally {
    clearTimeout(timeout)
  }
}

export const fetchSystemStatus = async ({
  timeoutMs = STATUS_TIMEOUT_MS,
}: { timeoutMs?: number } = {}): Promise<SystemStatus> => {
  const [sonar, scorecard] = await Promise.all([
    withFallback(fetchSonarMetrics, DEFAULT_SONAR_METRICS, timeoutMs),
    withFallback(fetchScorecard, DEFAULT_SCORECARD_SCORE, timeoutMs),
  ])
  return { sonar, scorecard }
}

let systemStatusPromise: Promise<SystemStatus> | undefined

export const loadSystemStatus = (): Promise<SystemStatus> => {
  systemStatusPromise ??= fetchSystemStatus()
  return systemStatusPromise
}
