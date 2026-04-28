import type { UserProfile, KbArticle, TicketHistoryItem } from "../schemas/toolSchemas.js";

export const USERS: Record<string, UserProfile> = {
  "u-001": {
    user_id: "u-001", name: "Marco Bianchi", email: "m.bianchi@acme.com",
    role: "engineer", department: "Engineering", is_vip: false,
    account_state: "active", manager_id: "u-010",
  },
  "u-002": {
    user_id: "u-002", name: "Sofia Esposito", email: "s.esposito@acme.com",
    role: "analyst", department: "Finance", is_vip: false,
    account_state: "active", manager_id: "u-011",
  },
  "u-003": {
    user_id: "u-003", name: "Luca Ferrari", email: "l.ferrari@acme.com",
    role: "executive", department: "Executive Office", is_vip: true,
    account_state: "active", manager_id: null,
  },
  "u-004": {
    user_id: "u-004", name: "Giulia Romano", email: "g.romano@acme.com",
    role: "engineer", department: "Engineering", is_vip: false,
    account_state: "frozen", manager_id: "u-010",
  },
  "u-005": {
    user_id: "u-005", name: "Antonio Conti", email: "a.conti@acme.com",
    role: "finance-lead", department: "Finance", is_vip: true,
    account_state: "active", manager_id: null,
  },
  "u-006": {
    user_id: "u-006", name: "Elena Ricci", email: "e.ricci@acme.com",
    role: "legal", department: "Legal", is_vip: false,
    account_state: "active", manager_id: null,
  },
  "u-007": {
    user_id: "u-007", name: "Matteo Lombardi", email: "m.lombardi@acme.com",
    role: "contractor", department: "IT", is_vip: false,
    account_state: "under-investigation", manager_id: "u-010",
  },
  "u-008": {
    user_id: "u-008", name: "Chiara Barbieri", email: "c.barbieri@acme.com",
    role: "manager", department: "Sales", is_vip: false,
    account_state: "active", manager_id: null,
  },
  "u-009": {
    user_id: "u-009", name: "Roberto Mancini", email: "r.mancini@acme.com",
    role: "analyst", department: "Operations", is_vip: false,
    account_state: "disabled", manager_id: "u-008",
  },
  "u-010": {
    user_id: "u-010", name: "Francesca De Luca", email: "f.deluca@acme.com",
    role: "admin", department: "IT", is_vip: false,
    account_state: "active", manager_id: null,
  },
  "u-011": {
    user_id: "u-011", name: "Davide Gallo", email: "d.gallo@acme.com",
    role: "executive", department: "Finance", is_vip: true,
    account_state: "active", manager_id: null,
  },
};

