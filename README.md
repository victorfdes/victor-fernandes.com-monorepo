# victor-fernandes.com

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![Base UI](https://img.shields.io/badge/Base_UI-1.5-000000)](https://base-ui.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100-success?logo=lighthouse)](lighthouserc.json)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=victorfdes_victor-fernandes.com-monorepo&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=victorfdes_victor-fernandes.com-monorepo)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=victorfdes_victor-fernandes.com-monorepo&metric=coverage)](https://sonarcloud.io/summary/new_code?id=victorfdes_victor-fernandes.com-monorepo)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/victorfdes/victor-fernandes.com-monorepo/badge)](https://scorecard.dev/viewer/?uri=github.com/victorfdes/victor-fernandes.com-monorepo)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

The source for [victor-fernandes.com](https://victor-fernandes.com) — a personal
portfolio and the shared, accessible UI library that powers it. It is built as a
Turborepo so the website and the component library evolve together with one set
of quality gates.

This repository is intentionally a **reference-quality** codebase: strictest
TypeScript with **type-aware** linting, a single design-token source of truth,
accessibility-first components built on [Base UI](https://base-ui.com), unit +
end-to-end (Playwright + axe) tests, and a clean-as-you-code CI that enforces
formatting, lint, types, dead-code/dependency hygiene, coverage, a **SonarCloud**
quality gate, supply-chain checks (CodeQL · dependency-review · OpenSSF
Scorecard), and a 100/100 Lighthouse budget with a per-PR performance diff.
Decisions are recorded as [ADRs](docs/adr/).

## Architecture

```
.
├── apps/
│   └── website/            Astro 6 site (React islands) → Cloudflare Workers
│       ├── src/pages/      File-based routes (home, blog, resume, contact, …)
│       ├── src/components/ Page-specific React + Astro components
│       ├── src/layouts/    Layout shell, theme provider, app chrome
│       ├── src/content/    Type-safe MDX blog collection
│       └── e2e/            Playwright specs
└── packages/
    ├── ui/                 @repo/ui — shared component library (Base UI + CVA)
    ├── eslint-config/      @repo/eslint-config — flat config (base/react/astro)
    └── typescript-config/  @repo/typescript-config — strict tsconfig base
```

### Why this shape

- **Astro islands** ship zero JavaScript by default; only the interactive pieces
  (header, off-canvas menu, theme toggle, contact card) hydrate as React.
- **One UI library** (`@repo/ui`) owns every primitive. Components wrap Base UI
  for built-in accessibility and are styled with
  [CVA](https://cva.style) — we own the look, not the a11y plumbing.
- **One design system.** All tokens and base styles live in
  [`packages/ui/src/theme.css`](packages/ui/src/theme.css) (Tailwind v4
  `@theme`). The app imports it; nothing is duplicated. See [design.md](design.md).
- **Turborepo** orchestrates and caches `build` / `lint` / `typecheck` / `test`
  across the workspace.

## Quick start

```bash
pnpm install        # Node 22+, pnpm 11+
pnpm dev            # Astro dev server + Storybook
```

| Command          | What it does                                   |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Run the site (`:4321`) and Storybook (`:6006`) |
| `pnpm build`     | Build every package and the static site        |
| `pnpm lint`      | ESLint across the workspace                    |
| `pnpm typecheck` | `astro check` + `tsc --noEmit`                 |
| `pnpm test`      | Vitest unit tests (UI + site)                  |
| `pnpm e2e`       | Playwright end-to-end tests                    |
| `pnpm format`    | Prettier write (`format:check` to verify)      |

## Tech stack

- **Framework:** Astro 6 (static output) with React 19 islands
- **UI:** `@repo/ui` on `@base-ui/react` 1.5 + class-variance-authority
- **Styling:** Tailwind CSS v4 (`@theme` tokens), Mulish + Fira Code
- **Content:** Astro Content Collections + MDX, validated with Zod
- **Tooling:** Turborepo, pnpm workspaces, ESLint 9 (flat), Prettier, Vitest,
  Playwright, Storybook
- **Hosting:** Cloudflare Pages (`@astrojs/cloudflare`)

## Analytics & consent

Google Analytics 4 is wired through Consent Mode and is **off by default**. Set
`PUBLIC_GA_MEASUREMENT_ID` to enable it; with no id the scripts never load and
all tracking calls are no-ops. Event names live in
[`src/utils/analytics-events.ts`](apps/website/src/utils/analytics-events.ts).

## For reviewers

If you are evaluating this repo, the parts worth a look:

- [`packages/ui/src`](packages/ui/src) — polymorphic `SmartButton`/`SmartLink`,
  an accessible `OffCanvas` (focus-safe, `inert` when closed, Escape-to-close),
  each with unit tests and Storybook stories.
- [`packages/ui/src/theme.css`](packages/ui/src/theme.css) — the single design
  token / base-style source consumed by the app.
- [`apps/website/src/utils/blog-content.ts`](apps/website/src/utils/blog-content.ts)
  — dependency-free Markdown heading extraction, slugging, and reading-time, with
  a collection validator that fails the build on duplicate slugs.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — the gate every change
  passes through.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [AGENTS.md](AGENTS.md)
for AI-agent context.

## License

[MIT](LICENSE) © Victor Fernandes
