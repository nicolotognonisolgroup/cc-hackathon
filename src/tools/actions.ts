import {
  PasswordResetInput, PasswordResetOutput,
  RouteTicketInput, RouteTicketOutput,
  CreateEscalationInput, CreateEscalationOutput,
  CloseTicketInput, CloseTicketOutput,
  toolError,
} from "../schemas/toolSchemas.js";
import { USERS } from "../data/mockDb.js";

// SLA in minutes by queue (used for routing confirmation).
const QUEUE_SLA: Record<string, number> = {
  "q-identity": 60, "q-network": 90, "q-hardware": 240,
  "q-software": 120, "q-security": 15, "q-finance": 30, "q-triage-human": 45,
};

// Escalation assignments by reason type.
const ESCALATION_OWNERS: Record<string, string> = {
  "category-restricted": "senior-it-manager",
  "vip-user": "executive-support-lead",
  "frozen-account": "security-team",
  "low-confidence": "l2-triage-analyst",
  "high-impact": "incident-manager",
  "prompt-injection-detected": "security-soc",
  "ambiguous-after-retry": "l2-triage-analyst",
};

// Resets the password for a standard, active, non-privileged user account.
// WRITE operation — blocked by PreToolUse hook for frozen/VIP/restricted accounts.
// Does NOT reset MFA, does NOT unlock disabled accounts, does NOT apply to executives.
// Sends a temporary password to the user's registered email.
export function password_reset(rawInput: unknown): ReturnType<typeof PasswordResetOutput.parse> | ReturnType<typeof toolError> {
  const parsed = PasswordResetInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const user = USERS[parsed.data.user_id];
  if (!user) return toolError(`User not found: ${parsed.data.user_id}`, "USER_NOT_FOUND");

  // Runtime guard — also enforced by PreToolUse hook, but defense-in-depth.
  if (user.account_state !== "active") {
    return toolError(
      `Cannot reset password for account in state '${user.account_state}'. Escalate to human.`,
      "ACCOUNT_NOT_ACTIVE",
    );
  }
  if (user.is_vip) {
    return toolError("Cannot auto-reset password for VIP user. Escalate to executive support.", "VIP_BLOCKED");
  }

  return {
    success: true,
    temporary_password_sent_to: user.email,
    expires_in_minutes: 30,
    ticket_id: parsed.data.ticket_id,
  };
}

// Routes a ticket to the specified helpdesk queue.
// WRITE operation — blocked by PreToolUse hook if the decision is incomplete.
// Does NOT perform any resolution — only routing metadata is set.
// Queue must be one of: q-identity, q-network, q-hardware, q-software, q-security, q-finance, q-triage-human.
export function route_to_queue(rawInput: unknown): ReturnType<typeof RouteTicketOutput.parse> | ReturnType<typeof toolError> {
  const parsed = RouteTicketInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const sla = QUEUE_SLA[parsed.data.queue];
  if (sla === undefined) {
    return toolError(`Unknown queue: ${parsed.data.queue}. Valid queues: ${Object.keys(QUEUE_SLA).join(", ")}`, "UNKNOWN_QUEUE");
  }

  return {
    ticket_id: parsed.data.ticket_id,
    routed_to: parsed.data.queue,
    priority: parsed.data.priority,
    estimated_response_minutes: sla,
  };
}

// Creates a human escalation record for a ticket that cannot be auto-resolved or routed.
// WRITE operation — requires at least one escalation reason code.
// Does NOT close the ticket — call close_ticket separately if needed.
// Does NOT contact the user; notification is handled downstream by the queue system.
export function create_escalation(rawInput: unknown): ReturnType<typeof CreateEscalationOutput.parse> | ReturnType<typeof toolError> {
  const parsed = CreateEscalationInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  // Determine owner from the highest-priority reason code.
  const primaryReason = parsed.data.reasons[0] ?? "low-confidence";
  const assigned_to = ESCALATION_OWNERS[primaryReason] ?? "l2-triage-analyst";

  const escalation_id = `ESC-${parsed.data.ticket_id}-${Date.now()}`;
  const sla = parsed.data.reasons.includes("prompt-injection-detected") ? 5
    : parsed.data.reasons.includes("category-restricted") ? 15
    : 30;

  return { escalation_id, ticket_id: parsed.data.ticket_id, assigned_to, sla_minutes: sla };
}

// Marks a ticket as closed with a resolution summary.
// WRITE operation — only called after a successful auto-resolution.
// Does NOT handle partial resolutions; if any issue remains, route instead.
export function close_ticket(rawInput: unknown): ReturnType<typeof CloseTicketOutput.parse> | ReturnType<typeof toolError> {
  const parsed = CloseTicketInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  return {
    ticket_id: parsed.data.ticket_id,
    status: "closed",
    closed_at: new Date().toISOString(),
  };
}
