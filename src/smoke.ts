import { query } from "@anthropic-ai/claude-agent-sdk";
import { config, assertAuthConfigured } from "./config.js";

async function main(): Promise<void> {
  assertAuthConfigured();

  console.log("[smoke] backend:", config.useBedrock ? "AWS Bedrock" : "Anthropic API");
  console.log("[smoke] model:", config.model ?? "(default)");
  if (config.useBedrock) {
    console.log("[smoke] aws region:", config.awsRegion);
    console.log("[smoke] aws profile:", config.awsProfile ?? "(default chain)");
  }

  const result = query({
    prompt: "Say 'pong' and nothing else.",
    options: {
      ...(config.model ? { model: config.model } : {}),
      permissionMode: "bypassPermissions",
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      const blocks = message.message.content as Array<{ type: string; text?: string }>;
      const text = blocks
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text!)
        .join("");
      if (text) console.log("[assistant]", text);
    } else if (message.type === "result") {
      console.log("[smoke] done. subtype:", message.subtype);
      const m = message as Record<string, unknown>;
      if ("usage" in m) console.log("[smoke] usage:", m.usage);
    }
  }
}

main().catch((err) => {
  console.error("[smoke] FAILED:", err);
  process.exit(1);
});
