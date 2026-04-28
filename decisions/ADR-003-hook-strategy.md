# ADR-003: Hook Strategy — PreToolUse for Hard Stops

- **Status**: Accepted
- **Date**: 2026-04-28

## Context

The mandate defines several conditions that must ALWAYS block write actions:
1. Account state is frozen / disabled / under-investigation
2. User is VIP (is_vip=true) or role is executive / legal / finance-lead
3. Prompt injection score ≥ 0.8 detected in ticket body

Two implementation approaches:

**Option A — Prompt-level instructions**: Add these rules to the coordinator's system prompt. Trust the model to comply.

**Option B — PreToolUse hook (code-level)**: Implement a deterministic function that runs before every write tool call. The model cannot override it.

## Decision

**Option B — PreToolUse hook** for the three conditions above.

The coordinator's system prompt also includes the mandate rules, but as a second layer. The hook is the first layer and is non-negotiable.

## Consequences

**Why a hook is load-bearing here:**
- A prompt-level instruction can be overridden by a sufficiently clever prompt injection in the ticket body. A code-level hook cannot.
- The conditions (frozen account, VIP flag, injection score) are deterministic binary checks, not nuanced judgments. They do not require LLM reasoning.
- The hook runs in the same process as the tool executor, making it impossible to bypass by rephrasing the ticket or changing the conversation context.
- Audit-friendliness: every hook block is logged with the reason, producing a replayable trail.

**Why not use `canUseTool` for everything:**
- `canUseTool` is a soft gate — it can be bypassed by `permissionMode: 'bypassPermissions'`. The PreToolUse hook is more robust.
- `canUseTool` is session-level; the hook is per-call and captures context from the ticket closure.

**What stays in the prompt:**
- The 7 escalation trigger rules from the mandate — these shape the Decision before any write tool is called. The hook is a defense-in-depth backstop, not the first line of defense.
