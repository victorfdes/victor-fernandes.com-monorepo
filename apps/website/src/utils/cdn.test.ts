import { cdnImage, cdnImageSrcSet, cdnUrl } from "utils/cdn"

// The CDN origin is supplied by the `astro:env/client` stub aliased in vitest.config.ts.
describe("cdnUrl", () => {
  it("joins an asset path onto the configured CDN origin", () => {
    expect(cdnUrl("i/victor-fernandes.jpg")).toBe("https://cdn.test.example/i/victor-fernandes.jpg")
  })

  it("tolerates a leading slash on the path", () => {
    expect(cdnUrl("/i/victor-fernandes.jpg")).toBe("https://cdn.test.example/i/victor-fernandes.jpg")
  })

  it("supports nested asset paths", () => {
    expect(cdnUrl("i/avatars/victor.png")).toBe("https://cdn.test.example/i/avatars/victor.png")
  })
})

describe("cdnImage", () => {
  it("rewrites a CDN URL through Cloudflare Image Transformations", () => {
    expect(cdnImage("https://cdn.test.example/images/hero.jpg", { width: 480 })).toBe(
      "https://cdn.test.example/cdn-cgi/image/width=480,format=auto,quality=80/images/hero.jpg"
    )
  })

  it("honours a custom quality", () => {
    expect(cdnImage("https://cdn.test.example/images/hero.jpg", { width: 800, quality: 60 })).toBe(
      "https://cdn.test.example/cdn-cgi/image/width=800,format=auto,quality=60/images/hero.jpg"
    )
  })

  it("passes through URLs that are not on the CDN origin", () => {
    expect(cdnImage("https://other.example/hero.jpg", { width: 480 })).toBe("https://other.example/hero.jpg")
    expect(cdnImage("", { width: 480 })).toBe("")
  })
})

describe("cdnImageSrcSet", () => {
  it("builds a width-descriptor srcset over the given widths", () => {
    expect(cdnImageSrcSet("https://cdn.test.example/images/hero.jpg", [400, 800])).toBe(
      "https://cdn.test.example/cdn-cgi/image/width=400,format=auto,quality=80/images/hero.jpg 400w, " +
        "https://cdn.test.example/cdn-cgi/image/width=800,format=auto,quality=80/images/hero.jpg 800w"
    )
  })

  it("returns undefined for non-CDN sources so callers can omit srcset/sizes", () => {
    expect(cdnImageSrcSet("https://other.example/hero.jpg", [400, 800])).toBeUndefined()
  })
})
