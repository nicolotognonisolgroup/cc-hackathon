---
description: Run the Bedrock connectivity smoke test
---

Run the Bedrock smoke test and report the outcome:

1. Run `npm run smoke`.
2. If it succeeds, confirm the model id and region used.
3. If it fails, diagnose: check whether `aws sts get-caller-identity --profile bootcamp` returns a valid identity (re-login is `aws login --profile bootcamp --region us-east-1`), then verify the model id in `.env` is one returned by `aws bedrock list-foundation-models --profile bootcamp --region us-east-1`.

Report the result in 2-3 lines.
