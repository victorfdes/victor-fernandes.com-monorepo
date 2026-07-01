"use client"

import clsx from "clsx"
import { fetchSonarMetrics, ratingTone, type SonarMetrics } from "utils/system-status"
import { useLiveMetric } from "./useLiveMetric"

// Live SonarCloud ratings for the footer. Astro renders the props (today's known values)
// as the initial markup; on hydration this revalidates to the real numbers in place.
const SonarStatus = (baseline: Readonly<SonarMetrics>) => {
  const { value, isRefreshing } = useLiveMetric("sonar", baseline, fetchSonarMetrics)

  const rows = [
    { label: "Security", display: value.security, tone: ratingTone(value.security), chip: true },
    { label: "Reliability", display: value.reliability, tone: ratingTone(value.reliability), chip: true },
    { label: "Technical Debt", display: value.technicalDebt, tone: "", chip: false },
    { label: "Code coverage", display: value.coverage, tone: "", chip: false },
  ]

  return (
    <dl className="grid gap-2 text-sm" aria-busy={isRefreshing}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-2">
          <dt className="secondary-text">{row.label}</dt>
          <dd className={clsx("m-0 inline-flex items-center gap-2", row.chip && "chip-base font-bold", row.tone)}>
            {/* Decorative "live" dot — pulses only while revalidating so the value
                text itself never loses contrast (colour ratings sit close to the
                WCAG threshold and can't afford an opacity dip). */}
            {isRefreshing && (
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse" />
            )}
            {row.display}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default SonarStatus
