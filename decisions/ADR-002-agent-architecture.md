# ADR-002: Agent Architecture — 3 Functional Specialists

- **Status**: Accepted
- **Date**: 2026-04-28

## Context

Scenario 5 requires a coordinator plus specialist subagents. Two structural options were considered:

**Option A — Per-category specialists**: one subagent per ticket category (Identity, Network, Hardware, Software, Security, Finance). 6 agents, each with 3–4 category-specific tools.

**Option B — Functional specialists**: 3 subagents grouped by function: Enrichment (read user + KB), Classifier (category + risk), Resolver (write actions).

## Decision

**Option B — 3 functional specialists.**

## Agent Loop Diagram

```
triageTicket(ticket)
      │
      ▼
  query() ──► Claude Code subprocess
      │
      │  [stop_reason: tool_use] ──► Task tool invoked
      │        │
      │        ├──► EnrichmentAgent (Task)
      │        │      prompt includes: full ticket JSON + user_id
      │        │      tools: lookup_user, check_account_status,
      │        │             get_ticket_history, search_kb, get_article
      │        │      returns: enrichment JSON (user profile + KB articles)
      │        │      stop_reason: end_turn → result returned to coordinator
      │        │
      │        ├──► ClassifierAgent (Task)
      │        │      prompt includes: ticket JSON + enrichment result (explicit)
      │        │      tools: detect_prompt_injection, estimate_impact
      │        │      returns: classification JSON (category, priority,
      │        │               confidence, injection_score, impact_eur)
      │        │      stop_reason: end_turn → result returned to coordinator
      │        │
      │        └──► ResolverAgent (Task)  [only if no escalation]
      │               prompt includes: ticket JSON + validated Decision (explicit)
      │               tools: password_reset, route_to_queue,
      │                      create_escalation, close_ticket
      │               stop_reason: end_turn → execution result returned
      │
      │  [stop_reason: end_turn] ──► structured_output extracted (Decision JSON)
      │  [stop_reason: max_turns] ──► error surfaced, Zod retry triggered
      │  [stop_reason: error_*]   ──► error surfaced, Zod retry triggered
      │
      ▼
  Decision.safeParse(raw)
      │
      ├── success ──► logDecision() → return Decision
      └── failure ──► inject Zod error into prompt → retry (max 2)
```

## Context Isolation — What Each Task Prompt Receives

Task subagents do **not** inherit the coordinator's conversation context. Every piece of context needed must be passed explicitly in the Task prompt string.

| Subagent | Receives explicitly in Task prompt |
|---|---|
| EnrichmentAgent | `ticket_id`, `ticket.subject`, `ticket.body`, `ticket.user_id` |
| ClassifierAgent | Full ticket JSON **+ full enrichment JSON** from EnrichmentAgent result |
| ResolverAgent | Full ticket JSON **+ validated Decision JSON** (category, action, queue, escalation_reasons, impact_eur) |

Nothing is assumed to carry over between agents. If it is not in the Task prompt, the subagent does not have it.

## Decision

**Option B — 3 functional specialists.**

## Consequences

**Chosen rationale:**
- **+** Clean separation of read/write concerns: Enrichment and Classifier never call write tools; Resolver never makes decisions. This matches the mandate's principle that the coordinator never touches writes.
- **+** Fewer specialists = fewer prompt contexts to maintain and audit.
- **+** The PreToolUse hook can target write tools regardless of which specialist is calling them, because write tools live in a single agent (Resolver).
- **+** Classification logic is centralized: one agent applies all 7 category rules, avoiding duplication.
- **−** A per-category architecture would produce more specialized prompts (e.g., the Identity agent would know all lockout edge cases). This is a real trade-off; we accept it because the coordinator's system prompt captures mandate rules deterministically.

## stop_reason Handling

| stop_reason | Coordinator behavior |
|---|---|
| `end_turn` | Extract `structured_output` (Decision JSON) → Zod parse |
| `tool_use` | SDK handles internally; coordinator sees final result only |
| `max_turns` | Surfaces as `error_max_turns` subtype → treated as retry trigger |
| `error_during_execution` | Errors array extracted → thrown as Error → Zod retry loop |
| `error_max_structured_output_retries` | Thrown immediately (schema mismatch unrecoverable) |

## Alternatives considered

**Per-category specialists (rejected)**: Would require the coordinator to first determine category and then dispatch to the right specialist — creating a bootstrapping problem (classification happens before dispatch). Also doubles the agent count, adding complexity without clear benefit.
