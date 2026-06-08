# 0003 — Turborepo + pnpm workspaces

- Status: Accepted
- Date: 2026-06-04

## Context

The site shares an accessible component library (`@repo/ui`) and standardised tooling (ESLint,
TypeScript) that should be defined once and consumed everywhere. We need fast, cache-aware task
execution and strict dependency hygiene across packages.

## Decision

Use a **pnpm workspace** (`apps/*`, `packages/*`) with internal packages referenced via the
`workspace:*` protocol, orchestrated by **Turborepo** with topological task graphs and content-aware
caching. Shared configuration lives in dedicated packages (`@repo/eslint-config`,
`@repo/typescript-config`) — a single source of truth, never duplicated per app.

Dependency consistency is enforced by **syncpack** (aligned versions, intentional peer ranges) and
dead code/dependencies are surfaced by **knip**.

## Consequences

- Adding an app or package inherits the same strictness for free.
- CI parallelises and caches per task; local and CI runs share the same Turbo graph.
- A little ceremony (changesets, syncpack groups) to keep versions and releases coherent.