export const KB_ARTICLES: KbArticle[] = [
  {
    article_id: "kb-001", title: "Password Reset — Standard Users",
    summary: "Step-by-step for resetting a password for active, non-privileged accounts.",
    category: "identity",
    steps: ["Verify user identity via employee ID", "Send temporary password to registered email", "Force password change on next login"],
    keywords: ["password", "reset", "locked", "login", "credentials"],
  },
  {
    article_id: "kb-002", title: "MFA Reset Procedure",
    summary: "How to reset multi-factor authentication for a user. Requires manager approval.",
    category: "identity",
    steps: ["Obtain written approval from manager", "Verify identity via video call", "Reset authenticator app binding", "Re-enroll on next login"],
    keywords: ["mfa", "authenticator", "two-factor", "2fa", "otp"],
  },
  {
    article_id: "kb-003", title: "VPN Connectivity Issues",
    summary: "Troubleshooting guide for VPN connection failures and slow tunnels.",
    category: "network",
    steps: ["Check VPN client version (must be ≥ 5.x)", "Verify network adapter settings", "Flush DNS cache", "Re-download VPN profile from portal"],
    keywords: ["vpn", "connectivity", "tunnel", "remote", "network"],
  },
  {
    article_id: "kb-004", title: "WiFi — Office Network Troubleshooting",
    summary: "Steps for diagnosing WiFi issues in office locations.",
    category: "network",
    steps: ["Forget and re-join ACME-Corp SSID", "Check for interference on 2.4 GHz band", "Contact facilities for access point reset"],
    keywords: ["wifi", "wireless", "ssid", "internet", "network"],
  },
  {
    article_id: "kb-005", title: "Laptop Hardware Failure — Replacement Request",
    summary: "Process for requesting a replacement laptop. SLA: 2 business days.",
    category: "hardware",
    steps: ["Submit asset tag via portal", "IT validates warranty status", "Loaner issued within 4h if P1", "Data restored from backup"],
    keywords: ["laptop", "hardware", "broken", "screen", "keyboard", "replacement"],
  },
  {
    article_id: "kb-006", title: "Software License Installation",
    summary: "How to request and install approved software. Non-approved software blocked by policy.",
    category: "software",
    steps: ["Check approved software catalog", "Submit license request in portal", "IT approves within 1 business day", "Download from software center"],
    keywords: ["software", "license", "install", "application", "app"],
  },
  {
    article_id: "kb-007", title: "Phishing Email Reporting",
    summary: "DO NOT click links. Forward to security@acme.com immediately. This always triggers a security review.",
    category: "security",
    steps: ["Do not click any links or attachments", "Forward email to security@acme.com", "Delete from inbox", "Report in security portal"],
    keywords: ["phishing", "suspicious", "email", "malware", "threat", "attack"],
  },
  {
    article_id: "kb-008", title: "SAP Access Issues",
    summary: "SAP and ERP access issues are routed to the Finance IT team. No self-service available.",
    category: "finance-systems",
    steps: ["Contact Finance IT team at finance-it@acme.com", "Provide employee ID and module affected", "Manager approval required for access changes"],
    keywords: ["sap", "erp", "finance", "payroll", "accounting", "module"],
  },
  {
    article_id: "kb-009", title: "Monitor and Peripheral Issues",
    summary: "Troubleshooting for external monitors, mice, keyboards and docking stations.",
    category: "hardware",
    steps: ["Check cable connections and display adapter", "Update display drivers via Software Center", "Request replacement peripheral via portal if hardware fault"],
    keywords: ["monitor", "screen", "peripheral", "mouse", "keyboard", "docking"],
  },
  {
    article_id: "kb-010", title: "Account Lockout — Causes and Resolution",
    summary: "Why accounts get locked and how to unlock. Does not apply to frozen/disabled accounts.",
    category: "identity",
    steps: ["Confirm user identity", "Check for concurrent session issues", "Unlock via Active Directory", "Advise on password complexity requirements"],
    keywords: ["locked", "lockout", "account", "login", "blocked", "unable"],
  },
  {
    article_id: "kb-011", title: "Latency and Slow Network Performance",
    summary: "Diagnosing high latency, packet loss and bandwidth issues.",
    category: "network",
    steps: ["Run network diagnostics (ping, traceroute)", "Check bandwidth usage via IT dashboard", "Isolate to wired vs wireless", "Escalate to Network team if >100ms persistent"],
    keywords: ["slow", "latency", "performance", "bandwidth", "speed", "network"],
  },
  {
    article_id: "kb-012", title: "Application Crashes and Errors",
    summary: "Generic troubleshooting for application errors and crashes.",
    category: "software",
    steps: ["Collect error logs from %APPDATA%\\Logs", "Clear application cache", "Reinstall via Software Center", "Submit log bundle with ticket"],
    keywords: ["crash", "error", "application", "exception", "bug", "not working"],
  },
  {
    article_id: "kb-013", title: "Suspicious Login Attempts — Security Response",
    summary: "Suspected unauthorized access. Always escalated to Security team. Account may be frozen.",
    category: "security",
    steps: ["Do not touch the affected machine", "Contact security@acme.com immediately", "Security team will initiate IR procedure", "Preserve all evidence"],
    keywords: ["suspicious", "unauthorized", "breach", "hack", "compromised", "access"],
  },
  {
    article_id: "kb-014", title: "Printer and Print Queue Issues",
    summary: "Resolving print queue jams, driver errors and offline printer status.",
    category: "hardware",
    steps: ["Clear print queue via Print Management", "Restart Print Spooler service", "Reinstall printer driver", "Check network printer IP assignment"],
    keywords: ["printer", "print", "queue", "driver", "offline"],
  },
  {
    article_id: "kb-015", title: "Email Client Configuration",
    summary: "Setting up and troubleshooting Outlook/email client issues.",
    category: "software",
    steps: ["Re-create Outlook profile", "Repair Office installation via Control Panel", "Verify Exchange server connectivity", "Check mailbox quota"],
    keywords: ["email", "outlook", "calendar", "mailbox", "exchange", "client"],
  },
];

export const TICKET_HISTORY: Record<string, TicketHistoryItem[]> = {
  "u-001": [
    { ticket_id: "T-000-A", subject: "VPN not connecting", category: "network", status: "closed", created_at: "2026-03-10T09:00:00Z" },
    { ticket_id: "T-000-B", subject: "Password expired", category: "identity", status: "closed", created_at: "2026-01-15T14:30:00Z" },
  ],
  "u-002": [
    { ticket_id: "T-000-C", subject: "SAP transaction error", category: "finance-systems", status: "escalated", created_at: "2026-04-01T11:00:00Z" },
  ],
  "u-003": [
    { ticket_id: "T-000-D", subject: "Laptop fan noise", category: "hardware", status: "closed", created_at: "2026-02-20T08:00:00Z" },
    { ticket_id: "T-000-E", subject: "Cannot access board portal", category: "software", status: "escalated", created_at: "2026-04-10T16:00:00Z" },
  ],
  "u-004": [
    { ticket_id: "T-000-F", subject: "Account locked", category: "identity", status: "closed", created_at: "2026-04-25T10:00:00Z" },
  ],
  "u-007": [
    { ticket_id: "T-000-G", subject: "Suspicious login from foreign IP", category: "security", status: "escalated", created_at: "2026-04-26T22:00:00Z" },
  ],
};

export const LOGIN_HISTORY: Record<string, { last_login: string | null; failed_attempts: number }> = {
  "u-001": { last_login: "2026-04-28T08:00:00Z", failed_attempts: 0 },
  "u-002": { last_login: "2026-04-28T07:45:00Z", failed_attempts: 0 },
  "u-003": { last_login: "2026-04-27T18:00:00Z", failed_attempts: 0 },
  "u-004": { last_login: null, failed_attempts: 10 },
  "u-005": { last_login: "2026-04-28T09:00:00Z", failed_attempts: 0 },
  "u-006": { last_login: "2026-04-28T09:15:00Z", failed_attempts: 0 },
  "u-007": { last_login: "2026-04-26T23:00:00Z", failed_attempts: 15 },
  "u-008": { last_login: "2026-04-28T08:30:00Z", failed_attempts: 0 },
  "u-009": { last_login: null, failed_attempts: 0 },
  "u-010": { last_login: "2026-04-28T07:00:00Z", failed_attempts: 0 },
  "u-011": { last_login: "2026-04-28T09:30:00Z", failed_attempts: 0 },
};
