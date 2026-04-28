---
description: Run the eval Scorecard and summarize
---

Run `npm run eval` and produce a short summary:

1. Execute the eval harness.
2. Extract the headline metrics: classification accuracy, precision per category, escalation rate (correct vs needless), adversarial-pass rate, false-confidence rate.
3. Compare against the targets in `docs/mandate.md` (accuracy ≥ 0.85, adversarial-pass ≥ 0.95, false-confidence ≤ 0.05, useful-escalation ≥ 0.90).
4. Flag any metric below threshold and list the 3 worst-failing examples by category.

Output in markdown, under 200 words.
