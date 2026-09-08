import { SmartLink } from "@repo/ui"
import type { CSSProperties } from "react"
import type { BlogTaxonomyGroup } from "utils/blog"

/**
 * Taxonomy groups as hairline rows: the label on the left, the count on the right, one rule
 * between each. The same shape as the contact page's "Elsewhere" list — a scannable index is a
 * ruled list, not a field of boxes.
 */
export function TaxonomyIndex({
  groups,
  hrefPrefix,
  emptyMessage,
}: Readonly<{
  groups: BlogTaxonomyGroup[]
  hrefPrefix: string
  emptyMessage: string
}>) {
  if (groups.length === 0) {
    return <p className="text-ink-3">{emptyMessage}</p>
  }

  return (
    <ul className="rule-grid m-0 pl-0" style={{ "--rule-grid-min": "20rem" } as CSSProperties}>
      {groups.map((group) => (
        <li key={group.slug} className="list-none">
          <SmartLink
            className="hover:text-accent text-ink flex items-baseline justify-between gap-4 no-underline transition-colors"
            href={`${hrefPrefix}/${group.slug}`}
          >
            <span className="text-lg font-light">{group.label}</span>
            <span className="meta shrink-0 tabular-nums">
              {group.posts.length} {group.posts.length === 1 ? "post" : "posts"}
            </span>
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}
