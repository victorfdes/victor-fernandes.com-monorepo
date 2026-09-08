import type { ReactNode } from "react"

/**
 * The opening statement every top-level page shares: a two-line gradient display heading, an
 * accent hairline, a tracked tagline, and an optional supporting column.
 *
 * All three artboards open exactly this way, so it is one component rather than three
 * near-identical blocks — the alternative is the hero drifting apart page by page. Both columns
 * are addressable because they carry different things per page: the home page puts its intro on
 * the right, while the résumé keeps its summary and actions under the tagline and gives the
 * right column to the portrait and addresses.
 */
export function PageHero({
  lead,
  emphasis,
  tagline,
  aside,
  children,
}: Readonly<{
  /** First display line, in the lighter weight. */
  lead: string
  /** Second display line, set heavier so the pair reads as one mark with a stress. */
  emphasis: string
  /** The tracked line beside the accent rule. */
  tagline: ReactNode
  /** Optional right-hand column — an intro paragraph, a portrait, contact details. */
  aside?: ReactNode | undefined
  /** Optional continuation of the left column, below the tagline. */
  children?: ReactNode | undefined
}>) {
  return (
    <section className="split pb-[clamp(3.5rem,9vw,6rem)] pt-[clamp(3.5rem,11vw,7.5rem)]">
      <div className="split-7">
        <h1 className="display m-0 pb-0">
          <span className="name-grad">{lead}</span>
          <br />
          <span className="name-grad font-medium">{emphasis}</span>
        </h1>

        <div className="mt-9 flex items-center gap-5">
          <span aria-hidden="true" className="accent-rule shrink-0" />
          <p className="text-ink-2 m-0 text-base font-light uppercase tracking-[0.16em] sm:text-lg">{tagline}</p>
        </div>

        {children}
      </div>

      {aside && <div className="split-5 self-end pb-2">{aside}</div>}
    </section>
  )
}

export default PageHero
