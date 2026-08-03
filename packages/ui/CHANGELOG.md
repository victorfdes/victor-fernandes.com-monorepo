# @repo/ui

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
