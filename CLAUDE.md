# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

This is a hackathon submission for the **Anthropic Claude Code Hackathon — Scenario 5 (Agentic Solution / "The Intake")**. The full scenario brief lives at `../claude-code-hackathon/05-agentic-solution.md`; the hackathon README at `../claude-code-hackathon/README.md`.

**Domain**: IT helpdesk triage. The agent classifies inbound IT tickets, enriches them with KB and CRM context, and decides one of: auto-resolve (only password reset for non-privileged users), route to a queue, or escalate to a human. The autonomy boundary is defined in `docs/mandate.md` and is the source of truth for what the agent may and may not do — read it before changing agent behavior or the `Decision` schema.

**Stack**: TypeScript (strict, ESM, Node 20+) on `@anthropic-ai/claude-agent-sdk`, with **AWS Bedrock** as the model backend (login via `aws login --profile bootcamp --region us-east-1`).

## Commands

```bash
npm install
cp .env.example .env             # then fill in values
npm run smoke                    # one-shot Bedrock connectivity test (src/smoke.ts)
npm run dev                      # tsx watch on src/index.ts
npm run typecheck                # tsc --noEmit
npm test                         # vitest run
npm run test:watch               # vitest in watch mode
npx vitest run path/to/file.test.ts -t "test name"   # single test
npm run eval                     # run the eval harness (evals/run.ts) — Scorecard
```

Before running anything that calls the model: `aws login --profile bootcamp --region us-east-1` to refresh AWS SSO credentials. The login persists across shells until the SSO token expires; only the env vars in `.env` are shell-scoped.

## Architecture

The repo is organized around the agentic-architecture and tool-design certification domains. Three load-bearing pieces:

1. **`docs/mandate.md`** — product spec for what the agent is allowed to do. Defines categories (`identity`, `network`, `hardware`, `software`, `security`, `finance-systems`, `other`), priorities (P1–P4), the seven hard escalation triggers, and the deliberately-not-automated list. Any change to agent capability is gated on this file.

2. **`src/schemas/decision.ts`** — Zod schema `Decision` is the single source of truth for the agent's structured output. Its `superRefine` enforces the mandate at validation time:
   - `security` and `finance-systems` always require `escalation_required: true`
   - `auto-resolve` is only legal for `category: identity`
   - `confidence < 0.70` must include `low-confidence` in `escalation_reasons`
   - `action: escalate` requires `escalation_required: true`
   
   These invariants are checked at runtime, not just by the prompt. The `DECISION_JSON_SCHEMA_DESCRIPTION` exported alongside is what gets injected into the coordinator prompt — keep the two in sync.

3. **`src/config.ts`** — env loader. `assertAuthConfigured()` enforces that either `CLAUDE_CODE_USE_BEDROCK=1` is set with `AWS_REGION` and `ANTHROPIC_MODEL`, or `ANTHROPIC_API_KEY` is set. Call it at the entry of any script that talks to the model (see `src/smoke.ts`).

### Planned layout (build into this)

```
src/agents/      AgentDefinitions: coordinator + specialists. Coordinator never calls write tools.
src/tools/       Custom tools (Zod schemas). ~5 per specialist; structured errors with isError + machine code.
src/hooks/       PreToolUse for hard stops; canUseTool for confidence/impact escalation.
evals/           Stratified labeled dataset + adversarial subset; harness produces accuracy,
                 precision-per-category, escalation-rate, false-confidence-rate.
decisions/       ADR-NNN-*.md, numbered. ADR-001 = stack. Add an ADR whenever a load-bearing
                 invariant or boundary changes (mandate, hook-vs-prompt split, schema break).
```

### Agent design conventions

- **Coordinator + specialists** with `Task`. Subagents do *not* inherit coordinator context — pass everything they need explicitly in the Task prompt.
- **Validation-retry loop**: every structured output is parsed by the `Decision` Zod schema. On failure, feed the Zod error message back into the prompt and retry up to `MAX_RETRIES` (default 2). Log `retry_count` and `error_type` per request.
- **Reasoning chain** logged as JSON-line per request: input ticket → tool calls (input + output) → final `Decision`. Every decision must be replayable from the log alone.
- **Hooks vs prompts**: `PreToolUse` hook is a hard deterministic stop (PII patterns, frozen accounts, blocked routes). `canUseTool` callback is the soft escalation rule (`category + confidence + impact_bucket`). The split is load-bearing — prefer adding a hook over tightening a prompt for any constraint that must hold 100% of the time.
- **Tool descriptions** state both what the tool *does* and what it *does not* (input formats, edge cases, example queries). Tool errors are `{ content, isError: true }` with a `code` field, never raw strings.

## Conventions

- TypeScript strict, `noUncheckedIndexedAccess` on, `exactOptionalPropertyTypes` on. No `any` without a comment explaining why.
- Imports include the `.js` extension (ESM resolution).
- Comments explain non-obvious *why*, never *what*. No header comments, no "added for X" notes.
- Zod is the single schema source. Derive TS types via `z.infer`.
- **All committed content in English** (code, comments, ADRs, docs, commit messages). Team conversation may be in Italian; the repo is not.
- Default permission mode in dev: `default` (asks). In CI evals: `bypassPermissions` with write tools mocked.

## What gets judged

The hackathon judges read three files first: `README.md`, `presentation.html`, `CLAUDE.md`. They are deliverables, not afterthoughts — keep them informative as the project evolves. The scoring axes that matter most for this scenario: production-readiness, architecture thinking (ADRs and diagrams), testing depth (adversarial evals, not coverage), and inventive use of subagents/hooks/skills.
