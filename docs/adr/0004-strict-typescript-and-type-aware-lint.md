# 0004 — Strict TypeScript and type-aware linting

- Status: Accepted
- Date: 2026-06-04

## Context

A reference codebase should make whole classes of bugs unrepresentable rather than relying on review
to catch them. The baseline `strict` TypeScript and `recommended` ESLint already passed, leaving
room to raise the floor.

## Decision

Adopt the **maximum practical strictness**:

- TypeScript: shared base enables `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noPropertyAccessFromIndexSignature` and `verbatimModuleSyntax`. The app extends
  `astro/tsconfigs/strictest`.
- ESLint: **type-aware** `strictTypeChecked` + `stylisticTypeChecked` via the TypeScript project
  service, plus **SonarJS** for bug patterns and cognitive complexity. Lint **warnings fail CI**
  (`--max-warnings=0`).

A few rules are deliberately tuned with documented rationale (e.g. `consistent-type-definitions` off
because props are modelled as `type` aliases; `sonarjs/updated-loop-counter` off for hand-written
tokenizers). Exceptions are local and justified, never blanket-disabled.

## Consequences

- Real defects surfaced and were fixed during adoption (an unawaited clipboard promise, `any` from
  untyped env access, unsound `as keyof` casts).
- Slightly slower lint (type information required) and occasional friction writing new code — the
  intended trade for correctness.
- Config files and `.astro` markup are scoped out of type-aware rules where the project service
  cannot type them.
