---
description: Read SonarCloud and triage/fix open issues (token-free, public API)
allowed-tools: Bash(pnpm sonar*), Bash(node scripts/sonar-issues.mjs*), Read, Edit, Write, Grep, Glob
---

Read the current SonarCloud state for this project and fix what should be fixed.

1. Run `pnpm sonar` to see the quality gate, headline metrics, security hotspots,
   and open issues grouped by rule. Use `pnpm sonar --json` when you want to parse
   the data. This is **token-free** — both the repo and the SonarCloud project are
   public, so reads need no auth or Docker.

2. Triage the open issues and fix the genuine ones in code (e.g. accessibility,
   `useMemo` for context values, `globalThis` over `window`, `codePointAt`,
   `export…from`, stable React keys).

3. **Respect decisions this repo has already made — do not "fix" these:**
   - `typescript:S2310` / `sonarjs/updated-loop-counter` — hand-written
     tokenizers in `apps/website/src/utils/blog-content.ts` legitimately advance
     their own index counter. This rule is deliberately disabled in
     `packages/eslint-config/base.js`; leave these open.
   - `javascript:S1874` on `packages/eslint-config/base.js` — an upstream
     `typescript-eslint` overload deprecation, not our code. Leave it open.
   If you believe one of these should change, ask first.

4. After editing, run the gates and keep them all green:
   `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

5. Summarise: which issues you fixed, which you left open and why. SonarCloud
   re-evaluates on the next CI scan (the `SonarCloud` workflow), so re-running the
   script only reflects changes after that scan completes.
