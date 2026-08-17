import type { BlogPost } from "utils/blog"
import { loadPublishedPosts } from "utils/blog-collection"
import { GET } from "../feed.xml"

// Lives in `__tests__` (underscore-prefixed → excluded from Astro routing) so this
// spec is not built as a `/feed.xml.test` endpoint. The feed only needs the post
// view-model, so mock the (server-only) loader and exercise the XML escaping /
// date formatting through the real GET handler.
vi.mock("utils/blog-collection", () => ({ loadPublishedPosts: vi.fn() }))

const mockedLoad = vi.mocked(loadPublishedPosts)

const post = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  title: "Title",
  description: "Description",
  publishedAt: "2026-06-08",
  category: "Engineering",
  categorySlug: "engineering",
  tags: [],
  tagSlugs: [],
  draft: false,
  featuredImage: "https://example.com/x.jpg",
  cardImage: { src: "/_astro/x_320.webp", srcSet: undefined, sizes: "320px" },
  slug: "post",
  url: "/blog/post",
  readingTime: "1 min read",
  ...overrides,
})

describe("RSS feed (GET /feed.xml)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("serves the RSS content type", async () => {
    mockedLoad.mockResolvedValue([])

    const response = await GET()

    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8")
  })

  it("escapes all five XML entities in titles and descriptions", async () => {
    mockedLoad.mockResolvedValue([post({ title: `A & B < C > "D" 'E'`, description: "x & <y>" })])

    const xml = await (await GET()).text()

    expect(xml).toContain("A &amp; B &lt; C &gt; &quot;D&quot; &apos;E&apos;")
    expect(xml).toContain("x &amp; &lt;y&gt;")
    // The raw, unescaped specials must never reach the output.
    expect(xml).not.toContain("A & B < C")
  })

  it("formats the publish date as an RSS (UTC) date and builds absolute links", async () => {
    mockedLoad.mockResolvedValue([post({ publishedAt: "2026-06-08", url: "/blog/post" })])

    const xml = await (await GET()).text()

    expect(xml).toMatch(/<pubDate>\w{3}, 08 Jun 2026 00:00:00 GMT<\/pubDate>/)
    expect(xml).toContain("<link>https://victor-fernandes.com/blog/post</link>")
    expect(xml).toContain("<guid>https://victor-fernandes.com/blog/post</guid>")
  })
})
