export const BLOG_SITE_URL = "https://victor-fernandes.com"

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
  featuredImage: string
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
