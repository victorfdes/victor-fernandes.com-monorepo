import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/*
  The palette is declared once, in CSS, and every surface reads it through the `@theme inline`
  utilities. That makes `theme.css` the only place a contrast regression can enter — so this
  test parses the real file rather than a duplicated fixture. Hard-coding the values here would
  let the two drift and prove nothing.

  Lighthouse gates accessibility at 1.0 (see lighthouserc.json), and colour-contrast is one of
  its audits, so a failure here is a failure of the build gate a few minutes later.
*/

// Resolved from the working directory rather than `import.meta.url`: Vite rewrites the latter
// during transform, so it is not a file: URL by the time this runs. Vitest's cwd is the package
// root both locally and under Turbo.
const THEME_CSS_RAW = readFileSync(resolve(process.cwd(), "src/theme.css"), "utf8")

/**
 * Removes `/* … *\/` comments by scanning, so neither a `}` nor a `:` inside prose can truncate
 * a block or masquerade as a declaration. This file's own comments contain both.
 */
function stripComments(css: string): string {
  let out = ""
  let index = 0
  for (;;) {
    const open = css.indexOf("/*", index)
    if (open === -1) return out + css.slice(index)

    out += css.slice(index, open)
    const close = css.indexOf("*/", open + 2)
    if (close === -1) return out

    index = close + 2
  }
}

const THEME_CSS = stripComments(THEME_CSS_RAW)

const SIX_DIGIT_HEX = /^#([\da-f]{6})$/i

/**
 * Pulls the `--vf-*` declarations out of one top-level rule.
 *
 * Located by index rather than by a regex built from `selector`: the blocks sit at the start of
 * a line and contain no nested braces, so a scan to the first `}` is exact — and it sidesteps
 * both the escaping and the backtracking a `[^}]*` pattern would invite.
 */
function readTokens(selector: string): Record<string, string> {
  const start = THEME_CSS.indexOf(`\n${selector} {`)
  if (start === -1) throw new Error(`No "${selector}" block found in theme.css`)

  // From after the opening brace, so the selector's own `:` (as in `:root`) is not read as the
  // first declaration.
  const open = THEME_CSS.indexOf("{", start)
  const close = THEME_CSS.indexOf("}", open)
  if (close === -1) throw new Error(`Unterminated "${selector}" block in theme.css`)

  // Split on the declaration separator rather than matching a pattern: no CSS custom-property
  // value in this block contains a `;`, and an index scan per declaration is unambiguously
  // linear where a `[^;]+` regex only looks like it might not be.
  const tokens: Record<string, string> = {}
  for (const declaration of THEME_CSS.slice(open + 1, close).split(";")) {
    const colon = declaration.indexOf(":")
    if (colon === -1) continue

    const name = declaration.slice(0, colon).trim()
    if (name.startsWith("--vf-")) tokens[name] = declaration.slice(colon + 1).trim()
  }
  return tokens
}

/** WCAG relative luminance. Input must be a 6-digit hex colour. */
function luminance(hex: string): number {
  const digits = SIX_DIGIT_HEX.exec(hex)?.[1]
  if (!digits) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`)

  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((offset) => {
    const value = Number.parseInt(digits.slice(offset, offset + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio, 1–21. */
function contrast(foreground: string, background: string): number {
  const a = luminance(foreground)
  const b = luminance(background)
  const [lighter, darker] = a > b ? [a, b] : [b, a]
  return (lighter + 0.05) / (darker + 0.05)
}

const LIGHT = readTokens(":root")
const DARK = readTokens(".dark")

/*
  Every token that can carry text, against both surfaces it can sit on. `--vf-surface` matters
  as much as `--vf-bg`: it is the footer's background, and it is the darker of the two in light
  mode, so it is where a marginal colour fails first — which is exactly how the artboard's
  original `--vf-ok` was caught.

  `--vf-fg5` is deliberately absent: it is decorative (rules, disabled states) and documented as
  never-text in theme.css.
*/
const TEXT_TOKENS = [
  "--vf-fg",
  "--vf-fg2",
  "--vf-fg3",
  "--vf-fg4",
  "--vf-accent",
  "--vf-accent-hi",
  "--vf-ok",
  "--vf-pos",
  "--vf-neg",
]
const SURFACES = ["--vf-bg", "--vf-surface"]
const PAIRS = TEXT_TOKENS.flatMap((text) => SURFACES.map((surface) => [text, surface] as const))

const AA_NORMAL_TEXT = 4.5

const byName = (a: string, b: string) => a.localeCompare(b)

describe.each([
  ["light", LIGHT],
  ["dark", DARK],
])("%s palette", (_theme, tokens) => {
  it.each(PAIRS)("%s on %s clears WCAG AA for normal text", (text, surface) => {
    const foreground = tokens[text]
    const background = tokens[surface]
    if (!foreground) throw new Error(`${text} is not declared`)
    if (!background) throw new Error(`${surface} is not declared`)

    const ratio = contrast(foreground, background)
    // Rounded for the assertion so a colour landing on exactly 4.5 isn't failed by float noise;
    // the message names the shortfall rather than just reporting "too low".
    expect(
      Number(ratio.toFixed(2)),
      `${text} (${foreground}) on ${surface} (${background}) is ${ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  })

  it("declares the same token names as the light palette", () => {
    // A token defined in one theme and missed in the other silently inherits the light value,
    // which is the failure mode this whole layer exists to prevent.
    expect(Object.keys(tokens).toSorted(byName)).toEqual(Object.keys(LIGHT).toSorted(byName))
  })
})

describe("hairlines", () => {
  it.each(["--vf-line", "--vf-line-soft"])("%s ships pre-alpha'd in both themes", (token) => {
    // Documented in theme.css: stacking an opacity modifier on `border-line` double-fades it.
    // If these ever become opaque hex, that guidance — and the callers — need revisiting.
    expect(LIGHT[token]).toMatch(/^rgba\(/)
    expect(DARK[token]).toMatch(/^rgba\(/)
  })
})
