# ADR-002: Agent Architecture — 3 Functional Specialists

- **Status**: Accepted
- **Date**: 2026-04-28

## Context

Scenario 5 requires a coordinator plus specialist subagents. Two structural options were considered:

**Option A — Per-category specialists**: one subagent per ticket category (Identity, Network, Hardware, Software, Security, Finance). 6 agents, each with 3–4 category-specific tools.

**Option B — Functional specialists**: 3 subagents grouped by function: Enrichment (read user + KB), Classifier (category + risk), Resolver (write actions).

## Decision

**Option B — 3 functional specialists.**

## Consequences

**Chosen rationale:**
- **+** Clean separation of read/write concerns: Enrichment and Classifier never call write tools; Resolver never makes decisions. This matches the mandate's principle that the coordinator never touches writes.
- **+** Fewer specialists = fewer prompt contexts to maintain and audit.
- **+** The PreToolUse hook can target write tools regardless of which specialist is calling them, because write tools live in a single agent (Resolver).
- **+** Classification logic is centralized: one agent applies all 7 category rules, avoiding duplication.
- **−** A per-category architecture would produce more specialized prompts (e.g., the Identity agent would know all lockout edge cases). This is a real trade-off; we accept it because the coordinator's system prompt captures mandate rules deterministically.

## Alternatives considered

**Per-category specialists (rejected)**: Would require the coordinator to first determine category and then dispatch to the right specialist — creating a bootstrapping problem (classification happens before dispatch). Also doubles the agent count, adding complexity without clear benefit.
