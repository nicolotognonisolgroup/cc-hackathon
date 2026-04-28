# CLAUDE.md

Convenzioni di progetto per Claude Code. Aggiornare man mano che il team prende decisioni.

## Progetto

- **Hackathon**: Anthropic Claude Code Hackathon — Scenario 5 (Agentic Solution / "The Intake")
- **Dominio**: TBD (candidati: IT helpdesk, sales lead routing)
- **Stack**: TypeScript + Node 20+, `@anthropic-ai/claude-agent-sdk`
- **Backend modello**: AWS Bedrock (login via `aws login --profile bootcamp --region us-east-1`); fallback API key Anthropic se necessario.

## Struttura repo

```
src/             codice agente (coordinator, specialisti, tool)
src/tools/       custom tool definitions (zod schemas)
src/agents/      AgentDefinition di coordinator e subagent
src/hooks/       PreToolUse / PostToolUse / permission callbacks
tests/           unit test (vitest)
evals/           dataset etichettato + harness eval (Scorecard)
decisions/       ADR markdown numerati
docs/            mandate.md e altra documentazione di prodotto
```

## Convenzioni di codice

- TypeScript strict, `noUncheckedIndexedAccess` attivo. Niente `any` se non con commento `// eslint-disable` motivato.
- ESM (`"type": "module"`). Import relativi con estensione `.js`.
- Niente commenti che spiegano il *cosa*; commenti solo per *perché* non ovvi (vincoli, workaround).
- Zod come unica fonte di verità per schemi di tool e di output strutturato. I tipi TS si derivano da Zod (`z.infer`).
- Tool error responses sempre `{ content, isError: true }` con un `code` machine-readable nel content, mai stringhe libere.

## Convenzioni agentiche

- **Coordinator + specialist**: il coordinator non chiama tool di scrittura; instrada a uno specialista.
- **Context passing esplicito**: ogni `Task` riceve solo i campi necessari, niente passaggio implicito.
- **Validation-retry loop**: ogni output strutturato passa per un validatore Zod; al fallimento, il messaggio di errore Zod viene reinserito nel prompt e si ritenta fino a `MAX_RETRIES` (default 2). Logga `retry_count` e `error_type`.
- **Reasoning chain**: ogni decisione logga input → tool calls → output strutturato in JSON line, replayable dal solo log.

## Permissions / hooks

- `PreToolUse` per **stop deterministici** (PII pattern, conti VIP, route bloccate). Hook ≠ prompt: l'ADR-003 spiegherà perché.
- `canUseTool` per **escalation probabilistica**: regola = `categoria + confidence < soglia + impact_bucket`.
- Modalità default in dev: `default` (chiede). Negli eval CI: `bypassPermissions` con tool di scrittura mockati.

## Segreti

- `.env` mai committato (è in `.gitignore`).
- Niente credenziali in log o output del modello. Hook `PostToolUse` per redazione se serve.

## Lingua

- Codice e commenti tecnici in inglese. Documentazione di prodotto (`docs/`, ADR, README) in italiano.

## Comandi utili

```bash
npm install
cp .env.example .env   # poi compilare
npm run smoke          # test connettività backend
npm run typecheck
npm test
```
