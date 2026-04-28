# `.claude/` — project-level Claude Code configuration

This directory configures Claude Code for everyone working on the repo. It's committed to VCS so the whole team picks up the same conventions.

## Layout

- `settings.json` — project-level permissions (allow / deny / ask) and Claude Code config. Personal overrides go in `settings.local.json` (gitignored).
- `commands/` — custom slash commands available in this repo. Currently: `/smoke`, `/eval`.
- `agents/` — custom subagent definitions (empty for now; populate as we build coordinator/specialists).

## Conventions

- Anything that should *always* be denied (history rewrites, force pushes, destructive deletes) lives in `permissions.deny` here, not in personal settings.
- Anything risky enough to warrant a human prompt (`git push`, opening PRs, releases) lives in `permissions.ask`.
- Commands describe **a playbook**, not a single shell call — Claude reads the markdown and executes the steps.
