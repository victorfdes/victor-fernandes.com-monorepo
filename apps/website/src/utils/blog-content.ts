/*
 * Blog content facade: slugs, taxonomy values, reading time, and collection
 * validation. Text primitives live in markdown-text.ts and heading extraction
 * in blog-headings.ts; both stay re-exported here so importers keep a single
 * entry point.
 */
import { slugifyBlogValue, stripFencedCodeBlocks, stripLeadingFrontmatter, stripMarkdownSyntax } from "./markdown-text"

export { addBlogHeadingIds, extractBlogHeadings, type BlogHeading } from "./blog-headings"
export { slugifyBlogValue } from "./markdown-text"

export type BlogTaxonomyValue = {
  label: string
  slug: string
}

type BlogPostIdentity = {
  slug: string
  category: string
  categorySlug: string
  tags: string[]
  tagSlugs: string[]
}

type DraftablePost = {
  draft?: boolean
}

const WORDS_PER_MINUTE = 225

export const estimateBlogReadingTime = (content: string) => {
  const words = stripMarkdownSyntax(stripFencedCodeBlocks(stripLeadingFrontmatter(content)))
    .split(/\s+/)
    .filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))

  return `${minutes} min read`
}

export const createBlogTaxonomyValue = (label: string): BlogTaxonomyValue => ({
  label,
  slug: slugifyBlogValue(label),
})

const assertUniqueSlugs = (posts: BlogPostIdentity[]) => {
  const seen = new Set<string>()

  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Duplicate blog post slug "${post.slug}".`)
    }

    seen.add(post.slug)
  }
}

const assertUniqueTaxonomyLabels = (
  posts: BlogPostIdentity[],
  kind: "category" | "tag",
  values: (post: BlogPostIdentity) => BlogTaxonomyValue[]
) => {
  const labelsBySlug = new Map<string, string>()

  for (const value of posts.flatMap(values)) {
    const storedLabel = labelsBySlug.get(value.slug)

    if (storedLabel && storedLabel !== value.label) {
      throw new Error(`Blog ${kind} labels "${storedLabel}" and "${value.label}" both normalize to "${value.slug}".`)
    }

    labelsBySlug.set(value.slug, value.label)
  }
}

export const validateBlogCollection = (posts: BlogPostIdentity[]) => {
  assertUniqueSlugs(posts)
  assertUniqueTaxonomyLabels(posts, "category", (post) => [{ label: post.category, slug: post.categorySlug }])
  assertUniqueTaxonomyLabels(posts, "tag", (post) =>
    post.tags.map((label, index) => ({ label, slug: post.tagSlugs[index] ?? slugifyBlogValue(label) }))
  )
}

export const filterPublishedBlogPosts = <T extends DraftablePost>(posts: T[]) => posts.filter((post) => !post.draft)
