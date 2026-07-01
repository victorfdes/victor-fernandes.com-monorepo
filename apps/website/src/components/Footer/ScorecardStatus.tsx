"use client"

import { fetchScorecard } from "utils/system-status"
import { useLiveMetric } from "./useLiveMetric"

interface ScorecardStatusProps {
  /** Today's known score, rendered first and kept as the fallback if the fetch fails. */
  readonly score: number
}

// Live OpenSSF Scorecard dial for the footer. Astro renders `score` as the initial markup;
// on hydration this revalidates to the real score in place.
const ScorecardStatus = ({ score }: ScorecardStatusProps) => {
  const { value, isRefreshing } = useLiveMetric("scorecard", score, fetchScorecard)
  const display = value.toFixed(1)

  return (
    <div
      className="relative grid h-20 w-20 place-items-center rounded-full border border-emerald-500/30 bg-zinc-50 dark:bg-slate-950"
      aria-label={`OpenSSF Scorecard score ${display}`}
      aria-busy={isRefreshing}
    >
      <span
        aria-hidden="true"
        className="absolute h-16 w-16 rotate-45 rounded-full border-8 border-emerald-500 border-b-emerald-500/40 border-r-zinc-200 dark:border-r-slate-800"
      ></span>
      <span
        className={`relative font-mono text-emerald-700 dark:text-emerald-300 ${isRefreshing ? "animate-pulse" : ""}`}
      >
        {display}
      </span>
    </div>
  )
}

export default ScorecardStatus
