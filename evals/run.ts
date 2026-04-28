import { assertAuthConfigured } from "../src/config.js";
import { triageTicket } from "../src/agents/coordinator.js";
import type { Decision } from "../src/schemas/decision.js";
import { LABELED } from "./fixtures/labeled.js";
import { ADVERSARIAL } from "./fixtures/adversarial.js";
import { computeScorecard, printScorecard } from "./scorecard.js";
import { writeFileSync } from "fs";

const CONCURRENCY = 1; // Run sequentially to avoid rate limits; increase if quota allows

async function runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    fn().then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e as Error); });
  });
}

async function runBatch<T, R>(
  items: T[],
  runner: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(runner));
    results.push(...batchResults);
  }
  return results;
}

async function main(): Promise<void> {
  assertAuthConfigured();

  const subset = process.argv.includes("--quick")
    ? { labeled: LABELED.slice(0, 5), adversarial: ADVERSARIAL.slice(0, 3) }
    : { labeled: LABELED, adversarial: ADVERSARIAL };

  console.log(`Running eval: ${subset.labeled.length} labeled + ${subset.adversarial.length} adversarial examples`);

  // ─── Labeled examples ─────────────────────────────────────────────────────
  const labeledRuns = await runBatch(
    subset.labeled,
    async (example) => {
      process.stdout.write(`  [labeled] ${example.ticket.ticket_id} ... `);
      try {
        const decision = await runWithTimeout(() => triageTicket(example.ticket), 120_000);
        process.stdout.write("done\n");
        return { example, decision };
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        process.stdout.write(`FAILED: ${error}\n`);
        return { example, decision: null as Decision | null, error };
      }
    },
    CONCURRENCY,
  );

  // ─── Adversarial examples ─────────────────────────────────────────────────
  const adversarialRuns = await runBatch(
    subset.adversarial,
    async (example) => {
      process.stdout.write(`  [adversarial] ${example.ticket.ticket_id} (${example.attack_type}) ... `);
      try {
        const decision = await runWithTimeout(() => triageTicket(example.ticket), 120_000);
        process.stdout.write("done\n");
        return { example, decision };
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        process.stdout.write(`FAILED: ${error}\n`);
        return { example, decision: null as Decision | null, error };
      }
    },
    CONCURRENCY,
  );

  const scorecard = computeScorecard(labeledRuns, adversarialRuns);
  printScorecard(scorecard);

  // Persist scorecard for CI / presentation
  const outPath = "evals/scorecard-latest.json";
  writeFileSync(outPath, JSON.stringify(scorecard, null, 2), "utf-8");
  console.log(`Scorecard saved to ${outPath}`);

  process.exit(scorecard.passed ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error("[eval] Fatal error:", err);
  process.exit(1);
});
