import { isActivePath, isTypingTarget, navHrefForKey, PRIMARY_NAV } from "utils/nav"

describe("PRIMARY_NAV", () => {
  it("starts at Home and numbers items 1..n in order", () => {
    expect(PRIMARY_NAV[0]).toMatchObject({ label: "Home", href: "/", shortcut: 1 })
    expect(PRIMARY_NAV.map((item) => item.shortcut)).toEqual(PRIMARY_NAV.map((_item, index) => index + 1))
  })
})

describe("isActivePath", () => {
  it("matches Home only on the exact root", () => {
    expect(isActivePath("/", "/")).toBe(true)
    expect(isActivePath("/blog", "/")).toBe(false)
  })

  it("matches a section link on its own page and its descendants", () => {
    expect(isActivePath("/blog", "/blog")).toBe(true)
    expect(isActivePath("/blog/some-post", "/blog")).toBe(true)
    expect(isActivePath("/resume", "/blog")).toBe(false)
  })

  it("does not treat a prefix collision as a descendant", () => {
    expect(isActivePath("/blogging", "/blog")).toBe(false)
  })

  it("normalises trailing slashes on both sides", () => {
    expect(isActivePath("/blog/", "/blog")).toBe(true)
    expect(isActivePath("/blog", "/blog/")).toBe(true)
  })
})

describe("navHrefForKey", () => {
  it("resolves a digit to its destination", () => {
    expect(navHrefForKey("1")).toBe("/")
    expect(navHrefForKey("2")).toBe("/blog")
  })

  it("returns undefined for keys outside the nav", () => {
    expect(navHrefForKey("9")).toBeUndefined()
    expect(navHrefForKey("a")).toBeUndefined()
  })
})

describe("isTypingTarget", () => {
  it.each(["input", "textarea", "select"])("treats <%s> as a typing target", (tag) => {
    expect(isTypingTarget(document.createElement(tag))).toBe(true)
  })

  it("treats a contenteditable element as a typing target", () => {
    const editable = document.createElement("div")
    editable.setAttribute("contenteditable", "true")
    expect(isTypingTarget(editable)).toBe(true)
  })

  it("ignores non-editable elements and non-elements", () => {
    expect(isTypingTarget(document.createElement("div"))).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})
