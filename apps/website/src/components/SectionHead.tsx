import type { ReactNode } from "react"

/**
 * The tracked label that opens every section — `CAREER HIGHLIGHTS`.
 *
 * The label is the section's real heading, so callers pass the level that fits the page outline.
 */
function SectionHead({
  children,
  as: Tag = "h2",
  id,
}: Readonly<{
  children: ReactNode
  as?: "h2" | "h3" | undefined
  id?: string | undefined
}>) {
  return (
    <div className="section-head">
      <Tag id={id} className="eyebrow m-0 pb-0">
        {children}
      </Tag>
    </div>
  )
}

export default SectionHead
