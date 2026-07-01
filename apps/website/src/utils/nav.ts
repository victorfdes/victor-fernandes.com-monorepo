import { MENU_ITEMS } from "./links"

interface NavItem {
  label: string
  href: string
  /** 1-indexed digit that both labels the link and triggers it as a keyboard shortcut. */
  shortcut: number
}

/**
 * The site's primary navigation, in canonical order, shared by the footer, the top nav,
 * and the off-canvas menu so numbering and order can never drift between them. The
 * `shortcut` is the literal key a visitor presses (see `navHrefForKey`): 1 Home, 2 Blog,
 * 3 Resume, 4 Contact.
 */
export const PRIMARY_NAV: readonly NavItem[] = [{ label: "Home", href: "/" }, ...Object.values(MENU_ITEMS)].map(
  (item, index) => ({ ...item, shortcut: index + 1 })
)

// Drop trailing slashes without a backtracking regex (sonarjs/slow-regex), keeping the
// root as "/". A while-reassignment loop, not a counter, so it's fine under the repo's
// disabled updated-loop-counter rule.
const stripTrailingSlash = (path: string): string => {
  let normalised = path
  while (normalised.length > 1 && normalised.endsWith("/")) {
    normalised = normalised.slice(0, -1)
  }
  return normalised
}

/**
 * Whether `href` is the page currently being viewed. A section link (e.g. `/blog`) also
 * matches its descendants (`/blog/post`), while Home matches only the exact root. Trailing
 * slashes are normalised on both sides so `/blog/` and `/blog` compare equal.
 */
export const isActivePath = (currentPath: string, href: string): boolean => {
  const current = stripTrailingSlash(currentPath)
  const target = stripTrailingSlash(href)
  if (target === "/") return current === "/"
  return current === target || current.startsWith(`${target}/`)
}

/**
 * True when a keydown originated from an element the visitor is typing into, so the global
 * digit shortcuts stay inert while filling in the contact form (or any future input).
 */
export const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null

/** Resolve a pressed key ("1".."9") to its nav destination, or `undefined` if it maps to nothing. */
export const navHrefForKey = (key: string): string | undefined =>
  PRIMARY_NAV.find((item) => String(item.shortcut) === key)?.href
