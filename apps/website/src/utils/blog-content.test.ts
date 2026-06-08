import {
  addBlogHeadingIds,
  createBlogTaxonomyValue,
  estimateBlogReadingTime,
  extractBlogHeadings,
  filterPublishedBlogPosts,
  slugifyBlogValue,
  validateBlogCollection,
} from "utils/blog-content"

const post = (overrides: Partial<Parameters<typeof validateBlogCollection>[0][number]> = {}) => ({
  slug: "typed-static-blogs",
  category: "Engineering",
  categorySlug: "engineering",
  tags: ["Next.js"],
  tagSlugs: ["next-js"],
  ...overrides,
})

describe("blog content helpers", () => {
  it("normalizes content and taxonomy slugs", () => {
    expect(slugifyBlogValue("Typed Static Blogs")).toBe("typed-static-blogs")
    expect(slugifyBlogValue("...Typed Static Blogs!!!")).toBe("typed-static-blogs")
    expect(createBlogTaxonomyValue("Next.js")).toEqual({ label: "Next.js", slug: "next-js" })
  })

  it("extracts navigation headings and ignores fenced examples", () => {
    const headings = extractBlogHeadings(`
## Start **here**
### [Then link](https://example.com)
### Use \`inline code\`, ![alt text](/image.png), and <span>tags</span>
\`\`\`md
## Not a section
\`\`\`
~~~md
### Not either
~~~
## Start here
`)

    expect(headings).toEqual([
      { id: "start-here", text: "Start here", level: 2 },
      { id: "then-link", text: "Then link", level: 3 },
      { id: "use-inline-code-alt-text-and-tags", text: "Use inline code, alt text, and tags", level: 3 },
      { id: "start-here-1", text: "Start here", level: 2 },
    ])
  })

  it("adds the same unique heading ids to compiled markdown headings", () => {
    type TestNode = {
      type: string
      depth?: number
      value?: string
      children?: TestNode[]
      data?: { hProperties?: { id?: string } }
    }

    const tree: TestNode = {
      type: "root",
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "Start here" }] },
        { type: "heading", depth: 3, children: [{ type: "text", value: "Start here" }] },
        { type: "heading", depth: 4, children: [{ type: "text", value: "Skipped" }] },
      ],
    }

    addBlogHeadingIds()(tree)

    expect(tree.children?.[0]?.data?.hProperties?.id).toBe("start-here")
    expect(tree.children?.[1]?.data?.hProperties?.id).toBe("start-here-1")
    expect(tree.children?.[2]?.data).toBeUndefined()
  })

  it("computes a non-zero reading time without counting code fences", () => {
    expect(estimateBlogReadingTime("Words for a post.\n```ts\nconst noise = true\n```")).toBe("1 min read")
  })

  it("does not count frontmatter or tilde fences in reading time", () => {
    const content = `---
title: Hidden title words
---

Visible words only.
~~~ts
const hidden = "fenced code words"
~~~
`

    expect(estimateBlogReadingTime(content)).toBe("1 min read")
  })

  it("handles long malformed markdown inputs without backtracking-sensitive parsing", () => {
    const longText = "a".repeat(10_000)
    const content = `## [${longText}\n### <${longText}\n## \`${longText}\n\`\`\`ts\n## ${longText}`
    const headings = extractBlogHeadings(content)

    expect(headings).toHaveLength(3)
    expect(estimateBlogReadingTime(content)).toBe("1 min read")
  })

  it("keeps drafts out of public post lists", () => {
    expect(filterPublishedBlogPosts([{ slug: "live" }, { slug: "draft", draft: true }])).toEqual([{ slug: "live" }])
  })

  it("rejects duplicate post slugs", () => {
    expect(() => validateBlogCollection([post(), post()])).toThrow('Duplicate blog post slug "typed-static-blogs"')
  })

  it("rejects category and tag labels that collide after slug normalization", () => {
    expect(() =>
      validateBlogCollection([post(), post({ slug: "second", category: "Engineer-ing", categorySlug: "engineering" })])
    ).toThrow("Blog category labels")

    expect(() =>
      validateBlogCollection([post(), post({ slug: "second", tags: ["Next js"], tagSlugs: ["next-js"] })])
    ).toThrow("Blog tag labels")
  })
})
