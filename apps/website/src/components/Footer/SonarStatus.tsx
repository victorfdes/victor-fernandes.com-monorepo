import clsx from "clsx"
import { ratingTone, type SonarMetrics } from "utils/system-status"

const SonarStatus = (value: Readonly<SonarMetrics>) => {
  const rows = [
    { label: "Security", display: value.security, tone: ratingTone(value.security), chip: true },
    { label: "Reliability", display: value.reliability, tone: ratingTone(value.reliability), chip: true },
    { label: "Technical Debt", display: value.technicalDebt, tone: "", chip: false },
    { label: "Code coverage", display: value.coverage, tone: "", chip: false },
  ]

  return (
    <dl className="grid gap-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-2">
          <dt className="secondary-text">{row.label}</dt>
          <dd className={clsx("m-0 inline-flex items-center gap-2", row.chip && "chip-base font-bold", row.tone)}>
            {row.display}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default SonarStatus
