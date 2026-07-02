import { MENU_ITEMS } from "./links"

interface NavItem {
  label: string
  href: string
  /** 1-indexed digit that labels the link and, combined with {@link SHORTCUT_MODIFIER}, triggers it. */
  shortcut: number
}

/**
 * Modifier required alongside the digit to fire a nav shortcut (see `navHrefForCode`).
 * A bare digit is a printable character, so a document-wide "press 2 for Blog" fails
 * WCAG 2.1.4 (Character Key Shortcuts) — a speech-input user can trigger it by accident.
 * Gating on Alt (a non-printable key) meets the criterion's "remap" exception. Shift is
 * deliberately not used: Shift+2 still produces a printable "@". Ctrl/Cmd are avoided
 * because the browser already binds them to tab switching.
 */
export const SHORTCUT_MODIFIER = "Alt"
const SHORTCUT_MODIFIER_SYMBOL = "⌥"

export const shortcutModifierLabelForPlatform = (platform: string | undefined): string =>
  /(?:Mac|iPhone|iPad|iPod)/i.test(platform ?? "") ? SHORTCUT_MODIFIER_SYMBOL : SHORTCUT_MODIFIER

export const shortcutModifierNameForLabel = (label: string): string =>
  label === SHORTCUT_MODIFIER_SYMBOL ? "Option" : SHORTCUT_MODIFIER

/**
 * The site's primary navigation, in canonical order, shared by the footer, the top nav,
 * and the off-canvas menu so numbering and order can never drift between them. The
 * `shortcut` is the digit a visitor presses together with {@link SHORTCUT_MODIFIER} (see
 * `navHrefForCode`): 1 Home, 2 Blog, 3 Resume, 4 Contact.
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

/**
 * Resolve a keydown's physical `event.code` (e.g. `"Digit2"`) to its nav destination, or
 * `undefined` if it maps to nothing. Matching the code rather than `event.key` is what
 * makes the shortcut work while {@link SHORTCUT_MODIFIER} is held: on macOS, Option+2
 * rewrites `event.key` to a symbol, but `event.code` stays `"Digit2"`. Only the top-row
 * `Digit*` keys are honoured — `Numpad*` is left alone so Windows Alt-code entry
 * (Alt + numpad digits) can't collide.
 */
export const navHrefForCode = (code: string): string | undefined => {
  const digit = /^Digit([1-9])$/.exec(code)?.[1]
  return digit === undefined ? undefined : PRIMARY_NAV.find((item) => String(item.shortcut) === digit)?.href
}
