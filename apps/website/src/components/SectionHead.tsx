import type { ReactNode } from "react"

/**
 * The numbered label that opens every section — `01  HAVING WORKED WITH`.
 *
 * The index is `aria-hidden`: it is a visual counter for scanning the page, and read aloud it
 * would prefix every landmark with a number that means nothing without the layout. The label
 * itself is the real heading, so callers pass the level that fits the page outline.
 */
export function SectionHead({
  index,
  children,
  as: Tag = "h2",
  id,
}: Readonly<{
  /** Two-digit section counter, e.g. "01". Omit on sections that aren't part of a run. */
  index?: string
  children: ReactNode
  as?: "h2" | "h3"
  id?: string
}>) {
  return (
    <div className="section-head">
      {index && (
        <span aria-hidden="true" className="eyebrow-index shrink-0">
          {index}
        </span>
      )}
      <Tag id={id} className="eyebrow m-0 pb-0">
        {children}
      </Tag>
    </div>
  )
}

export default SectionHead
