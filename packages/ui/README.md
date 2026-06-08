# @repo/ui

The shared component library for victor-fernandes.com. Accessible primitives
built on [`@base-ui/react`](https://base-ui.com) and styled with
[class-variance-authority](https://cva.style) + Tailwind CSS v4.

## Exports

| Export                          | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `SmartButton`                   | Polymorphic button / internal link / external link, with intents  |
| `SmartLink`                     | Internal vs external link with an `sr-only` new-tab hint          |
| `TextInput`                     | Input with optional left/right slots and a cyan focus ring        |
| `OffCanvas`                     | Accessible right-side menu (`inert` when closed, Escape-to-close) |
| `Flashlight`                    | Cursor-following radial spotlight wrapper                         |
| `WaveDivider`                   | SVG wave section divider                                          |
| `mergeClasses`, `isUrlExternal` | Class-merge and URL helpers                                       |
| `./theme.css`                   | Design tokens + base styles (single source of truth)              |

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
