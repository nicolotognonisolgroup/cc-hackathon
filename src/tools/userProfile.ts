import { USERS, TICKET_HISTORY, LOGIN_HISTORY } from "../data/mockDb.js";
import {
  LookupUserInput, CheckAccountInput, TicketHistoryInput,
  CheckAccountOutput, TicketHistoryOutput, toolError,
} from "../schemas/toolSchemas.js";
import type { UserProfile } from "../schemas/toolSchemas.js";

// Returns the user profile for a given user_id.
// Does NOT classify tickets, assess risk, or make any decisions.
// Use check_account_status to get real-time login state separately.
export function lookup_user(rawInput: unknown): UserProfile | ReturnType<typeof toolError> {
  const parsed = LookupUserInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const user = USERS[parsed.data.user_id];
  if (!user) return toolError(`User not found: ${parsed.data.user_id}`, "USER_NOT_FOUND");
  return user;
}

// Returns current account state and login statistics.
// Does NOT return profile details — use lookup_user for that.
// Does NOT unlock or modify account state.
export function check_account_status(rawInput: unknown): ReturnType<typeof CheckAccountOutput.parse> | ReturnType<typeof toolError> {
  const parsed = CheckAccountInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const user = USERS[parsed.data.user_id];
  if (!user) return toolError(`User not found: ${parsed.data.user_id}`, "USER_NOT_FOUND");

  const history = LOGIN_HISTORY[parsed.data.user_id] ?? { last_login: null, failed_attempts: 0 };
  return {
    user_id: parsed.data.user_id,
    account_state: user.account_state,
    last_login: history.last_login,
    failed_attempts: history.failed_attempts,
  };
}

// Returns the last N tickets submitted by a user (default 5, max 20).
// Does NOT return ticket body content — only metadata for context.
// Does NOT search across all users; requires an exact user_id.
export function get_ticket_history(rawInput: unknown): ReturnType<typeof TicketHistoryOutput.parse> | ReturnType<typeof toolError> {
  const parsed = TicketHistoryInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const all = TICKET_HISTORY[parsed.data.user_id] ?? [];
  const tickets = all.slice(0, parsed.data.limit);
  return { user_id: parsed.data.user_id, tickets };
}
