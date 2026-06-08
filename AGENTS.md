# AGENTS.md — context for AI agents

This is the Astro + Turborepo source for victor-fernandes.com and its shared UI
library. Read this before making changes; it captures the conventions that are
not obvious from any single file.

## Stack

- **Astro 6** (static output, deployed on Cloudflare Pages) with **React 19** islands.
- **`@repo/ui`** — shared components on **`@base-ui/react` 1.5** + **CVA**.
- **Tailwind CSS v4** via `@tailwindcss/vite`, tokens in `@theme`.
- **TypeScript strict**, **pnpm** workspaces, **Turborepo**.

## Layout

- `apps/website/` — the site. Routes in `src/pages`, chrome in `src/layouts`,
  components in `src/components`, blog in `src/content` + `src/content.config.ts`.
- `packages/ui/` — every reusable primitive. Import from `@repo/ui`; do not
  rebuild buttons/links/inputs inside the app.
- `packages/eslint-config/`, `packages/typescript-config/` — shared tooling.

## Design language (match this exactly)

The aesthetic is **minimal and typographic**, not glassmorphic.

- **Type:** Mulish (`--font-sans`), light/extralight weights, **uppercase
  headings**. Fira Code (`--font-mono`) for code and metadata.
- **Colour:** white / `slate-900` canvas; **cyan-700 (light) / cyan-400 (dark)**
  accents; `zinc` borders and secondary text.
- **Motifs:** `.shadow-hover-box` cards (cyan glow on hover in dark mode), the
  cursor-following `Flashlight`, SVG wave dividers, a scaling sticky header, and
  a right-side off-canvas menu that scales the page behind it.
- **Tokens and base styles live only in `packages/ui/src/theme.css`.** Use the
  semantic classes defined there (`.text-highlight`, `.secondary-text`,
  `.border-color`, `.chip-base`, `.blog-prose`). Do **not** reintroduce ad-hoc
  `bg-primary` / `text-foreground` tokens — they were removed on purpose.

## Rules

1. **Islands:** never use React hooks in `.astro` files. Build a `.tsx`
   component and hydrate it (`client:load` / `client:idle`). There is exactly
   one hydrated root (`AppLayout`) that provides theme context — nest interactive
   pieces inside it rather than creating sibling islands (separate islands do not
   share React context).
2. **Primitives:** style Base UI; don't hand-roll accessibility. New shared
   components go in `packages/ui` with a unit test and a Storybook story.
3. **Tailwind in the library:** classes used only inside `@repo/ui` are emitted
   because `theme.css` has `@source "./**/*.{ts,tsx}"`. Keep that, and keep the
   app's own `@source` in `apps/website/src/styles/global.css`.
4. **Blog data:** go through `src/utils/blog-collection.ts` and the helpers in
   `blog-content.ts` (slugs, reading time, validation). Taxonomy URLs are plural:
   `/blog/categories/<slug>` and `/blog/tags/<slug>`.
5. **React components in `.astro`:** pass `className`, not `class` (the latter is
   silently dropped by React).
6. **TypeScript:** strict(est) + type-aware ESLint. No `@ts-ignore`; prefix
   intentionally-unused symbols with `_`. Prefer fixing a type over `!`/`as`.
   `noUncheckedIndexedAccess` is on, so guard indexed access (`const x = arr[i]; if (!x) …`).
7. **Lint exceptions** are per-line with a justification comment, never blanket-disabled.
   Lint **warnings fail CI** (`--max-warnings=0`).
8. **Hygiene:** keep `pnpm knip` (no dead code / unused deps) and `pnpm syncpack:check`
   (consistent dependency versions) green. Add a `pnpm changeset` when changing a versioned
   package (e.g. `@repo/ui`).

## Before you finish

Run the same gate as CI (Lefthook also runs format+lint pre-commit and typecheck+test pre-push):

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm knip && pnpm syncpack:check && pnpm test && pnpm build && pnpm --filter website e2e
```

`pnpm format` keeps Prettier happy. `apps/website/src/layouts/Layout.astro` is
Prettier-ignored because the plugin cannot parse its inline bootstrap scripts;
keep that file hand-formatted. Commit messages must follow Conventional Commits
(enforced by commitlint).
