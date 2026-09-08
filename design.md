# Design System — Lumina

The design language, tokens, components, and interactions for
victor-fernandes.com. The single source of truth in code is
[`packages/ui/src/theme.css`](packages/ui/src/theme.css) (Tailwind v4 `@theme` +
`@layer base` + `@layer components`); this document explains the intent behind
it. Every class listed here is rendered live at [`/design`](apps/website/src/pages/design.astro).

The aesthetic is **editorial and typographic**: the page is built from 1px rules,
two-column splits and hairline-separated rows. There are no cards. Radius appears
only on pills (999px), tags (4px) and media (6–8px).

---

## 1. Typography

- **Sans — Mulish** (`--font-sans`), self-hosted via Fontsource. Light and
  extralight weights carry the page; `font-medium` marks the one stressed word.
- **Mono — platform monospace stack** (`--font-mono`, no bundled webfont).
  Addresses, handles and code. Monospace is semantic here: it marks a value meant
  to be read character by character or copied.
- **Headings** are uppercase and light. Within prose (`.blog-prose`) they switch
  to `normal-case` for readability.
- Numerals are `tabular-nums` wherever they sit in a column or change in place.

## 2. Colour and theming

Dark mode is class-based (`.dark` on `<html>`), toggled from inside the
off-canvas menu and persisted to `localStorage`. An inline head script applies
the stored / `prefers-color-scheme` choice before paint, so nothing flashes.

**The palette is exposed as Tailwind utilities through `@theme inline`.** That is
the load-bearing decision: each utility emits `var(--vf-*)` at the use site
instead of a baked value, so `.dark` re-themes the site by swapping variables
rather than by a second set of `dark:` rules. One declaration per rule.

Reach for `bg-canvas`, `text-ink-2`, `border-line`, `text-accent`. **A raw
Tailwind colour utility has no place outside `theme.css`.**

| Utility              | Light                      | Dark                        | Role                             |
| -------------------- | -------------------------- | --------------------------- | -------------------------------- |
| `canvas`             | `#f3f8ff`                  | `#071426`                   | Page ground                      |
| `surface`            | `#edf5ff`                  | `#10233e`                   | Footer, fields, raised media     |
| `chip`               | `#dfeafa`                  | `rgba(171,202,238,.08)`     | Hover fills, keycaps             |
| `ink`                | `#0b1c33`                  | `#f2f8ff`                   | Primary text                     |
| `ink-2`              | `#3f5570`                  | `#b6c8dc`                   | Body copy, `.lede`               |
| `ink-3`              | `#55697f`                  | `#a0b3c9`                   | Labels, metadata                 |
| `ink-4`              | `#596c85`                  | `#8497ad`                   | Section indices, quietest text   |
| `ink-5`              | `#aabdd6`                  | `#6b7c93`                   | **Decorative only — never text** |
| `line` / `line-soft` | `rgba(72,101,139,.28/.16)` | `rgba(171,202,238,.22/.13)` | Every hairline                   |
| `accent`             | `#b8461f`                  | `#ff9b74`                   | Links, marks, the one warm note  |
| `accent-hi`          | `#8f3413`                  | `#ffc35c`                   | Hover                            |
| `ok` / `pos`         | `#167a5a`                  | `#4ecfa4`                   | Stat rings, passing states       |
| `warn`               | `#8a5a00`                  | `#f0b45c`                   | Middling ratings                 |
| `neg`                | `#b93a51`                  | `#f0899b`                   | Failing states                   |

The accent deliberately sits **outside the canvas hue family**. Warm-on-cool is
what makes the page read as lit rather than tinted, and it is the single idea the
rest of the palette is arranged around.

### Contrast is enforced, not assumed

[`packages/ui/src/tokens.test.ts`](packages/ui/src/tokens.test.ts) parses the
palette out of `theme.css` and asserts every text-carrying token against **both**
surfaces it can land on, in both themes, at WCAG AA (4.5:1). It caught the
artboard's original green at 4.45:1 on `--vf-surface` — exactly where the
footer's stat rings sit.

Two standing constraints:

- `--vf-ok` (light) clears AA by under a tenth. It is reserved for the large,
  bold stat rings and must be re-checked if ever darkened.
- `--vf-line` ships **pre-alpha'd**. Never stack an opacity modifier on
  `border-line` — it double-fades.

A token test cannot see opacity applied at the element, so the axe pass in
`e2e/a11y.spec.ts` is the second net. It is what caught the keycap badge's
`opacity-70` fading a compliant token to 2.9:1.

### The page aurora

`--vf-page-bg` is three soft radial lights over a diagonal wash, painted once on
a **fixed `body::before`** — never `background-attachment: fixed`, which repaints
the gradient on every scroll frame and is a well-known mobile scroll trap. The
flat `--vf-bg` sits on `<html>` beneath it as the fallback and overscroll colour.

## 3. The class library (`@layer components`)

The grammar is declared once rather than respelled as utilities on every page.
This is measured in bytes: the stylesheet is inlined into every document
(`inlineStylesheets: "always"`), so reuse here lands directly on LCP.

### Layout & rhythm

