import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}. Check .env vs .env.example`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === "1";

export const config = {
  useBedrock,
  awsProfile: optional("AWS_PROFILE"),
  awsRegion: optional("AWS_REGION"),
  model: useBedrock ? required("ANTHROPIC_MODEL") : optional("ANTHROPIC_MODEL"),
  smallFastModel: optional("ANTHROPIC_SMALL_FAST_MODEL"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  logLevel: optional("LOG_LEVEL") ?? "info",
} as const;

export function assertAuthConfigured(): void {
  if (config.useBedrock) {
    if (!config.awsRegion) throw new Error("Bedrock mode: AWS_REGION is required");
    if (!config.model) throw new Error("Bedrock mode: ANTHROPIC_MODEL is required");
    return;
  }
  if (!config.anthropicApiKey) {
    throw new Error("No backend configured. Set CLAUDE_CODE_USE_BEDROCK=1 + AWS vars, or ANTHROPIC_API_KEY");
  }
}
