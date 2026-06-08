import { isUrlExternal, mergeClasses } from "./utils"

describe("isUrlExternal", () => {
  it.each([
    ["https://example.com", true],
    ["http://example.com", true],
    ["//cdn.example.com", true],
    ["/blog", false],
    ["#section", false],
    ["", false],
  ])("classifies %s as external=%s", (url, expected) => {
    expect(isUrlExternal(url)).toBe(expected)
  })
})

describe("mergeClasses", () => {
  it("merges conditional classes", () => {
    const hidden = false as boolean
    expect(mergeClasses("a", hidden && "b", "c")).toBe("a c")
  })

  it("lets later Tailwind utilities win conflicts", () => {
    expect(mergeClasses("px-2", "px-4")).toBe("px-4")
  })
})
