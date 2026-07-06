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
  headings**. The platform monospace stack (`--font-mono`) for code and metadata.
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

## Testing & coverage

Coverage is a side effect of testing the right things, not a target to chase. The
rules that keep it honest on every push:

1. **New logic ships with a test, same PR.** Any module with real behaviour —
   utilities, endpoints (`feed.xml.ts`), providers (`ThemeProvider`), the consent
   state machine (`utils/analytics.ts`), interactive components — gets a unit test
   next to it (`*.test.ts(x)`). This is Rule 2 (every `@repo/ui` primitive needs a
   test) extended to app logic.
2. **Coverage counts vitest/v8 only.** Pure-presentational components (banners,
   `Testimonials`, `resume/*`, blog list/taxonomy/MDX renderers, `AppLayout`,
   the footer status chips `Footer/SonarStatus`/`Footer/ScorecardStatus`,
   `ui` `Flashlight`/`ThemeToggle`) are validated by **Playwright e2e**, not units,
   and are listed in `coverage.exclude` (both `vitest.config.ts`) and
   `sonar.coverage.exclusions`. Don't write hollow render tests to lift the number;
   if a file is genuinely presentational, exclude it (and keep the two lists in
   sync). If you give it logic, delete the exclusion and test it. The _logic_ those
   chips lean on (`utils/system-status.ts`) is unit-tested — the exclusion is for
   the markup, not an excuse to skip the behaviour.
3. **Floors ratchet up, never down.** Each package's `thresholds` sit just under
   its measured baseline. When you add tests, raise them. **Never lower a threshold
   to make a push pass** — that's the one move this repo doesn't allow.
4. **New code must clear 80%.** SonarCloud gates **new** code at ≥80% coverage;
   the local floors are enforced by `pnpm test` (Lefthook pre-push and CI).
5. **Test behaviour, not prose.** Query by role/text; assert what the user gets.
   Blog/page tests are page-behavioural — they check pages render and work, and
   never assert a specific post's words or counts, so content can change freely.

## Reading SonarCloud

The repo and its [SonarCloud project](https://sonarcloud.io/project/overview?id=victorfdes_victor-fernandes.com-monorepo)
are both public, so reads need **no token and no Docker**. `pnpm sonar` prints the
quality gate, headline metrics, hotspots, and open issues grouped by rule
(`pnpm sonar --json` for machine output); it reads the project key from
`sonar-project.properties`. The `/sonar` Claude command wraps this to triage and
fix issues. CI re-scans on push via the `SonarCloud` workflow, so the script only
reflects fixes after that scan runs.

Two open issues are **left open on purpose** — don't "fix" them:

- `typescript:S2310` (×4, `blog-content.ts`) — hand-written tokenizers
  legitimately advance their own index counter; the equivalent
  `sonarjs/updated-loop-counter` is disabled in `packages/eslint-config/base.js`.
- `javascript:S1874` (×1, `packages/eslint-config/base.js`) — an upstream
  `typescript-eslint` overload deprecation, not our code.

## Before you finish

Run the same gate as CI (Lefthook also runs format+lint pre-commit and typecheck+test pre-push):

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm knip && pnpm syncpack:check && pnpm test && pnpm build && pnpm --filter @repo/ui lint:publish && pnpm --filter website e2e
```

`pnpm format` keeps Prettier happy. `apps/website/src/layouts/Layout.astro` is
Prettier-ignored because the plugin cannot parse its inline bootstrap scripts;
keep that file hand-formatted. Commit messages must follow Conventional Commits
(enforced by commitlint).
