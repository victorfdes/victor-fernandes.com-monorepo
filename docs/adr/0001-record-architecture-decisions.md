# 0001 — Record architecture decisions

- Status: Accepted
- Date: 2026-06-04

## Context

This repository is intended to read as a reference implementation. Reviewers should be able to
understand not just _what_ the code does but _why_ it is shaped the way it is, without archaeology
through chat logs or commit messages.

## Decision

We keep short Architecture Decision Records under `docs/adr/`. Each significant, costly-to-reverse
decision gets a numbered record stating context, decision, and consequences. New ADRs are added in
the PR that introduces the change; existing records are superseded rather than edited.

## Consequences

- Decisions are discoverable and reviewable alongside the code.
- A small, ongoing documentation cost per significant change.
- Onboarding (human or AI) starts from durable rationale, not tribal knowledge.
