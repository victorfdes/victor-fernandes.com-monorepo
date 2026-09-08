interface ScorecardStatusProps {
  readonly score: number
}

/**
 * The Scorecard rating, in the same ring the Lighthouse metrics wear.
 *
 * The previous rotated-border dial was dropped with the rest of the decorative motifs: three
 * different ways of drawing "a number out of ten" sat in one row, and the ring is the one the
 * system already has. `role="img"` plus the label keeps it a named graphic — ARIA prohibits
 * naming a bare `<div>`, and the visible digits alone would not say what they measure.
 */
const ScorecardStatus = ({ score }: ScorecardStatusProps) => {
  const display = score.toFixed(1)

  return (
    <span role="img" className="stat-ring" aria-label={`OpenSSF Scorecard score ${display}`}>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}

export default ScorecardStatus
