# Design System

The design language, tokens, components, and interactions for
victor-fernandes.com. The single source of truth in code is
[`packages/ui/src/theme.css`](packages/ui/src/theme.css) (Tailwind v4 `@theme` +
`@layer base`); this document explains the intent behind it.

---

## 1. Typography

- **Sans — Mulish** (`--font-sans`). Drives the document font; leans on
  `font-light` / `font-extralight` for an elegant, airy feel.
- **Mono — Fira Code** (`--font-mono`). Code blocks, inline snippets, metadata.
- **Headings** are uppercase, light-weight, and scale responsively:
  - `h1`: `text-4xl lg:text-5xl` · `h2`: `text-3xl lg:text-4xl`
  - `h3`: `text-2xl lg:text-3xl` · `h4`: `text-xl lg:text-2xl`
- Within prose (`.blog-prose`) headings switch to `normal-case` for readability.

## 2. Colour & theming

Dark mode is class-based (`.dark` on `<html>`), toggled from inside the
off-canvas menu and persisted to `localStorage`. An inline head script applies
the stored/`prefers-color-scheme` choice before paint to avoid a flash.

| Element            | Light                | Dark                     |
| ------------------ | -------------------- | ------------------------ |
| Background         | `#ffffff`            | `slate-900` `#0f172a`    |
| Primary text       | `slate-900`          | `gray-300`               |
| Highlight / accent | `cyan-700` `#0e7490` | `cyan-400` `#22d3ee`     |
| Secondary text     | `zinc-500`           | `zinc-400`               |
| Border             | `zinc-300`           | `zinc-700`               |
| Flashlight mask    | `rgba(0,0,0,0.02)`   | `rgba(255,255,255,0.03)` |

Use the semantic helpers rather than raw colours: `.text-highlight`,
`.secondary-text`, `.border-color`, `.background-base`.

## 3. Components (`@repo/ui`)

- **SmartButton** — polymorphic `<button>` / internal `<a>` / external `<a>`
  (auto `target="_blank"` + `rel="noopener noreferrer"`). Intents: `primary`
  (solid slate / cyan), `secondary` (outline), `tertiary` (text). Text buttons
  share the card radius (`rounded-3xl`); icon-only buttons are circles
  (`rounded-full`). On hover, solid/outline buttons cast a cyan shadow-glow and
  lift `-translate-y-0.5` (motion-safe). The opt-in `arrow` prop adds the
  signature trailing arrow chip that slides on hover — reserve it for marquee
  CTAs (the footer "Let's Talk", hero, résumé). Never underlined; icon-only
  usage keeps a screen-reader label.
- **SmartLink** — internal vs external detection, optional external icon, and an
  `sr-only` "(opens in a new tab)" hint for assistive tech.
- **TextInput** — container with optional left/right slots, cyan focus ring.
- **OffCanvas** — right-side menu; `inert` + `aria-hidden` when closed,
  Escape-to-close, optional top slot (the theme toggle). The page scales and
  blurs behind it.
- **`.shadow-hover-box`** — rounded, bordered card; on hover casts a `shadow-2xl`
  (light) or a cyan bloom (dark).

## 4. Motion & motifs

- **Flashlight** — a radial gradient follows the cursor via `--x`/`--y`,
  theme-aware through `--flashlight-color`.
- **Smooth header** — sticky; shrinks `h-20 → h-12` and scales the logo on
  scroll over 300 ms.
- **Wave dividers** — SVG curves (`fill-slate-200` / `dark:fill-cyan-700`) break
  up sections and crown the footer.
- **Buttons** — hover lifts `-translate-y-0.5` with a cyan shadow-glow; the
  `arrow` chip slides `translate-x-1`. Both are gated behind `motion-safe:`.
- All motion respects `prefers-reduced-motion`.

## 5. Prose (`.blog-prose`)

Generous `leading-8`, cyan-accented blockquotes, bordered/rounded tables and
images, and dark code blocks — see the `.blog-prose` rules in `theme.css`.
