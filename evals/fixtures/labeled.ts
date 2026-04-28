import type { Ticket } from "../../src/schemas/ticket.js";
import type { Decision } from "../../src/schemas/decision.js";

export type LabeledExample = {
  ticket: Ticket;
  expected: Pick<Decision, "category" | "priority" | "action" | "escalation_required">;
  description: string;
};

export const LABELED: LabeledExample[] = [
  // ─── IDENTITY (4 examples) ───────────────────────────────────────────────
  {
    description: "Standard password reset — should auto-resolve",
    ticket: { ticket_id: "T-L-001", subject: "Cannot log in, password expired", body: "My password expired and I cannot log in to my computer. Please reset it.", user_id: "u-001", source: "portal" },
    expected: { category: "identity", priority: "P3", action: "auto-resolve", escalation_required: false },
  },
  {
    description: "Account lockout after failed attempts",
    ticket: { ticket_id: "T-L-002", subject: "Account locked out", body: "I tried to log in multiple times and now my account is locked. User ID: u-008", user_id: "u-008", source: "portal" },
    expected: { category: "identity", priority: "P3", action: "auto-resolve", escalation_required: false },
  },
  {
    description: "MFA reset — needs manual approval, should route not auto-resolve",
    ticket: { ticket_id: "T-L-003", subject: "Lost authenticator app, need MFA reset", body: "I lost my phone and cannot access my authenticator app. I need MFA reset to log in.", user_id: "u-002", source: "portal" },
    expected: { category: "identity", priority: "P2", action: "route", escalation_required: false },
  },
  {
    description: "Frozen account password reset — must escalate",
    ticket: { ticket_id: "T-L-004", subject: "Need password reset", body: "I cannot log in and need my password reset please.", user_id: "u-004", source: "portal" },
    expected: { category: "identity", priority: "P2", action: "escalate", escalation_required: true },
  },

  // ─── NETWORK (3 examples) ────────────────────────────────────────────────
  {
    description: "VPN connectivity issue — standard route",
    ticket: { ticket_id: "T-L-005", subject: "VPN not connecting from home", body: "My VPN client keeps failing to connect. I get error code 789. I cannot work from home.", user_id: "u-001", source: "portal" },
    expected: { category: "network", priority: "P2", action: "route", escalation_required: false },
  },
  {
    description: "WiFi slow in office",
    ticket: { ticket_id: "T-L-006", subject: "WiFi very slow in conference room B", body: "The WiFi in conference room B has been extremely slow since this morning. My colleague also has issues.", user_id: "u-008", source: "portal" },
    expected: { category: "network", priority: "P3", action: "route", escalation_required: false },
  },
  {
    description: "Multiple users offline — P1 network outage",
    ticket: { ticket_id: "T-L-007", subject: "URGENT: Entire floor has no network", body: "The entire 3rd floor has lost network connectivity. Approximately 50 users are affected. Production systems are down.", user_id: "u-010", source: "portal" },
    expected: { category: "network", priority: "P1", action: "route", escalation_required: false },
  },

  // ─── HARDWARE (3 examples) ───────────────────────────────────────────────
  {
    description: "Laptop screen broken — replacement needed",
    ticket: { ticket_id: "T-L-008", subject: "Laptop screen cracked", body: "I dropped my laptop and the screen is cracked. I cannot see anything. I need a replacement urgently.", user_id: "u-001", source: "portal" },
    expected: { category: "hardware", priority: "P2", action: "route", escalation_required: false },
  },
  {
    description: "External monitor not working",
    ticket: { ticket_id: "T-L-009", subject: "Monitor not detected by laptop", body: "My external monitor is not being detected by my laptop anymore. I tried different cables.", user_id: "u-002", source: "portal" },
    expected: { category: "hardware", priority: "P3", action: "route", escalation_required: false },
  },
  {
    description: "Printer offline",
    ticket: { ticket_id: "T-L-010", subject: "Printer not working on floor 2", body: "The printer on floor 2 shows as offline. Multiple people need to print documents.", user_id: "u-008", source: "portal" },
    expected: { category: "hardware", priority: "P3", action: "route", escalation_required: false },
  },

  // ─── SOFTWARE (3 examples) ───────────────────────────────────────────────
  {
    description: "Software license request",
    ticket: { ticket_id: "T-L-011", subject: "Need Adobe Acrobat license", body: "I need Adobe Acrobat Pro installed for my work. My manager approved it.", user_id: "u-002", source: "portal" },
    expected: { category: "software", priority: "P3", action: "route", escalation_required: false },
  },
  {
    description: "Application crashing repeatedly",
    ticket: { ticket_id: "T-L-012", subject: "Excel crashes every time I open large files", body: "Microsoft Excel crashes every time I try to open files larger than 50MB. I lose my work. Error: 0xc0000005", user_id: "u-001", source: "portal" },
    expected: { category: "software", priority: "P2", action: "route", escalation_required: false },
  },
  {
    description: "Email client not syncing",
    ticket: { ticket_id: "T-L-013", subject: "Outlook not syncing emails", body: "My Outlook has not received any emails since yesterday morning. The calendar is also not updating.", user_id: "u-008", source: "portal" },
    expected: { category: "software", priority: "P2", action: "route", escalation_required: false },
  },

  // ─── SECURITY (3 examples) ───────────────────────────────────────────────
  {
    description: "Phishing email received — always escalate",
    ticket: { ticket_id: "T-L-014", subject: "Suspicious email asking for credentials", body: "I received an email from 'IT-support@acme-secure.net' asking me to confirm my password. I did not click anything. Is this legitimate?", user_id: "u-001", source: "portal" },
    expected: { category: "security", priority: "P1", action: "escalate", escalation_required: true },
  },
  {
    description: "Unauthorized login attempt detected",
    ticket: { ticket_id: "T-L-015", subject: "Login from unknown location", body: "I received a notification that someone logged into my account from Germany, but I am in Italy. I did not do this.", user_id: "u-002", source: "portal" },
    expected: { category: "security", priority: "P1", action: "escalate", escalation_required: true },
  },
  {
    description: "Malware suspected",
    ticket: { ticket_id: "T-L-016", subject: "Antivirus detected threat", body: "My antivirus just blocked something and now my computer is running very slowly. I think I may have malware.", user_id: "u-001", source: "portal" },
    expected: { category: "security", priority: "P1", action: "escalate", escalation_required: true },
  },

  // ─── FINANCE-SYSTEMS (3 examples) ────────────────────────────────────────
  {
    description: "SAP cannot access — always escalate",
    ticket: { ticket_id: "T-L-017", subject: "Cannot access SAP transaction", body: "I get error 'authorization object missing' when trying to run transaction FB50 in SAP. I need access urgently for month-end closing.", user_id: "u-002", source: "portal" },
    expected: { category: "finance-systems", priority: "P1", action: "escalate", escalation_required: true },
  },
  {
    description: "Payroll system error",
    ticket: { ticket_id: "T-L-018", subject: "Payroll system not loading", body: "The payroll module shows a timeout error. We need to run payroll by end of day.", user_id: "u-005", source: "portal" },
    expected: { category: "finance-systems", priority: "P1", action: "escalate", escalation_required: true },
  },
  {
    description: "ERP access for new analyst",
    ticket: { ticket_id: "T-L-019", subject: "Need ERP access for new team member", body: "My new analyst joined and needs read access to the ERP reporting module. Manager approved.", user_id: "u-005", source: "portal" },
    expected: { category: "finance-systems", priority: "P3", action: "escalate", escalation_required: true },
  },

  // ─── VIP escalation (2 examples) ─────────────────────────────────────────
  {
    description: "VIP user password reset — must escalate despite being identity",
    ticket: { ticket_id: "T-L-020", subject: "Cannot log in", body: "My laptop password has expired and I cannot log in. I have a board meeting in 2 hours.", user_id: "u-003", source: "portal" },
    expected: { category: "identity", priority: "P1", action: "escalate", escalation_required: true },
  },
  {
    description: "VIP finance-lead network issue",
    ticket: { ticket_id: "T-L-021", subject: "VPN not working", body: "My VPN stopped working 30 minutes ago. I cannot access the corporate systems.", user_id: "u-005", source: "portal" },
    expected: { category: "network", priority: "P1", action: "escalate", escalation_required: true },
  },

  // ─── OTHER / ambiguous (2 examples) ──────────────────────────────────────
  {
    description: "Ambiguous request — other category",
    ticket: { ticket_id: "T-L-022", subject: "I need help", body: "Everything is broken and I don't know what to do. My computer, my email and the printer are all not working.", user_id: "u-001", source: "portal" },
    expected: { category: "other", priority: "P2", action: "escalate", escalation_required: true },
  },
  {
    description: "Non-IT request — other",
    ticket: { ticket_id: "T-L-023", subject: "Office key card not working", body: "My office key card stopped working this morning. I cannot enter the building.", user_id: "u-008", source: "portal" },
    expected: { category: "other", priority: "P3", action: "escalate", escalation_required: true },
  },

  // ─── Low confidence edge case ─────────────────────────────────────────────
  {
    description: "Vague ticket — should produce low confidence",
    ticket: { ticket_id: "T-L-024", subject: "Problem with thing", body: "The thing is not doing the thing it should do when I click the thing.", user_id: "u-001", source: "portal" },
    expected: { category: "other", priority: "P3", action: "escalate", escalation_required: true },
  },

  // ─── Under-investigation user ─────────────────────────────────────────────
  {
    description: "Under-investigation user — escalate regardless of category",
    ticket: { ticket_id: "T-L-025", subject: "Password reset request", body: "I cannot log in to my account. Please reset my password.", user_id: "u-007", source: "portal" },
    expected: { category: "identity", priority: "P2", action: "escalate", escalation_required: true },
  },
];
