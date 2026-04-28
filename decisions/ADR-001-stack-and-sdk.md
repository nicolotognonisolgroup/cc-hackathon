# ADR-001: Stack and SDK

- **Status**: Accepted
- **Date**: 2026-04-28

## Context

Scenario 5 mandates the use of the **Claude Agent SDK**, available in Python and TypeScript. We need to pick a language and a model backend. The hackathon organizers provisioned access to Claude models through **AWS Bedrock** (profile `bootcamp`, region `us-east-1`).

## Decision

- **Language**: TypeScript with `@anthropic-ai/claude-agent-sdk`.
- **Runtime**: Node 20+, ESM.
- **Model backend**: AWS Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`), primary model Claude Sonnet 4 via inference profile.
- **Schema validation**: Zod as the single source of truth for tool inputs and structured outputs.
- **Test**: Vitest for unit tests; a custom harness for evals (Scenario challenge 7).

## Consequences

- **+** Strong typing on tool inputs/outputs through Zod, reducing runtime and parsing errors.
- **+** TypeScript SDK documentation has more examples.
- **+** Bedrock keeps credentials and billing out of the codebase; no `ANTHROPIC_API_KEY` to manage per developer.
- **−** Python's LLM-eval ecosystem is more mature; we will build a small eval harness by hand.
- **−** `interrupt()` and session management APIs are more explicitly documented in Python; the same functionality exists in TS but is less surfaced.

## Alternatives considered

- **Python**: rejected to leverage Zod's type-safety on tool schemas, given that tool design is central to scoring (challenge 3).
- **Direct Anthropic API key**: rejected because it adds a personal-secret dependency; Bedrock is already provisioned for all participants.