| Class                       | Role                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.shell`                    | The one horizontal measure — 80rem cap, viewport-scaled gutter. Header, `<main>` and footer share it.                                                                   |
| `.section`                  | Hairline above, generous air around. Consecutive sections share one rule.                                                                                               |
| `.section-head`             | The `01  EYEBROW` row, on a shared baseline.                                                                                                                            |
| `.split` + `.split-4/5/7/8` | The recurring two-column split. The weights carry `min-width: 0`, without which a long word refuses to shrink.                                                          |
| `.rule-row`                 | One entry in a hairline-separated list.                                                                                                                                 |
| `.rule-grid`                | The same treatment as a self-breaking grid; `row-gap: 0` plus equal rows above 48rem make the rules line up across columns. Tune the wrap point with `--rule-grid-min`. |

### Typography

| Class                         | Role                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.display`                    | The page's opening statement, `clamp(2.5rem, 9vw, 4.75rem)`.                                                                                                     |
| `.name-grad`                  | Gradient-filled wordmark. The flat colour is the base; the gradient layers on only under `@supports (background-clip: text)`, so the heading is never invisible. |
| `.lede`                       | The 18px/1.75 standing-text paragraph.                                                                                                                           |
| `.eyebrow` / `.eyebrow-index` | Section label and its counter. The 0.34em tracking is the effect, not decoration.                                                                                |
| `.meta` / `.mono-meta`        | Dates and locations; addresses and handles.                                                                                                                      |

### Marks

| Class                         | Role                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.accent-rule` / `.rule-dash` | The 64px accent hairline; the 24px bullet dash.                                                                                                                                                              |
| `.pill` / `.pill-accent`      | The one raised shape, reserved for actions. `SmartButton` composes its intents from these, so a hand-styled pill and a rendered one cannot drift. `.pill-accent` is colour only — size comes from utilities. |
| `.cta-rule`                   | The marquee CTA: a ruled link with a trailing arrow.                                                                                                                                                         |
| `.icon-pill`                  | Circular icon action, sized by `--icon-pill-size`.                                                                                                                                                           |
| `.tag`                        | 4px-radius label. Softened, but never enough to read as a pill.                                                                                                                                              |
| `.stat-ring`                  | A score in a ring.                                                                                                                                                                                           |
| `.wordmark`                   | A logo as text — masked in `currentColor` so a row reads as one accent, with the name as `sr-only` text that masking never touches.                                                                          |
| `.kbd-key`                    | Keyboard-shortcut keycap.                                                                                                                                                                                    |

## 4. Components (`@repo/ui`)

- **SmartButton** — polymorphic `<button>` / internal `<a>` / external `<a>`
  (auto `target="_blank"` + `rel="noopener noreferrer"`). Shape from
  `.pill` / `.icon-pill`; intents (`primary` filled, `secondary` outline,
  `tertiary` text) supply colour only, each a single set of classes with no
  `dark:` twin. Icon-only usage keeps a screen-reader label.
- **SmartLink** — internal vs external detection, optional external icon, and an
  `sr-only` "(opens in a new tab)" hint. Carries no colour of its own; it
  inherits the base `a` rule.
- **TextInput** — container with optional left/right slots. Keeps the 6px tag
  radius rather than the pill: a field is a surface to fill, not an action.
- **OffCanvas** — right-side menu; `inert` + `aria-hidden` when closed,
  Escape-to-close, closes on navigation, optional top slot (the theme toggle).
  The page scales and blurs behind it.
- **KbdShortcutBadge** — the keycap shared by header, footer and off-canvas.

App-level, in `apps/website/src/components`:

- **PageHero** — the two-line gradient heading, accent rule and tagline every
  top-level page opens with. Both columns are addressable (`aside` and children),
  and `emphasis`/`tagline` are optional for one-word pages.
- **SectionHead** — the numbered eyebrow. The index is `aria-hidden`: read aloud
  it would prefix every landmark with a number meaningless without the layout.

## 5. Motion

Restrained by design. What is left:

- **Header** — sticky; shrinks `h-20 → h-12.5` and scales the logo over 300 ms.
- **Hover** — colour and border transitions at 200 ms; the `.cta-rule` arrow
  nudges 4px, gated behind `prefers-reduced-motion`.
- **Off-canvas** — the panel slides in; the page scales and blurs behind it.
- All motion respects `prefers-reduced-motion`.

Removed with the redesign: the wave dividers, the cursor-following flashlight,
the `.shadow-hover-box` bloom, and DepthCard's 3D tilt. See
[ADR 0008](docs/adr/0008-lumina-design-language.md).

## 6. Prose (`.blog-prose`)

Generous `leading-8`, accent-ruled blockquotes, bordered tables and images, and
code blocks that stay dark in both themes (highlighting is authored against a
dark ground; theming it would mean a second palette to keep legible).

Two rules worth knowing:

- **Body links keep their underline.** This departs from the artboards' blanket
  `text-decoration: none`. In running prose the accent is the only cue separating
  a link from its surroundings, and `--vf-accent` against `--vf-fg2` is 1.4:1 —
  far below the 3:1 WCAG 1.4.1 requires before colour may carry a distinction
  alone. Nav, footer, card and pill links opt out with `no-underline`, where
  shape and position already do that work.
- **Prose headings are not accent-coloured.** They wrap their text in an anchor
  for the `#` deep link, which would otherwise make every heading read as a link.
  The accent arrives on hover, where the affordance is.
