import { assertAuthConfigured } from "./config.js";
import { Ticket } from "./schemas/ticket.js";
import { triageTicket } from "./agents/coordinator.js";

async function main(): Promise<void> {
  assertAuthConfigured();

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();

  if (!raw) {
    console.error("Usage: echo '<ticket JSON>' | npm start");
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("Error: stdin is not valid JSON");
    process.exit(1);
  }

  const ticket = Ticket.safeParse(parsed);
  if (!ticket.success) {
    console.error("Error: invalid ticket schema:", ticket.error.issues);
    process.exit(1);
  }

  console.log(`[intake] Triaging ticket ${ticket.data.ticket_id} for user ${ticket.data.user_id}`);
  const decision = await triageTicket(ticket.data);
  console.log(JSON.stringify(decision, null, 2));
}

main().catch((err: unknown) => {
  console.error("[fatal]", err);
  process.exit(1);
});
