# Security Policy

## Supported versions

This is a single, continuously deployed application plus its supporting packages.
Only the latest `main` is supported; fixes are rolled forward rather than backported.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately via GitHub's [private vulnerability reporting](https://github.com/victorfdes/victor-fernandes.com-monorepo/security/advisories/new) with the details.

Please include:

- A description of the issue and its impact.
- Steps to reproduce or a proof of concept.
- Affected area (`apps/website`, `@repo/ui`, or tooling/CI) and any relevant versions.

### What to expect

- **Acknowledgement** within 3 business days.
- An assessment and remediation plan within 10 business days.
- Coordinated disclosure once a fix is released — credit is given unless you prefer otherwise.

## Scope

In scope: code in this repository and its build/deploy pipeline. Out of scope: third-party
platforms (Cloudflare, GitHub) themselves — report those to the respective vendor.
