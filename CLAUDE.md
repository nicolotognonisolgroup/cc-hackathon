# CLAUDE.md

Project conventions for Claude Code. Update as the team makes decisions.

## Project

- **Hackathon**: Anthropic Claude Code Hackathon — Scenario 5 (Agentic Solution / "The Intake")
- **Domain**: IT helpdesk triage (see `docs/mandate.md`)
- **Stack**: TypeScript + Node 20+, `@anthropic-ai/claude-agent-sdk`
- **Model backend**: AWS Bedrock (login via `aws login --profile bootcamp --region us-east-1`); fallback to Anthropic API key if needed.

## Repo layout

```
src/             agent code (coordinator, specialists, tools)
src/tools/       custom tool definitions (zod schemas)
src/agents/      AgentDefinitions for coordinator and subagents
src/hooks/       PreToolUse / PostToolUse / permission callbacks
src/schemas/     shared Zod schemas (Decision, etc.)
tests/           unit tests (vitest)
evals/           labeled dataset + eval harness (Scorecard)
decisions/       numbered markdown ADRs
docs/            mandate.md and other product documentation
```

## Code conventions

- TypeScript strict, `noUncheckedIndexedAccess` on. No `any` unless commented with a clear reason.
- ESM (`"type": "module"`). Relative imports include the `.js` extension.
- No comments that explain *what*; comments only for non-obvious *why* (constraints, workarounds).
- Zod is the single source of truth for tool schemas and structured outputs. TS types are derived from Zod (`z.infer`).
- Tool error responses always `{ content, isError: true }` with a machine-readable `code` field, never a raw string.

## Agent conventions

- **Coordinator + specialists**: the coordinator does not call write tools; it routes to a specialist.
- **Explicit context passing**: each `Task` receives only the fields it needs, no implicit propagation.
- **Validation-retry loop**: every structured output goes through a Zod validator; on failure the Zod error is fed back into the prompt and the call is retried up to `MAX_RETRIES` (default 2). Logs `retry_count` and `error_type`.
- **Reasoning chain**: every decision logs input → tool calls → structured output as JSON-line, replayable from the log alone.

## Permissions / hooks

- `PreToolUse` for **deterministic stops** (PII patterns, VIP accounts, blocked routes). Hook ≠ prompt: ADR-003 will explain why.
- `canUseTool` for **probabilistic escalation**: rule = `category + confidence < threshold + impact_bucket`.
- Default mode in dev: `default` (asks). In CI evals: `bypassPermissions` with write tools mocked.

## Secrets

- `.env` is never committed (in `.gitignore`).
- No credentials in logs or model output. `PostToolUse` hook for redaction if needed.

## Language

- **All repository content in English**: code, comments, docstrings, commit messages, ADRs, `docs/`, `README.md`, `CLAUDE.md`. No Italian in committed files.
- Team conversation may happen in Italian, but anything written to the repo is English.

## Useful commands

```bash
npm install
cp .env.example .env   # then fill in values
npm run smoke          # backend connectivity test
npm run typecheck
npm test
```
