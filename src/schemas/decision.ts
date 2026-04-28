import { z } from "zod";

export const TicketCategory = z.enum([
  "identity",
  "network",
  "hardware",
  "software",
  "security",
  "finance-systems",
  "other",
]);
export type TicketCategory = z.infer<typeof TicketCategory>;

export const Priority = z.enum(["P1", "P2", "P3", "P4"]);
export type Priority = z.infer<typeof Priority>;

export const Queue = z.enum([
  "q-identity",
  "q-network",
  "q-hardware",
  "q-software",
  "q-security",
  "q-finance",
  "q-triage-human",
]);
export type Queue = z.infer<typeof Queue>;

export const Action = z.enum([
  "auto-resolve",
  "route",
  "escalate",
]);
export type Action = z.infer<typeof Action>;

export const EscalationReason = z.enum([
  "category-restricted",
  "vip-user",
  "frozen-account",
  "low-confidence",
  "high-impact",
  "prompt-injection-detected",
  "ambiguous-after-retry",
]);
export type EscalationReason = z.infer<typeof EscalationReason>;

export const Decision = z
  .object({
    ticket_id: z.string().min(1),
    category: TicketCategory,
    priority: Priority,
    queue: Queue,
    action: Action,
    confidence: z.number().min(0).max(1),
    impact_eur: z.number().min(0).nullable(),
    reasoning: z.string().min(20).max(1500),
    escalation_required: z.boolean(),
    escalation_reasons: z.array(EscalationReason),
  })
  .superRefine((d, ctx) => {
    if (d.escalation_required && d.escalation_reasons.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "escalation_required=true but escalation_reasons is empty",
        path: ["escalation_reasons"],
      });
    }
    if (!d.escalation_required && d.action === "escalate") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "action=escalate requires escalation_required=true",
        path: ["action"],
      });
    }
    if (d.action === "auto-resolve" && d.category !== "identity") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "auto-resolve is only allowed for category 'identity' (password reset)",
        path: ["action"],
      });
    }
    if (d.action === "auto-resolve" && d.confidence < 0.85) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "auto-resolve requires confidence >= 0.85 (mandate confidence tiers)",
        path: ["confidence"],
      });
    }
    if (d.confidence < 0.7 && !d.escalation_reasons.includes("low-confidence")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "confidence < 0.7 must include 'low-confidence' in escalation_reasons",
        path: ["escalation_reasons"],
      });
    }
    if ((d.category === "security" || d.category === "finance-systems") && !d.escalation_required) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `category '${d.category}' always requires escalation_required=true`,
        path: ["escalation_required"],
      });
    }
  });

export type Decision = z.infer<typeof Decision>;

export const DECISION_JSON_SCHEMA_DESCRIPTION = `
A triage decision for an IT helpdesk ticket. Required JSON fields:
- ticket_id: string, the input ticket identifier
- category: one of "identity" | "network" | "hardware" | "software" | "security" | "finance-systems" | "other"
- priority: one of "P1" | "P2" | "P3" | "P4"
- queue: one of "q-identity" | "q-network" | "q-hardware" | "q-software" | "q-security" | "q-finance" | "q-triage-human"
- action: one of "auto-resolve" | "route" | "escalate"
- confidence: number in [0, 1]
- impact_eur: number >= 0 or null if unknown
- reasoning: 20-1500 char explanation referencing the inputs and tool outputs
- escalation_required: boolean
- escalation_reasons: array of reason codes (empty only when escalation_required is false)

Constraints enforced by the validator:
- security and finance-systems categories ALWAYS require escalation_required=true
- auto-resolve is permitted only for category "identity" (password reset path) AND confidence >= 0.85
- confidence < 0.70 must include "low-confidence" in escalation_reasons
- action="escalate" requires escalation_required=true

Confidence tiers (mandate v0.2):
- >= 0.85  -> auto-resolve allowed (identity only)
- 0.70 - 0.85 -> route to a category queue
- < 0.70 -> escalate to q-triage-human
`.trim();
