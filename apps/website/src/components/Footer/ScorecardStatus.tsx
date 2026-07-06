interface ScorecardStatusProps {
  readonly score: number
}

const ScorecardStatus = ({ score }: ScorecardStatusProps) => {
  const display = score.toFixed(1)

  return (
    <div
      // ARIA prohibits naming a generic <div>; role="img" makes the dial a
      // labelled graphic so screen readers announce the score with its context.
      role="img"
      className="relative grid h-20 w-20 place-items-center rounded-full border border-emerald-500/30 bg-zinc-50 dark:bg-slate-950"
      aria-label={`OpenSSF Scorecard score ${display}`}
    >
      <span
        aria-hidden="true"
        className="absolute h-16 w-16 rotate-45 rounded-full border-8 border-emerald-500 border-b-emerald-500/40 border-r-zinc-200 dark:border-r-slate-800"
      ></span>
      <span className="relative text-emerald-700 dark:text-emerald-300">{display}</span>
    </div>
  )
}

export default ScorecardStatus
