---
"@repo/ui": major
---

Keyboard-shortcut keycaps are now always visible; the hold-a-modifier reveal API is gone.

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
