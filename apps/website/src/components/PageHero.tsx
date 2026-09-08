import type { ReactNode } from "react"

/**
 * The opening statement every top-level page shares: a two-line gradient display heading, an
 * accent hairline, a tracked tagline, and an optional supporting column on the right.
 *
 * All three artboards open exactly this way, so it is one component rather than three
 * near-identical blocks — the alternative is the hero drifting apart page by page.
 */
export function PageHero({
  lead,
  emphasis,
  tagline,
  children,
}: Readonly<{
  /** First display line, in the lighter weight. */
  lead: string
  /** Second display line, set heavier so the pair reads as one mark with a stress. */
  emphasis: string
  /** The tracked line beside the accent rule. */
  tagline: ReactNode
  /** Optional right-hand column — the intro paragraph, contact details, a portrait. */
  children?: ReactNode
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
      </div>

      {children && <div className="split-5 self-end pb-2">{children}</div>}
    </section>
  )
}

export default PageHero
