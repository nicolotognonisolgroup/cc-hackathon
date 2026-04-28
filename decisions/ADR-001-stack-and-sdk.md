# ADR-001: Stack e SDK

- **Stato**: Accettato
- **Data**: 2026-04-28

## Contesto

Lo Scenario 5 richiede l'uso del **Claude Agent SDK**, disponibile in Python e TypeScript. Va scelto un linguaggio per il progetto e un backend modello. Gli organizer hanno predisposto accesso ai modelli Claude tramite **AWS Bedrock** (profilo `bootcamp`, regione `us-east-1`).

## Decisione

- **Linguaggio**: TypeScript con `@anthropic-ai/claude-agent-sdk`.
- **Runtime**: Node 20+, ESM.
- **Backend modello**: AWS Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`), modello principale Claude Sonnet 4 via inference profile.
- **Schema validation**: Zod come fonte di verità per tool input e output strutturati.
- **Test**: Vitest per unit, harness custom per eval (Scenario challenge 7).

## Conseguenze

- **+** Tipizzazione forte sui tool input/output via Zod, riduce errori di runtime e parsing.
- **+** Documentazione del SDK TypeScript più ricca di esempi.
- **+** Bedrock tiene credenziali e billing fuori dal codice; nessuna `ANTHROPIC_API_KEY` da gestire.
- **−** Ecosistema di librerie eval LLM-specific più maturo in Python; dovremo costruirci un harness di valutazione minimale a mano.
- **−** API `interrupt()` e session management più espliciti in Python; in TS la stessa funzionalità c'è ma è meno documentata.

## Alternative scartate

- **Python**: scartato per sfruttare la type-safety di Zod nei tool schema, dato che il design dei tool è centrale nello scoring (challenge 3).
- **API key Anthropic diretta**: scartata perché aggiunge dipendenza da un secret personale; Bedrock è già configurato per tutti i partecipanti.
