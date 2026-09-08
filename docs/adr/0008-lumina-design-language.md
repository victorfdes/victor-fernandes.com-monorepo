# 0008 — Lumina design language

- Status: Accepted
- Date: 2026-09-08

## Context

The site's original design was a white / `slate-900` canvas with a cyan accent, built from
rounded cards (`.shadow-hover-box`), SVG wave dividers, a cursor-following spotlight, and one
glassmorphic 3D card (`DepthCard`). Three things had gone wrong with it:

1. **Colour was written twice, everywhere.** Twenty-one source files carried raw
   `cyan-*` / `slate-*` / `zinc-*` utilities, each paired with a `dark:` twin. Every new surface
   was an opportunity to pick a slightly different grey, and the doubled declarations were a
   meaningful share of a stylesheet that is inlined into every document.
2. **The motifs had accumulated rather than been chosen.** Cards, waves, a spotlight and a glass
   tilt card were four unrelated ideas competing on the same page.
3. **The accent shared a hue family with the canvas.** Cyan on white/slate reads as tinted
   rather than lit, and gave the page no warm note to key on.

A set of finished artboards (`design-draft/`, Claude Design canvas exports) proposed a coherent
replacement, and the decision was taken to adopt it wholesale rather than partially.

## Decision

Adopt **Lumina**: an editorial, typographic system built from 1px rules.

**Runtime tokens over `dark:` variants.** The palette is declared once as `--vf-*` custom
properties and exposed as Tailwind utilities through `@theme inline`, so each utility emits
`var(--vf-*)` at the use site rather than a baked value. `.dark` re-themes the whole site by
swapping variables. `bg-canvas`, `text-ink-2`, `border-line` and `text-accent` are the only
sanctioned way to name a colour; a raw Tailwind colour utility outside `theme.css` is a defect.

**Hairlines over boxes.** Sections are separated by rules, content sits in two-column splits,
and lists are hairline-separated rows. Radius survives only on pills, tags and media.
Consequently `DepthCard`, `WaveDivider`, `Flashlight` and `.shadow-hover-box` are **deleted**,
not retired — keeping a lone glass surface in a system of rules would read as unresolved.

**A warm accent outside the canvas hue.** Terracotta `#b8461f` on the cool light canvas,
amber `#ff9b74` on the navy night. This is the single idea the rest of the palette is arranged
around.

**A class library, not per-page utilities.** ~24 classes in `@layer components` carry the
grammar (`.shell`, `.section`, `.split`, `.rule-row`, `.rule-grid`, `.display`, `.lede`,
`.eyebrow`, `.pill`, `.tag`, `.wordmark`, …). `SmartButton` composes its shape from `.pill` /
`.icon-pill` rather than restating the geometry, so a hand-styled pill and a rendered one
cannot drift apart.

**Contrast is tested, not trusted.** `packages/ui/src/tokens.test.ts` parses the palette out of
`theme.css` and asserts every text-carrying token against both surfaces, in both themes, at AA.

## Consequences

- **Inlined CSS per page fell from 73,194 B to 49,550 B (−32.3%)**, and home HTML from
  158,619 B to 113,497 B (−28%). Because `astro.config` sets `inlineStylesheets: "always"`,
  that lands directly on LCP. Roughly half the saving is the deletions and half the collapse of
  every `dark:` colour variant into one token-backed declaration.
- **`@repo/ui` ships a major.** `DepthCard`, `WaveDivider` and `Flashlight` are gone, as are
  `.shadow-hover-box`, `.chip-base`, `.text-highlight`, `.secondary-text`, `.border-color` and
  `.background-base`.
- **New code cannot drift**, because there is no raw `cyan-700` left to copy, and the class
  library is the shortest path to a correct-looking page.
- **Two accessibility deviations from the artboards were taken deliberately**, both recorded in
  `design.md`: body links keep their underline (the accent is 1.4:1 against body text, well
  under the 3:1 WCAG 1.4.1 requires before colour may carry a distinction alone), and prose
  headings are not accent-coloured despite being anchors.
- **The token test cannot see element-level opacity.** It passed while the keycap badge's
  `opacity-70` faded a compliant token to 2.9:1; the axe pass in `e2e/a11y.spec.ts` caught that.
  Both nets are needed.
- **A per-brand dot replaced brand-coloured surfaces.** Company wordmarks are painted as CSS
  masks in the page's own ink so a row reads as one accent, with each brand's hue kept to a 7px
  dot. Names stay real text via `sr-only`, since masking never touches the accessibility tree.
- The design artboards are local input, not shipped source, and are gitignored.
