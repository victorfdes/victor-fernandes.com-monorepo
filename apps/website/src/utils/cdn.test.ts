import { cdnUrl, isCdnAsset } from "utils/cdn"

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

describe("isCdnAsset", () => {
  it("recognises assets on the configured CDN origin", () => {
    expect(isCdnAsset("https://cdn.test.example/images/hero.jpg")).toBe(true)
  })

  it("rejects other origins, so they are never handed to the image pipeline", () => {
    expect(isCdnAsset("https://other.example/hero.jpg")).toBe(false)
  })

  it("rejects the bare origin and empty strings", () => {
    expect(isCdnAsset("https://cdn.test.example")).toBe(false)
    expect(isCdnAsset("")).toBe(false)
  })
})
