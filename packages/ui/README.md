# @repo/ui

The shared component library for victor-fernandes.com. Accessible primitives
built on [`@base-ui/react`](https://base-ui.com) and styled with
[class-variance-authority](https://cva.style) + Tailwind CSS v4.

## Exports

| Export                          | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `SmartButton`                   | Polymorphic button / internal link / external link, with intents  |
| `SmartLink`                     | Internal vs external link with an `sr-only` new-tab hint          |
| `TextInput`                     | Input with optional left/right slots and an accent focus border   |
| `OffCanvas`                     | Accessible right-side menu (`inert` when closed, Escape-to-close) |
| `KbdShortcutBadge`              | Keyboard-shortcut keycap, platform-aware modifier glyph           |
| `ThemeToggleSwitch`             | Controlled light/dark switch (the consumer owns the state)        |
| `mergeClasses`, `isUrlExternal` | Class-merge and URL helpers                                       |
| `./theme.css`                   | Design tokens, base styles and the class library                  |

## Theme

`theme.css` is the design system. It declares the Lumina palette once and
exposes it as Tailwind utilities through `@theme inline`, so each utility emits
`var(--vf-*)` at the use site and `.dark` re-themes everything by swapping
variables — no `dark:` twin per rule.

Use `bg-canvas`, `text-ink`/`ink-2`/`ink-3`/`ink-4`, `border-line`,
`text-accent`, `text-ok`/`warn`/`neg`. It also ships the editorial class library
(`.shell`, `.section`, `.split`, `.rule-row`, `.rule-grid`, `.display`, `.lede`,
`.eyebrow`, `.pill`, `.tag`, `.stat-ring`, `.wordmark`, …). See
[`design.md`](../../design.md) for the full reference.

`tokens.test.ts` parses the palette out of the stylesheet and asserts every
text-carrying token clears WCAG AA against both surfaces, in both themes.

## Usage

```tsx
import { SmartButton } from "@repo/ui"
import "@repo/ui/theme.css" // once, at the app root
;<SmartButton intent="primary" href="/resume">
  View resume
</SmartButton>
```

The consuming app must let Tailwind scan this package's source so the library's
utility classes are generated — `theme.css` declares `@source "./**/*.{ts,tsx}"`
for exactly that.

## Develop

```bash
pnpm --filter @repo/ui dev          # tsup watch build
pnpm --filter @repo/ui storybook    # component explorer on :6006
pnpm --filter @repo/ui test         # Vitest + Testing Library
```
