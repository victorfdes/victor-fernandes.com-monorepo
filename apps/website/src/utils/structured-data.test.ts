import { buildBlogPostingSchema, buildPersonSchema, buildWebSiteSchema } from "utils/structured-data"

describe("buildBlogPostingSchema", () => {
  const input = {
    url: "https://victor-fernandes.com/blog/typed-static-blogs",
    title: "Typed static blogs",
    description: "How the blog stays typed end to end.",
    image: "https://r2.victor-fernandes.com/i/cover.jpg",
    datePublished: "2026-01-02",
  }

  it("emits a BlogPosting with the schema.org context and core article fields", () => {
    const schema = buildBlogPostingSchema(input)
    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("BlogPosting")
    expect(schema.headline).toBe(input.title)
    expect(schema.description).toBe(input.description)
    expect(schema.image).toBe(input.image)
    expect(schema.datePublished).toBe(input.datePublished)
    expect(schema.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": input.url })
    expect(schema.author).toMatchObject({ "@type": "Person", name: "Victor Fernandes" })
  })

  it("defaults dateModified to datePublished when no update date is given", () => {
    expect(buildBlogPostingSchema(input).dateModified).toBe(input.datePublished)
  })

  it("uses the provided update date when present", () => {
    const schema = buildBlogPostingSchema({ ...input, dateModified: "2026-03-04" })
    expect(schema.dateModified).toBe("2026-03-04")
  })
})

describe("buildPersonSchema", () => {
  it("emits a Person with a job title and social profiles in sameAs", () => {
    const schema = buildPersonSchema()
    expect(schema["@type"]).toBe("Person")
    expect(schema.jobTitle).toBeTruthy()
    expect(schema.sameAs.length).toBeGreaterThan(0)
    expect(schema.sameAs.every((url) => url.startsWith("https://"))).toBe(true)
  })
})

describe("buildWebSiteSchema", () => {
  it("emits a WebSite pointing at the canonical origin", () => {
    const schema = buildWebSiteSchema()
    expect(schema["@type"]).toBe("WebSite")
    expect(schema.url).toMatch(/^https:\/\//)
    expect(schema.description).toBeTruthy()
  })
})
