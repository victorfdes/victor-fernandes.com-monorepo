import { isActivePath, isTypingTarget, navHrefForCode, PRIMARY_NAV } from "utils/nav"

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

describe("navHrefForCode", () => {
  it("resolves a top-row digit code to its destination", () => {
    expect(navHrefForCode("Digit1")).toBe("/")
    expect(navHrefForCode("Digit2")).toBe("/blog")
  })

  it("returns undefined for digits outside the nav", () => {
    expect(navHrefForCode("Digit9")).toBeUndefined()
  })

  it("ignores non-digit and numpad codes", () => {
    expect(navHrefForCode("KeyA")).toBeUndefined()
    // Numpad is intentionally excluded so Windows Alt-code entry can't collide.
    expect(navHrefForCode("Numpad2")).toBeUndefined()
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
