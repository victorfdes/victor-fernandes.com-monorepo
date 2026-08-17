import { getCollection } from "astro:content"
import type { BlogPost } from "utils/blog"
import { groupPostsByCategory, groupPostsByTag, loadPublishedPosts } from "utils/blog-collection"

// `astro:content` is a server-only virtual module, aliased to a test stub in
// vitest.config.ts; drive its `getCollection` with hand-built entries here.
const mockedGetCollection = vi.mocked(getCollection)

type EntryData = {
  title: string
  description: string
  date: Date
  updatedDate?: Date
  category: string
  tags: string[]
  draft: boolean
  featuredImage: string
}

const makeEntry = (id: string, data: Partial<EntryData> = {}, body = "a few words to read") => ({
  id,
  body,
  data: {
    title: `Title ${id}`,
    description: `Description ${id}`,
    date: new Date("2026-01-01T00:00:00.000Z"),
    category: "Engineering",
    tags: ["TypeScript"],
    draft: false,
    featuredImage: "https://example.com/x.jpg",
    ...data,
  } satisfies EntryData,
})

const resolveEntries = (...entries: ReturnType<typeof makeEntry>[]) =>
  mockedGetCollection.mockResolvedValue(entries as unknown as Awaited<ReturnType<typeof getCollection>>)

const makePost = (overrides: Partial<BlogPost>): BlogPost => ({
  title: "T",
  description: "D",
  publishedAt: "2026-01-01",
  category: "Engineering",
  categorySlug: "engineering",
  tags: ["TypeScript"],
  tagSlugs: ["typescript"],
  draft: false,
  featuredImage: "https://example.com/x.jpg",
  // Entries here use a non-CDN featured image, which the resizer passes straight through.
  cardImage: {
    src: "https://example.com/x.jpg",
    srcSet: undefined,
    sizes: "(min-width: 448px) 320px, calc(100vw - 128px)",
  },
  slug: "slug",
  url: "/blog/slug",
  readingTime: "1 min read",
  ...overrides,
})

describe("loadPublishedPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("normalises entries, drops drafts and sorts newest-first", async () => {
    resolveEntries(
      makeEntry("old", { date: new Date("2025-01-01T00:00:00.000Z") }),
      makeEntry("draft", { draft: true }),
      makeEntry("new", { date: new Date("2026-06-01T00:00:00.000Z") })
    )

    const posts = await loadPublishedPosts()

    expect(posts.map((post) => post.slug)).toEqual(["new", "old"])
    expect(posts[0]).toMatchObject({
      slug: "new",
      url: "/blog/new",
      publishedAt: "2026-06-01",
      categorySlug: "engineering",
      tagSlugs: ["typescript"],
      readingTime: "1 min read",
    })
  })

  it("attaches a pre-resized card banner so components never resize at render time", async () => {
    resolveEntries(makeEntry("a"))

    const [post] = await loadPublishedPosts()

    expect(post?.cardImage).toEqual({
      src: "https://example.com/x.jpg",
      srcSet: undefined,
      sizes: "(min-width: 448px) 320px, calc(100vw - 128px)",
    })
  })

  it("derives updatedAt only when an updatedDate is present", async () => {
    resolveEntries(makeEntry("a", { updatedDate: new Date("2026-02-03T00:00:00.000Z") }), makeEntry("b"))

    const posts = await loadPublishedPosts()
    const bySlug = Object.fromEntries(posts.map((post) => [post.slug, post]))

    expect(bySlug.a?.updatedAt).toBe("2026-02-03")
    expect(bySlug.b && "updatedAt" in bySlug.b).toBe(false)
  })

  it("runs collection validation (rejects duplicate slugs)", async () => {
    resolveEntries(makeEntry("dupe"), makeEntry("dupe"))

    await expect(loadPublishedPosts()).rejects.toThrow(/Duplicate blog post slug/)
  })
})

describe("taxonomy grouping", () => {
  it("groups by category, sorted by label, preserving post order within a group", () => {
    const groups = groupPostsByCategory([
      makePost({ slug: "1", category: "Testing", categorySlug: "testing" }),
      makePost({ slug: "2", category: "Engineering", categorySlug: "engineering" }),
      makePost({ slug: "3", category: "Testing", categorySlug: "testing" }),
    ])

    expect(groups.map((group) => group.slug)).toEqual(["engineering", "testing"])
    expect(groups.find((group) => group.slug === "testing")?.posts.map((post) => post.slug)).toEqual(["1", "3"])
  })

  it("groups by tag and skips a tag whose slug is missing", () => {
    const groups = groupPostsByTag([
      makePost({ slug: "1", tags: ["React", "Astro"], tagSlugs: ["react", "astro"] }),
      makePost({ slug: "2", tags: ["React", "NoSlug"], tagSlugs: ["react"] }),
    ])

    expect(groups.map((group) => group.slug)).toEqual(["astro", "react"])
    expect(groups.find((group) => group.slug === "react")?.posts.map((post) => post.slug)).toEqual(["1", "2"])
  })
})
