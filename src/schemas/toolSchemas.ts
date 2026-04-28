import { z } from "zod";

// ─── User Profile ────────────────────────────────────────────────────────────

export const AccountState = z.enum(["active", "frozen", "disabled", "under-investigation"]);
export type AccountState = z.infer<typeof AccountState>;

export const UserRole = z.enum([
  "engineer", "analyst", "manager", "executive", "finance-lead", "legal", "admin", "contractor",
]);
export type UserRole = z.infer<typeof UserRole>;

export const UserProfile = z.object({
  user_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRole,
  department: z.string(),
  is_vip: z.boolean(),
  account_state: AccountState,
  manager_id: z.string().nullable(),
});
export type UserProfile = z.infer<typeof UserProfile>;

export const LookupUserInput = z.object({ user_id: z.string().min(1) });
export const LookupUserOutput = z.union([
  UserProfile,
  z.object({ content: z.string(), isError: z.literal(true), code: z.string() }),
]);

export const CheckAccountInput = z.object({ user_id: z.string().min(1) });
export const CheckAccountOutput = z.object({
  user_id: z.string(),
  account_state: AccountState,
  last_login: z.string().nullable(),
  failed_attempts: z.number().int().min(0),
});

export const TicketHistoryInput = z.object({
  user_id: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(5),
});
export const TicketHistoryItem = z.object({
  ticket_id: z.string(),
  subject: z.string(),
  category: z.string(),
  status: z.enum(["open", "closed", "escalated"]),
  created_at: z.string(),
});
export type TicketHistoryItem = z.infer<typeof TicketHistoryItem>;
export const TicketHistoryOutput = z.object({
  user_id: z.string(),
  tickets: z.array(TicketHistoryItem),
});

// ─── Knowledge Base ──────────────────────────────────────────────────────────

export const KbArticle = z.object({
  article_id: z.string(),
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  steps: z.array(z.string()),
  keywords: z.array(z.string()),
});
export type KbArticle = z.infer<typeof KbArticle>;

export const SearchKbInput = z.object({
  query: z.string().min(1).max(300),
  limit: z.number().int().min(1).max(5).default(3),
});
export const SearchKbOutput = z.object({
  query: z.string(),
  articles: z.array(KbArticle),
});

export const GetArticleInput = z.object({ article_id: z.string().min(1) });

// ─── Classification ───────────────────────────────────────────────────────────

export const InjectionCheckInput = z.object({ text: z.string().min(1) });
export const InjectionCheckOutput = z.object({
  score: z.number().min(0).max(1),
  detected: z.boolean(),
  patterns_found: z.array(z.string()),
});

export const EstimateImpactInput = z.object({
  category: z.string(),
  description: z.string().min(1),
  affected_users: z.number().int().min(1).default(1),
});
export const EstimateImpactOutput = z.object({
  impact_eur: z.number().min(0).nullable(),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
});

// ─── Actions (write tools) ────────────────────────────────────────────────────

export const PasswordResetInput = z.object({
  user_id: z.string().min(1),
  ticket_id: z.string().min(1),
});
export const PasswordResetOutput = z.object({
  success: z.boolean(),
  temporary_password_sent_to: z.string(),
  expires_in_minutes: z.number(),
  ticket_id: z.string(),
});

export const RouteTicketInput = z.object({
  ticket_id: z.string().min(1),
  queue: z.string().min(1),
  priority: z.string().min(1),
  notes: z.string().optional(),
});
export const RouteTicketOutput = z.object({
  ticket_id: z.string(),
  routed_to: z.string(),
  priority: z.string(),
  estimated_response_minutes: z.number(),
});

export const CreateEscalationInput = z.object({
  ticket_id: z.string().min(1),
  reasons: z.array(z.string()).min(1),
  category: z.string().min(1),
  impact_eur: z.number().nullable(),
  notes: z.string().optional(),
});
export const CreateEscalationOutput = z.object({
  escalation_id: z.string(),
  ticket_id: z.string(),
  assigned_to: z.string(),
  sla_minutes: z.number(),
});

export const CloseTicketInput = z.object({
  ticket_id: z.string().min(1),
  resolution_summary: z.string().min(10),
});
export const CloseTicketOutput = z.object({
  ticket_id: z.string(),
  status: z.literal("closed"),
  closed_at: z.string(),
});

// ─── Structured tool error (never raw string) ────────────────────────────────

export type ToolError = { content: string; isError: true; code: string };

export function toolError(message: string, code: string): ToolError {
  return { content: message, isError: true, code };
}
