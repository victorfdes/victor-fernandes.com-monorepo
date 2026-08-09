# Architecture Decision Records

This directory captures the significant, hard-to-reverse decisions behind this repository using
lightweight [ADRs](https://adr.github.io/). Each record states the context, the decision, and its
consequences so the _why_ outlives the people who were in the room.

| #                                                     | Title                                    | Status   |
| ----------------------------------------------------- | ---------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)         | Record architecture decisions            | Accepted |
| [0002](0002-astro-with-react-islands.md)              | Astro with React islands                 | Accepted |
| [0003](0003-turborepo-pnpm-workspaces.md)             | Turborepo + pnpm workspaces              | Accepted |
| [0004](0004-strict-typescript-and-type-aware-lint.md) | Strict TypeScript and type-aware linting | Accepted |
| [0005](0005-clean-as-you-code-quality-gates.md)       | Clean-as-you-code quality gates          | Accepted |
| [0006](0006-static-output-on-cloudflare-pages.md)     | Static output on Cloudflare Pages        | Accepted |
| [0007](0007-build-time-blog-image-resizing.md)        | Build-time blog image resizing           | Accepted |

## Writing a new ADR

Copy the format of an existing record, give it the next number, and open it in the PR that makes
the change. Keep records short; supersede rather than rewrite history.
