import { USERS } from "../data/mockDb.js";
import { detect_prompt_injection } from "../tools/classification.js";
import type { EscalationReason } from "../schemas/decision.js";

// Write tools that require hard-stop validation before execution.
const WRITE_TOOLS = new Set(["password_reset", "route_to_queue", "create_escalation", "close_ticket"]);

export interface HookResult {
  blocked: boolean;
  reason?: EscalationReason;
  message?: string;
}

// Hard deterministic stop for write tools.
// Called BEFORE any tool that modifies state. Returns immediately on first violation.
// This is not a prompt-level check — it is a code-level invariant that cannot be bypassed by rephrasing.
//
// Blocks if:
//  1. account_state is frozen / disabled / under-investigation
//  2. user is_vip (VIP tickets must always have a human in the loop)
//  3. prompt injection score ≥ 0.8 in ticket body
export function preToolUseHook(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: {
    user_id: string;
    ticket_body: string;
    injection_score?: number;
  },
): HookResult {
  if (!WRITE_TOOLS.has(toolName)) return { blocked: false };

  const user = USERS[context.user_id];
  if (!user) {
    return { blocked: true, reason: "low-confidence", message: `Unknown user '${context.user_id}' — cannot execute write tool safely.` };
  }

  // Frozen / disabled / under-investigation accounts must never be modified automatically.
  if (user.account_state !== "active") {
    return {
      blocked: true,
      reason: "frozen-account",
      message: `Account '${context.user_id}' is in state '${user.account_state}'. Write tools are blocked.`,
    };
  }

  // VIP and executive users always require a human in the loop.
  if (user.is_vip || user.role === "executive" || user.role === "legal" || user.role === "finance-lead") {
    return {
      blocked: true,
      reason: "vip-user",
      message: `User '${context.user_id}' has role '${user.role}' / is_vip=${user.is_vip}. All write actions require human approval.`,
    };
  }

  // Use pre-computed injection score if provided; otherwise re-run detection.
  const injectionScore = context.injection_score ?? (() => {
    const result = detect_prompt_injection({ text: context.ticket_body });
    return "isError" in result ? 0 : result.score;
  })();

  if (injectionScore >= 0.8) {
    return {
      blocked: true,
      reason: "prompt-injection-detected",
      message: `Prompt injection score ${injectionScore.toFixed(2)} ≥ 0.8. All write tools blocked for this ticket.`,
    };
  }

  return { blocked: false };
}
