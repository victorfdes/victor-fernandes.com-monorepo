export const BLOG_SITE_URL = "https://victor-fernandes.com"

/**
 * Resolved responsive-image attributes, ready to spread onto an `<img>`. `srcSet` is undefined when
 * the source could not be pre-resized (a non-CDN URL), so callers omit `srcset`/`sizes` rather than
 * emitting a single-candidate set. Produced by `blog-images.ts`.
 */
export type BlogImageAttributes = {
  src: string
  srcSet: string | undefined
  sizes: string
}

/**
 * View model for a published post. Kept free of `astro:content` imports so it
 * can be shared by both server-rendered `.astro` pages and React components.
 * The loader that produces it lives in `blog-collection.ts`.
 */
export type BlogPost = {
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  category: string
  categorySlug: string
  tags: string[]
  tagSlugs: string[]
  draft: boolean
  /** Original, absolute CDN URL. Feeds OG/Twitter/JSON-LD, which need a stable absolute address. */
  featuredImage: string
  /**
   * Pre-resized card banner, resolved at build time by `blog-collection.ts`. Attached here rather than
   * computed in the card component, because resizing is async and components render synchronously.
   */
  cardImage: BlogImageAttributes
  slug: string
  url: string
  readingTime: string
}

export type BlogTaxonomyGroup = {
  label: string
  slug: string
  posts: BlogPost[]
}

export const formatBlogDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`))
