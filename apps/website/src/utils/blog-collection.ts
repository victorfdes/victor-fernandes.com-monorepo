import { getCollection, type CollectionEntry } from "astro:content"
import type { BlogPost, BlogTaxonomyGroup } from "./blog"
import { createBlogTaxonomyValue, estimateBlogReadingTime, validateBlogCollection } from "./blog-content"
import { blogCardImage } from "./blog-images"

/**
 * Single source of truth for blog data. Loads the collection, derives slugs and
 * reading time through the shared helpers, resolves the pre-resized card banner,
 * drops drafts, sorts newest-first and validates the result so every page (index,
 * post, taxonomy, feed) renders the same normalised view. `astro:content` is
 * server-only, so this module must only be imported from `.astro` files / endpoints.
 */
const toBlogPost = async (entry: CollectionEntry<"blog">): Promise<BlogPost> => {
  const { data } = entry
  const tagValues = data.tags.map(createBlogTaxonomyValue)
  const updatedAt = data.updatedDate?.toISOString().slice(0, 10)

  return {
    title: data.title,
    description: data.description,
    publishedAt: data.date.toISOString().slice(0, 10),
    category: data.category,
    categorySlug: createBlogTaxonomyValue(data.category).slug,
    tags: data.tags,
    tagSlugs: tagValues.map((tag) => tag.slug),
    draft: data.draft,
    featuredImage: data.featuredImage,
    cardImage: await blogCardImage(data.featuredImage),
    slug: entry.id,
    url: `/blog/${entry.id}`,
    readingTime: estimateBlogReadingTime(entry.body ?? ""),
    // Only attach optional fields when present (exactOptionalPropertyTypes).
    ...(updatedAt !== undefined && { updatedAt }),
  }
}

export const loadPublishedPosts = async (): Promise<BlogPost[]> => {
  const entries = (await getCollection("blog")).filter((entry) => !entry.data.draft)
  // Drafts are dropped first so their images are never resized into the build output.
  const posts = (await Promise.all(entries.map((entry) => toBlogPost(entry)))).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )

  validateBlogCollection(posts)
  return posts
}

const groupBy = (
  posts: BlogPost[],
  getValues: (post: BlogPost) => { label: string; slug: string }[]
): BlogTaxonomyGroup[] => {
  const groups = new Map<string, BlogTaxonomyGroup>()

  for (const post of posts) {
    for (const { label, slug } of getValues(post)) {
      const group = groups.get(slug) ?? { label, slug, posts: [] }
      group.posts.push(post)
      groups.set(slug, group)
    }
  }

  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export const groupPostsByCategory = (posts: BlogPost[]): BlogTaxonomyGroup[] =>
  groupBy(posts, (post) => [{ label: post.category, slug: post.categorySlug }])

export const groupPostsByTag = (posts: BlogPost[]): BlogTaxonomyGroup[] =>
  groupBy(posts, (post) =>
    post.tags.flatMap((label, index) => {
      const slug = post.tagSlugs[index]
      return slug ? [{ label, slug }] : []
    })
  )
