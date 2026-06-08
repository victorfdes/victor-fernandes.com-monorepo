import { BLOG_SITE_URL } from "../utils/blog"
import { loadPublishedPosts } from "../utils/blog-collection"

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")

const asRssDate = (value: string) => new Date(`${value}T00:00:00.000Z`).toUTCString()

export async function GET() {
  const posts = await loadPublishedPosts()

  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${BLOG_SITE_URL}${post.url}</link>
  <guid>${BLOG_SITE_URL}${post.url}</guid>
  <pubDate>${asRssDate(post.publishedAt)}</pubDate>
  <description>${escapeXml(post.description)}</description>
</item>`
    )
    .join("\n")

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Victor Fernandes Blog</title>
  <link>${BLOG_SITE_URL}/blog</link>
  <description>Notes on software engineering, frontend architecture, and building useful products.</description>
  <language>en</language>
  ${items}
</channel>
</rss>`

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}
