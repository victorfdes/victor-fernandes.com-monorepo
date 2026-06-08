# Contributing

Thanks for taking a look. This repo doubles as a portfolio, so the bar is high —
but the workflow is simple.

## Prerequisites

- **Node 22+** (`.nvmrc` pins 22) and **pnpm 11+** (`corepack enable`).

## Setup

```bash
pnpm install      # also installs Git hooks via Lefthook (see below)
pnpm dev          # site on :4321, Storybook on :6006
```

## Branching (git-flow)

- `develop` is the integration branch — **open PRs against `develop`.**
- `main` is production; it is updated by promoting `develop` and deploys automatically via
  **Cloudflare Pages** on merge.
- Every branch and PR gets a **Cloudflare Pages preview** deployment (a real URL, posted on the PR)
  and a **Lighthouse performance diff vs `develop`** commented inline.

## Local hooks (Lefthook)

Installed automatically on `pnpm install`. They keep feedback in seconds, not CI minutes:

- **pre-commit** — Prettier + ESLint (`--fix`) on staged files.
- **commit-msg** — [Conventional Commits](https://www.conventionalcommits.org/) via commitlint
  (`feat:`, `fix:`, `chore:`, `docs:` …). Allowed scopes live in `commitlint.config.js`.
- **pre-push** — `typecheck` + `test`.

## Workflow

1. Branch off `develop`.
2. Make your change. Keep components in `@repo/ui` when they are reusable; style Base UI primitives
   rather than hand-rolling accessibility.
3. Add/adjust tests:
   - **Unit** (`*.test.tsx`) for component logic and utilities.
   - **Storybook** stories for new UI primitives.
   - **e2e** (`apps/website/e2e`) for user-visible behaviour, including axe accessibility checks.
4. If you changed a versioned package (e.g. `@repo/ui`), add a changeset: `pnpm changeset`.
5. Run the full gate locally (this is what CI runs):

   ```bash
   pnpm format:check
   pnpm lint            # type-aware; warnings fail CI
   pnpm typecheck
   pnpm knip            # dead code / unused deps
   pnpm syncpack:check  # dependency version consistency
   pnpm test            # unit tests + coverage thresholds
   pnpm build
   pnpm --filter website e2e
   ```

   `pnpm format` fixes formatting; `pnpm syncpack:fix` aligns dependency versions.

## Conventions

- **TypeScript strict(est)** — no `@ts-ignore`; prefix intentionally-unused symbols with `_`. Prefer
  fixing the type over asserting (`!`/`as`).
- **Lint exceptions are local and justified** — disable a specific rule on a specific line with a
  reason, never blanket-disable.
- **Coverage ratchets up** — Vitest enforces a per-package floor just below the current baseline
  (see each `vitest.config.ts`). Raise the threshold when you add tests; SonarCloud separately
  requires ≥80% coverage on **new** code.
- **Design tokens** live only in `packages/ui/src/theme.css`. Use the semantic classes
  (`.text-highlight`, `.secondary-text`, `.border-color`, …).
- In `.astro` files, pass `className` (not `class`) to React components, and never use React hooks
  directly in `.astro`.

See [AGENTS.md](AGENTS.md), [design.md](design.md) and the [ADRs](docs/adr/) for deeper context.
