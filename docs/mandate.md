# The Mandate — IT Helpdesk Triage Agent

> Product document. One page. Defines the agent's autonomy boundary. Audience: PM, engineering, security, legal.

## What the agent does (one sentence)

It receives a free-text IT support ticket, **classifies** it by category and priority, **enriches** it with CRM and KB context, and produces a **structured decision**: auto-resolve, route to a specific queue, or escalate to a human. Every decision carries a confidence and a replayable reasoning chain.

## Ticket categories

Aligned with ITIL 4 (Incident / Service Request) and the HDI/ServiceNow CSDM convention of categorizing by service area.

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

Internally derived as ITIL **Impact × Urgency** (3×3 matrix), surfaced externally as P1–P4 with the SLA targets below.

| Level | Definition | First-response SLA |
|---|---|---|
| **P1** | Production down, security incident, executive impacted, data loss | 15 min |
| **P2** | Significant impact, multiple users, no workaround | 1 h |
| **P3** | Single user, workaround available | 4–8 h |
| **P4** | Informational, "nice to have" | 1–2 business days |

## What the agent decides on its own

- **Classification** of category + priority for tickets in `identity`, `network`, `hardware`, `software`.
- **Enrichment** via KB lookup and user profile lookup.
- **Routing** to the dedicated queues listed above.
- **Auto-resolution** *only* for the pattern "password reset of a standard, non-privileged, non-frozen user" **and** classification confidence ≥ **0.85**: the agent calls `password_reset` and closes the ticket.

## What always escalates to a human

Any of the following forces `escalation_required: true`:

1. Category is `security` or `finance-systems`.
2. VIP user (flag `is_vip` or role `executive` / `legal` / `finance-lead`).
3. Account in state `frozen` / `disabled` / `under-investigation`.
4. Classification confidence < **0.70**.
5. Estimated monetary impact > **€5,000** (`impact_eur`).
6. Prompt injection attempt detected (see The Brake).
7. Model returns category `other` or fails to disambiguate after 2 retries.

### Confidence tiers

Aligned with industry practice (ServiceNow, Moveworks): action threshold is risk-tiered, not a single value.

| Confidence band | Allowed action |
|---|---|
| `≥ 0.85` | Auto-resolve (only for the password-reset path) |
| `0.70 – 0.85` | Route to a category queue |
| `< 0.70` | Escalate to `q-triage-human` |

## What the agent NEVER touches (deliberately not automated)

- Account creation, termination, or permission changes.
- Read or write access to finance / payroll / HR systems.
- Security incident response (even just "looks like phishing").
- Decisions with legal implications (GDPR, audit, compliance).
- Tickets from executive users — always sent to a human for audit.
- Any write action on accounts in state `frozen` or `disabled`.

> **Why:** these areas concentrate reputational, regulatory, and security risk. The cost of an error far exceeds the value of automation; no latency gain justifies the exposure.

## Measurable goals (Scorecard)

The agent fails review if any of these drops below threshold. Targets are anchored to public benchmarks (ServiceNow Predictive Intelligence, Zendesk AI, OWASP LLM Top 10 / Lakera PINT, Guo et al. 2017 on calibration).

### Quality of decisions

| Metric | Target | Stretch | Notes |
|---|---|---|---|
| Routing accuracy (correct queue) | ≥ 0.85 | 0.92 | Top-1 queue, exact match |
| Priority accuracy (within ±1 level) | ≥ 0.90 | 0.95 | P1↔P2 mistakes count, P1↔P4 are hard fails |
| Auto-resolve correctness | ≥ 0.99 | — | Action is user-visible; floor is high because reversal is costly |
| Containment rate (eligible tickets only) | 60–80% | — | Of password-reset-eligible tickets, share auto-resolved end-to-end |

### Calibration & escalation

| Metric | Target | Notes |
|---|---|---|
| Expected Calibration Error (ECE) | ≤ 0.05 | Guo et al. method; replaces the informal "false-confidence rate" |
| Useful-escalation rate (precision) | ≥ 0.90 | correct-escalations / total-escalations |
| Escalation recall | ≥ 0.90 | escalated-when-should / should-have-escalated |

### Robustness

| Metric | Target | Notes |
|---|---|---|
| Adversarial-pass rate | ≥ 0.95 | Block rate on a fixed corpus: PINT benchmark + 50 hand-crafted helpdesk-specific injections (committed under `evals/adversarial/`). The corpus, not the number, is the artifact — change the corpus → bump the version. |
| Hallucination rate on user-facing replies | ≤ 0.02 | Applies to the password-reset close-out message |

### Business value

| Metric | Target | Notes |
|---|---|---|
| Mean-time-to-triage reduction vs. human baseline | ≥ 30% | The number stakeholders actually ask for. Baseline = current human triage median, sampled from production data. |

## Version

v0.2 — 2026-04-28. Updated targets and confidence tiers against ITIL/ITSM industry benchmarks. Changes tracked in `decisions/`. Modifying the mandate requires a dedicated ADR.
