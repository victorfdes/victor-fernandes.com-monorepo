import { SmartLink } from "@repo/ui"
import { type BlogPost, formatBlogDate } from "utils/blog"
import { blogImage } from "utils/blog-images"

const TaxonomyLink = ({
  href,
  label,
}: Readonly<{
  href: string
  label: string
}>) => (
  <SmartLink className="chip-base no-underline transition hover:border-cyan-500" href={href}>
    {label}
  </SmartLink>
)

export function BlogPostList({
  posts,
  emptyMessage = "No published posts yet.",
}: Readonly<{
  posts: BlogPost[]
  emptyMessage?: string
}>) {
  if (posts.length === 0) {
    return <p className="secondary-text">{emptyMessage}</p>
  }

  return (
    <div className="mt-8 grid gap-5">
      {posts.map((post, postIndex) => {
        // The first card is the topmost above-the-fold element, so its banner is the
        // LCP candidate: load it eagerly at high priority (the rest stay lazy) so the
        // resized CDN image starts downloading immediately instead of after a lazy-load
        // layout pass. Pages that render this list preconnect to and preload that image.
        const isLcpCandidate = postIndex === 0
        const banner = blogImage(post.featuredImage)
        return (
          <article key={post.slug} className="shadow-hover-box">
            {/* Decorative banner: the adjacent title link already conveys the post. */}
            <img
              src={banner.src}
              srcSet={banner.srcSet}
              sizes={banner.srcSet ? banner.sizes : undefined}
              alt=""
              loading={isLcpCandidate ? "eager" : "lazy"}
              fetchPriority={isLcpCandidate ? "high" : undefined}
              decoding="async"
              className="mb-4 aspect-video w-full rounded-md object-cover"
            />
            <div className="secondary-text flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
              <span aria-hidden="true">/</span>
              <span>{post.readingTime}</span>
            </div>
            <h2 className="mt-3 pb-0 text-2xl normal-case lg:text-3xl">
              <SmartLink className="no-underline" href={post.url}>
                {post.title}
              </SmartLink>
            </h2>
            <p className="mt-3 max-w-3xl">{post.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <TaxonomyLink href={`/blog/categories/${post.categorySlug}`} label={post.category} />
              {post.tags.map((tag, index) => {
                const slug = post.tagSlugs[index]
                if (!slug) return null
                return <TaxonomyLink key={slug} href={`/blog/tags/${slug}`} label={`#${tag}`} />
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}
