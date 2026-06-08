import { cdnUrl } from "utils/cdn"

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
