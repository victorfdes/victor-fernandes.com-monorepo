# 0005 — Clean-as-you-code quality gates

- Status: Accepted
- Date: 2026-06-04

## Context

Legacy coverage is thin in places, but we want rising quality without a big-bang test-writing effort
that blocks delivery. We also want fast local feedback and a strict, auditable CI.

## Decision

Adopt a **clean-as-you-code** model with layered gates:

- **Local (Lefthook):** pre-commit formats and lints staged files; commit-msg enforces Conventional
  Commits (commitlint); pre-push runs typecheck + tests.
- **CI (GitHub Actions, git-flow):** `format → lint → typecheck → knip → syncpack → test → build →
publint`, plus Playwright + axe e2e and a Lighthouse **performance diff vs `develop`**.
- **SonarCloud** gates _new_ code (≥80% coverage, zero new issues/hotspots) while Vitest enforces a
  global non-regression floor that ratchets upward as tests are added.
- **Supply chain:** least-privilege workflow permissions, SHA-pinned actions (kept current by
  Renovate), CodeQL, dependency-review and OpenSSF Scorecard.

## Consequences

- New work is held to a high bar immediately; existing gaps improve incrementally instead of
  blocking.
- Most issues are caught locally in seconds, not in CI minutes.
- A richer toolchain to maintain, justified by the reference-grade goal.
