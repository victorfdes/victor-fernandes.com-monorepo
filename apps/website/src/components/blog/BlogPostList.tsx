import { SmartLink } from "@repo/ui"
import { type BlogPost, formatBlogDate } from "utils/blog"

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
      {posts.map((post) => (
        <article
          key={post.slug}
          className="border-color rounded-lg border p-5 shadow-sm transition hover:border-cyan-500"
        >
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
      ))}
    </div>
  )
}
