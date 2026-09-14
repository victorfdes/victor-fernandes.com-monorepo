# @repo/ui

## 3.0.0

### Major Changes

- 6967c35: Replace the card-based design language with Lumina: an editorial system built from 1px rules.

  **Tokens.** The palette is declared once as `--vf-*` custom properties and exposed as Tailwind
  utilities through `@theme inline`, so each utility emits `var(--vf-*)` at the use site and
  `.dark` re-themes the site by swapping variables rather than by a second set of `dark:` rules.
  Use `bg-canvas`, `text-ink`/`ink-2`/`ink-3`/`ink-4`, `border-line`, `text-accent`,
  `text-ok`/`warn`/`neg`. `tokens.test.ts` asserts every text-carrying token clears WCAG AA
  against both surfaces, in both themes.

  **A class library** in `@layer components` carries the grammar: `.shell`, `.section`,
  `.section-head`, `.split` + `.split-4/5/7/8`, `.rule-row`, `.rule-grid`, `.display`,
  `.name-grad`, `.lede`, `.eyebrow`, `.meta`, `.mono-meta`, `.accent-rule`,
  `.rule-dash`, `.pill`, `.pill-accent`, `.cta-rule`, `.icon-pill`, `.tooltip`, `.tag`,
  `.stat-ring`, `.wordmark`. `SmartButton` composes its shape from `.pill`/`.icon-pill` so a hand-styled pill
  and a rendered one cannot drift apart.

  Inlined CSS per page falls 73,194 B → 49,550 B (−32.3%), which lands directly on LCP because the
  stylesheet is inlined into every document.

  BREAKING CHANGES:
  - `DepthCard`, `WaveDivider` and `Flashlight` are removed. Nothing is boxed any more, the page
    lights itself through a fixed `body::before` aurora, and the wave dividers fought the hairline
    grammar hardest.
  - `SmartButton`'s `arrow` prop is removed. The marquee CTA is now a ruled link — use the
    `.cta-rule` class.
  - `.shadow-hover-box`, `.chip-base`, `.text-highlight`, `.secondary-text`, `.border-color` and
    `.background-base` are removed from `theme.css`. Replace with `.tag` and the token utilities
    (`text-accent`, `text-ink-3`, `border-line`, `bg-canvas text-ink`).

### Minor Changes

- ad76a26: Add `DepthCard`, a layered 3D card: an accent face under a white glass sheen with a
  concentric disc stack, which tilts and parallaxes on hover or focus.

  The whole card is themed from one free-form `color` prop — the gradient, title, body, CTA
  and icon tones are mixed from it via `color-mix()` in `theme.css`, so any CSS colour
  works. Action buttons are passed as an array of JSX elements: the card supplies the fixed
  circular chrome and the caller's element keeps its own href or click handler.

  This is a deliberate exception to the documented "minimal and typographic, not
  glassmorphic" aesthetic, scoped to opt-in showcase use. `.shadow-hover-box` remains the
  default card treatment for site chrome.

## 2.0.0

### Major Changes

- abe0155: Keyboard-shortcut keycaps are now always visible; the hold-a-modifier reveal API is gone.

  **Breaking**
  - `KbdShortcutBadge`: removed the `hidden` prop. Badges no longer hide themselves — a
    surface that still wants to hide one should do it from its own styles.
  - `OffCanvas`: removed the `showShortcuts` prop. Keycap badges render whenever a
    `MenuItem` has a `shortcut`.
  - `theme.css`: removed `.shortcut-reveal` and `.shortcut-modifier-active .shortcut-reveal`.

  **Platform glyph**

  `modifierLabel` now ships both glyphs in the markup and lets CSS pick one, so the correct
  modifier survives server rendering with no re-render or reflow: set `shortcut-modifier-option`
  on a document root (before paint) to swap the text label for the ⌥ icon everywhere. Passing
  `modifierLabel="⌥"` to force the icon on a single badge still works.

## 1.1.0

### Minor Changes

- 8bfb771: OffCanvas: `MenuItem` gains optional `shortcut` (renders a keycap badge) and `current`
  (sets `aria-current` + accent) fields, and menu items now animate in with a staggered
  entrance. Also adds an optional `shortcutModifier` prop: when set (e.g. `"Alt"`), the
  keycap badge shows it as a prefix and `aria-keyshortcuts` becomes `"<modifier>+<n>"`.
  Adds a shared `.kbd-key` keyboard-shortcut badge class to `theme.css`.

  SmartButton: adds a public `arrow` prop that renders a trailing arrow chip which slides
  on hover (ignored for icon-only buttons). Restyled to the marquee-CTA treatment — pill
  shape (`rounded-3xl`), a circular icon-only variant, a motion-safe hover lift, and a cyan
  hover glow on the primary and secondary intents.

### Patch Changes

- a2617eb: Add optional OffCanvas props for shortcut badge reveal state and platform-specific display labels.

## 1.0.1

### Patch Changes

- c84927d: Inline the WaveDivider SVG so the UI package no longer depends on website public assets.
