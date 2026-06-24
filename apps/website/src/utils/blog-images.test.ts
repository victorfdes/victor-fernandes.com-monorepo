import { BLOG_IMAGE_SIZES, BLOG_IMAGE_WIDTHS, blogImage } from "utils/blog-images"

// The CDN origin is supplied by the `astro:env/client` stub aliased in vitest.config.ts.
describe("blogImage", () => {
  it("resolves a default src, a width-spanning srcSet, and sizes for a CDN image", () => {
    const { src, srcSet, sizes } = blogImage("https://cdn.test.example/images/hero.jpg")

    expect(src).toBe("https://cdn.test.example/cdn-cgi/image/width=800,format=webp,quality=80/images/hero.jpg")
    expect(sizes).toBe(BLOG_IMAGE_SIZES)
    // One candidate per configured width, each a transformed WebP URL with its width descriptor.
    expect(srcSet?.split(", ")).toHaveLength(BLOG_IMAGE_WIDTHS.length)
    expect(srcSet).toContain(
      "https://cdn.test.example/cdn-cgi/image/width=400,format=webp,quality=80/images/hero.jpg 400w"
    )
    expect(srcSet).toContain(
      "https://cdn.test.example/cdn-cgi/image/width=1920,format=webp,quality=80/images/hero.jpg 1920w"
    )
  })

  it("leaves a non-CDN source untouched and omits srcSet", () => {
    const { src, srcSet } = blogImage("https://elsewhere.example/hero.jpg")

    expect(src).toBe("https://elsewhere.example/hero.jpg")
    expect(srcSet).toBeUndefined()
  })
})
