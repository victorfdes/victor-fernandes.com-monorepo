import { isUrlExternal } from "utils/links"

// `isUrlExternal` decides whether a link gets external treatment (new-tab icon,
// rel="noopener"), so the protocol checks have to be exact.
describe("isUrlExternal", () => {
  it.each(["http://example.com", "https://example.com", "mailto:hi@example.com", "tel:+15551234567"])(
    "treats %s as external",
    (url) => {
      expect(isUrlExternal(url)).toBe(true)
    }
  )

  it.each(["/blog", "/", "blog/post", "#anchor", "./relative"])("treats %s as internal", (url) => {
    expect(isUrlExternal(url)).toBe(false)
  })
})
