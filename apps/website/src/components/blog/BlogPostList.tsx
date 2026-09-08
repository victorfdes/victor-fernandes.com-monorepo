import { SmartLink } from "@repo/ui"
import { type BlogPost, formatBlogDate } from "utils/blog"

const TaxonomyLink = ({
  href,
  label,
}: Readonly<{
  href: string
  label: string
}>) => (
  <SmartLink className="tag hover:border-accent hover:text-accent no-underline transition-colors" href={href}>
    {label}
  </SmartLink>
)

/**
 * Posts as hairline rows rather than cards: the thumbnail sits in the narrow column and the
 * title, description and taxonomy in the wide one — the same 4/8 split the company and
 * experience rows use, so a reader moving between pages meets one layout, not three.
 */
export function BlogPostList({
  posts,
  emptyMessage = "No published posts yet.",
}: Readonly<{
  posts: BlogPost[]
  emptyMessage?: string
}>) {
  if (posts.length === 0) {
    return <p className="text-ink-3">{emptyMessage}</p>
  }

  return (
    <div className="grid">
      {posts.map((post, index) => {
        // Resized at build time by the blog loader — see `utils/blog-collection.ts`.
        const banner = post.cardImage
        return (
          <article
            key={post.slug}
            className={`rule-row split gap-y-5 ${index === posts.length - 1 ? "border-line border-b" : ""}`}
          >
            <div className="split-4">
              {/* Decorative: the adjacent title link already names the post. */}
              <img
                src={banner.src}
                srcSet={banner.srcSet}
                sizes={banner.srcSet ? banner.sizes : undefined}
                alt=""
                loading="lazy"
                decoding="async"
                className="border-line aspect-video w-full rounded-md border object-cover"
              />
            </div>

            <div className="split-8 flex flex-col gap-4">
              <div className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
                <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime}</span>
              </div>

              <h2 className="text-ink m-0 pb-0 text-2xl font-light normal-case leading-snug lg:text-[1.75rem]">
                <SmartLink className="hover:text-accent no-underline transition-colors" href={post.url}>
                  {post.title}
                </SmartLink>
              </h2>

              <p className="lede m-0 max-w-[62ch] text-[1.0625rem]">{post.description}</p>

              <div className="flex flex-wrap gap-2">
                <TaxonomyLink href={`/blog/categories/${post.categorySlug}`} label={post.category} />
                {post.tags.map((tag, tagIndex) => {
                  const slug = post.tagSlugs[tagIndex]
                  if (!slug) return null
                  return <TaxonomyLink key={slug} href={`/blog/tags/${slug}`} label={`#${tag}`} />
                })}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
