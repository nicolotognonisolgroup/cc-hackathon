# The Mandate — IT Helpdesk Triage Agent

> Product document. One page. Defines the agent's autonomy boundary. Audience: PM, engineering, security, legal.

## What the agent does (one sentence)

It receives a free-text IT support ticket, **classifies** it by category and priority, **enriches** it with CRM and KB context, and produces a **structured decision**: auto-resolve, route to a specific queue, or escalate to a human. Every decision carries a confidence and a replayable reasoning chain.

## Ticket categories

| Category | Examples | Destination queues |
|---|---|---|
| `identity` | password reset, MFA reset, account lockout | `q-identity`, `q-security` (if suspicious) |
| `network` | VPN, WiFi, latency, connectivity | `q-network` |
| `hardware` | broken laptop, monitor, peripherals | `q-hardware` |
| `software` | license install, application errors | `q-software` |
| `security` | phishing, suspicious activity, malware | `q-security` (always, never auto) |
| `finance-systems` | SAP, payroll, ERP, banking | `q-finance` (always escalated) |
| `other` | unclear or multi-category | `q-triage-human` |

## Priorities

- **P1**: production down, security incident, executive impacted, data loss
- **P2**: significant impact, multiple users, no workaround
- **P3**: single user, workaround available
- **P4**: informational, "nice to have"

## What the agent decides on its own

- **Classification** of category + priority for tickets in `identity`, `network`, `hardware`, `software`.
- **Enrichment** via KB lookup and user profile lookup.
- **Routing** to the dedicated queues listed above.
- **Auto-resolution** *only* for the pattern "password reset of a standard, non-privileged, non-frozen user": the agent calls `password_reset` and closes the ticket.

## What always escalates to a human

Any of the following forces `escalation_required: true`:

1. Category is `security` or `finance-systems`.
2. VIP user (flag `is_vip` or role `executive` / `legal` / `finance-lead`).
3. Account in state `frozen` / `disabled` / `under-investigation`.
4. Classification confidence < **0.70**.
5. Estimated monetary impact > **€5,000** (`impact_eur`).
6. Prompt injection attempt detected (see The Brake).
7. Model returns category `other` or fails to disambiguate after 2 retries.

## What the agent NEVER touches (deliberately not automated)

- Account creation, termination, or permission changes.
- Read or write access to finance / payroll / HR systems.
- Security incident response (even just "looks like phishing").
- Decisions with legal implications (GDPR, audit, compliance).
- Tickets from executive users — always sent to a human for audit.
- Any write action on accounts in state `frozen` or `disabled`.

> **Why:** these areas concentrate reputational, regulatory, and security risk. The cost of an error far exceeds the value of automation; no latency gain justifies the exposure.

## Measurable goals (Scorecard)

The agent fails review if any of these drops below threshold:

- **Classification accuracy** ≥ 0.85 on the eval set
- **Adversarial-pass rate** ≥ 0.95 (no misrouting on prompt injection)
- **False-confidence rate** ≤ 0.05 (confident and wrong)
- **Useful-escalation rate** ≥ 0.90 (correct escalations / total escalations)

## Version

v0.1 — 2026-04-28. Changes tracked in `decisions/`. Modifying the mandate requires a dedicated ADR.
