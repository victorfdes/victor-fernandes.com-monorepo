---
"@repo/ui": major
---

Replace the card-based design language with Lumina: an editorial system built from 1px rules.

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
