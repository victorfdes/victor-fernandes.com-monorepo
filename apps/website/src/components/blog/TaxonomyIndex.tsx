import { SmartLink } from "@repo/ui"
import type { BlogTaxonomyGroup } from "utils/blog"

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
    return <p className="secondary-text">{emptyMessage}</p>
  }

  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {groups.map((group) => (
        <li key={group.slug} className="border-color rounded-lg border p-4">
          <SmartLink
            className="flex items-baseline justify-between gap-4 no-underline"
            href={`${hrefPrefix}/${group.slug}`}
          >
            <span className="text-xl">{group.label}</span>
            <span className="secondary-text text-sm">
              {group.posts.length} {group.posts.length === 1 ? "post" : "posts"}
            </span>
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}
