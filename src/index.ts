import { assertAuthConfigured } from "./config.js";

async function main(): Promise<void> {
  assertAuthConfigured();
  console.log("cc-hackathon agent — entrypoint placeholder");
  console.log("Run `npm run smoke` to test backend connectivity.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
