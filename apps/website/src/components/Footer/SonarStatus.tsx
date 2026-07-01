"use client"

import { fetchSonarMetrics, ratingTone, type SonarMetrics } from "utils/system-status"
import { useLiveMetric } from "./useLiveMetric"

// Live SonarCloud ratings for the footer. Astro renders the props (today's known values)
// as the initial markup; on hydration this revalidates to the real numbers in place.
const SonarStatus = (baseline: Readonly<SonarMetrics>) => {
  const { value, isRefreshing } = useLiveMetric("sonar", baseline, fetchSonarMetrics)
  const pulse = isRefreshing ? "animate-pulse" : ""

  return (
    <dl className="grid gap-2 text-sm" aria-busy={isRefreshing}>
      <div className="flex items-center justify-between gap-2">
        <dt className="secondary-text">Security</dt>
        <dd className={`chip-base m-0 font-mono font-bold ${ratingTone(value.security)} ${pulse}`}>{value.security}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt className="secondary-text">Reliability</dt>
        <dd className={`chip-base m-0 font-mono font-bold ${ratingTone(value.reliability)} ${pulse}`}>
          {value.reliability}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt className="secondary-text">Technical Debt</dt>
        <dd className={`m-0 font-mono ${pulse}`}>{value.technicalDebt}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt className="secondary-text">Code coverage</dt>
        <dd className={`m-0 font-mono ${pulse}`}>{value.coverage}</dd>
      </div>
    </dl>
  )
}

export default SonarStatus
