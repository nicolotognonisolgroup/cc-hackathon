import { InjectionCheckInput, InjectionCheckOutput, EstimateImpactInput, EstimateImpactOutput, toolError } from "../schemas/toolSchemas.js";

// Known injection patterns — heuristic, not exhaustive.
const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore (all |previous |above |prior )?instructions/i, label: "ignore-instructions" },
  { pattern: /you are now|act as|pretend (you are|to be)/i, label: "role-override" },
  { pattern: /system prompt|override (your )?(rules|instructions|mandate)/i, label: "system-override" },
  { pattern: /disregard|forget (everything|your|all)/i, label: "disregard-instructions" },
  { pattern: /jailbreak|bypass (security|safety|filter)/i, label: "explicit-bypass" },
  { pattern: /\[INST\]|\<\|im_start\|\>|<\/s>/, label: "raw-token-injection" },
  { pattern: /do not escalate|skip escalation|auto.?resolv/i, label: "escalation-bypass-attempt" },
];

// Scans text for prompt injection patterns.
// Score 0.0–1.0: ≥ 0.8 triggers mandatory escalation per mandate.
// Does NOT classify ticket category — use estimate_impact for that.
// Does NOT block actions directly — the PreToolUse hook enforces the block.
export function detect_prompt_injection(rawInput: unknown): ReturnType<typeof InjectionCheckOutput.parse> | ReturnType<typeof toolError> {
  const parsed = InjectionCheckInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const found = INJECTION_PATTERNS
    .filter(({ pattern }) => pattern.test(parsed.data.text))
    .map(({ label }) => label);

  const score = Math.min(1, found.length * 0.35);
  return { score, detected: score >= 0.8 || found.length > 0, patterns_found: found };
}

// Category-based impact estimation table (EUR, per-incident median).
const IMPACT_TABLE: Record<string, { base: number; multiplier_per_user: number }> = {
  identity:         { base: 200,   multiplier_per_user: 150 },
  network:          { base: 500,   multiplier_per_user: 300 },
  hardware:         { base: 800,   multiplier_per_user: 600 },
  software:         { base: 400,   multiplier_per_user: 200 },
  security:         { base: 5000,  multiplier_per_user: 2000 },
  "finance-systems":{ base: 8000,  multiplier_per_user: 3000 },
  other:            { base: 300,   multiplier_per_user: 100 },
};

// Estimates monetary impact in EUR based on category and affected user count.
// Confidence reflects how well the category matches known impact data.
// Does NOT consider user VIP status — the coordinator handles that separately.
// impact_eur > 5000 triggers mandatory escalation per mandate.
export function estimate_impact(rawInput: unknown): ReturnType<typeof EstimateImpactOutput.parse> | ReturnType<typeof toolError> {
  const parsed = EstimateImpactInput.safeParse(rawInput);
  if (!parsed.success) return toolError(`Invalid input: ${parsed.error.message}`, "INVALID_INPUT");

  const row = IMPACT_TABLE[parsed.data.category];
  if (!row) {
    return {
      impact_eur: null,
      confidence: 0.2,
      rationale: `Unknown category '${parsed.data.category}'; cannot estimate impact.`,
    };
  }

  const impact_eur = row.base + row.multiplier_per_user * (parsed.data.affected_users - 1);
  return {
    impact_eur,
    confidence: 0.7,
    rationale: `Category '${parsed.data.category}', ${parsed.data.affected_users} user(s): base €${row.base} + €${row.multiplier_per_user}/additional user.`,
  };
}
