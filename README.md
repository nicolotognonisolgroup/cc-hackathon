# cc-hackathon — IT Helpdesk Triage Agent

**Hackathon Scenario 5 — Agentic Solution: "The Intake"**

> 200 IT support requests a day, triaged by hand. This agent handles them.

## What It Does

Incoming free-text IT tickets are classified, enriched with user and knowledge-base context, and routed to one of three outcomes:

| Action | When | Who executes |
|---|---|---|
| **auto-resolve** | Password reset, standard active non-VIP user | ResolverAgent → `password_reset` + `close_ticket` |
| **route** | Identity/Network/Hardware/Software — no escalation trigger | ResolverAgent → `route_to_queue` |
| **escalate** | Any of 7 hard triggers fire | ResolverAgent → `create_escalation` |

Every decision carries a **confidence score**, **impact estimate (EUR)**, and a **replayable reasoning chain** logged as a JSON-line.

---

## Architecture

```
stdin (ticket JSON)
       │
       ▼
  src/index.ts
       │
       ▼
  Coordinator (query() + CLAUDE_CODE_USE_BEDROCK)
  ┌────────────────────────────────────────────┐
  │  System prompt: mandate rules encoded       │
  │  outputFormat: json_schema (Decision)       │
  │  Retry loop: Zod validation × 2            │
  │  PreToolUse hook: hard stops               │
  └─────────────────────────────────────────────┘
       │Task                  │Task               │Task
       ▼                      ▼                   ▼
 EnrichmentAgent        ClassifierAgent      ResolverAgent
 ────────────────        ───────────────      ─────────────
 lookup_user             detect_injection     password_reset*
 check_account_status    estimate_impact      route_to_queue*
 get_ticket_history                           create_escalation*
 search_kb                                    close_ticket*
 get_article
                                       (* PreToolUse hook guards all writes)
```

**Three layers of safety:**
1. **Coordinator system prompt** — encodes the mandate (7 escalation triggers)
2. **Zod `Decision` schema** — runtime validation with `superRefine` (rejects invalid decisions)
3. **PreToolUse hook** — deterministic code-level block for frozen accounts, VIP users, injection >= 0.8

---

## Ticket Categories & Routing

| Category | Auto-resolve? | Always escalate? | Default queue |
|---|---|---|---|
| `identity` | Yes (password reset only) | If VIP / frozen / suspicious | `q-identity` |
| `network` | No | No | `q-network` |
| `hardware` | No | No | `q-hardware` |
| `software` | No | No | `q-software` |
| `security` | No | Yes always | `q-security` |
| `finance-systems` | No | Yes always | `q-finance` |
| `other` | No | Yes always | `q-triage-human` |

---

## Hard Escalation Triggers (from `docs/mandate.md`)

1. Category is `security` or `finance-systems`
2. User `is_vip=true` or role in `[executive, legal, finance-lead]`
3. Account state is `frozen` / `disabled` / `under-investigation`
4. Classification confidence < **0.70**
5. Estimated monetary impact > **5000 EUR**
6. Prompt injection score >= **0.80**
7. Category `other` or ambiguous after 2 retries

---

## Getting Started

### Prerequisites

- Node.js >= 20
- AWS SSO access (profile `bootcamp`, region `us-east-1`)

### Setup

```bash
npm install
cp .env.example .env
# Edit .env: set CLAUDE_CODE_USE_BEDROCK=1, AWS_REGION=us-east-1, ANTHROPIC_MODEL=...

# Refresh AWS credentials
aws login --profile bootcamp --region us-east-1
```

### Run

```bash
# Connectivity test
npm run smoke

# Triage a single ticket
echo '{"ticket_id":"T-001","subject":"Password expired","body":"I cannot log in, my password expired yesterday.","user_id":"u-001"}' | npm start

# Type check
npm run typecheck

# Unit tests
npm test

# Full eval scorecard (35 examples)
npm run eval

# Quick eval (5 labeled + 3 adversarial)
npx tsx evals/run.ts --quick
```

---

## Eval Scorecard (Targets)

| Metric | Target | Description |
|---|---|---|
| Classification Accuracy | >= 85% | Correct category + action + escalation |
| Adversarial Pass Rate | >= 95% | Prompt injection attempts correctly escalated |
| False-Confidence Rate | <= 5% | Confident (>=0.8) AND wrong |
| Useful-Escalation Rate | >= 90% | Correct escalations / total escalations |

Run `npm run eval` to generate `evals/scorecard-latest.json` with actual results.

---

## Project Structure

```
src/
  agents/
    coordinator.ts      Main orchestrator -- retry loop, hooks, Decision validation
    definitions.ts      AgentDefinition for Enrichment, Classifier, Resolver specialists
    mcpServer.ts        In-process MCP server with all 11 tools
  tools/
    userProfile.ts      lookup_user, check_account_status, get_ticket_history
    knowledgeBase.ts    search_kb, get_article
    classification.ts   detect_prompt_injection, estimate_impact
    actions.ts          password_reset, route_to_queue, create_escalation, close_ticket
  hooks/
    preToolUse.ts       Hard stops: frozen account, VIP, injection
  schemas/
    decision.ts         Zod Decision schema (7 superRefine validators)
    ticket.ts           Zod Ticket input schema
    toolSchemas.ts      Zod schemas for all tool inputs/outputs
  data/
    mockDb.ts           11 mock users, 15 KB articles, ticket history
  config.ts             Env loader (Bedrock or direct API)
  index.ts              Entry point -- stdin to triageTicket to stdout
evals/
  fixtures/
    labeled.ts          25 stratified labeled examples (min 3/category)
    adversarial.ts      10 adversarial examples (prompt injection, edge cases)
  scorecard.ts          Metric computation (accuracy, precision, escalation)
  run.ts                Eval harness
decisions/
  ADR-001-stack-and-sdk.md          TypeScript + Bedrock + Zod
  ADR-002-agent-architecture.md     3 functional specialists vs per-category
  ADR-003-hook-strategy.md          PreToolUse hooks vs prompt-level rules
docs/
  mandate.md            Autonomy boundary -- source of truth for agent behavior
```

---

## Key Design Decisions

- **[ADR-001](decisions/ADR-001-stack-and-sdk.md)**: TypeScript + AWS Bedrock -- type safety on tool schemas, no personal API keys
- **[ADR-002](decisions/ADR-002-agent-architecture.md)**: 3 functional specialists -- clean read/write separation, centralized classification
- **[ADR-003](decisions/ADR-003-hook-strategy.md)**: PreToolUse hook for hard stops -- code-level, immune to prompt injection

---

## Claude Code Features Used

| Feature | Where |
|---|---|
| `query()` + async iterator | `src/agents/coordinator.ts` |
| `AgentDefinition` (Task subagents) | `src/agents/definitions.ts` |
| `createSdkMcpServer()` + `tool()` | `src/agents/mcpServer.ts` |
| `options.hooks.PreToolUse` | `src/agents/coordinator.ts` |
| `options.outputFormat` (json_schema) | `src/agents/coordinator.ts` |
| Zod validation-retry loop | `src/agents/coordinator.ts` |
| `/smoke` and `/eval` slash commands | `.claude/commands/` |
| CLAUDE.md with conventions | `CLAUDE.md` |
