---
"@repo/ui": minor
---

OffCanvas: `MenuItem` gains optional `shortcut` (renders a keycap badge) and `current`
(sets `aria-current` + accent) fields, and menu items now animate in with a staggered
entrance. Also adds an optional `shortcutModifier` prop: when set (e.g. `"Alt"`), the
keycap badge shows it as a prefix and `aria-keyshortcuts` becomes `"<modifier>+<n>"`.
Adds a shared `.kbd-key` keyboard-shortcut badge class to `theme.css`.

SmartButton: adds a public `arrow` prop that renders a trailing arrow chip which slides
on hover (ignored for icon-only buttons). Restyled to the marquee-CTA treatment — pill
shape (`rounded-3xl`), a circular icon-only variant, a motion-safe hover lift, and a cyan
hover glow on the primary and secondary intents.
