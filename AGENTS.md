# AGENTS.md — SpecSeed.io

## Purpose
Instructions for Codex when working on this repo.

Mission: SpecSeed.io turns one project objective into Claude Code and Codex-ready parallel agent execution packages.

## Spawning subagents
When working a multi-component task, spawn explicitly:

```
Spawn one agent for [task A], one for [task B].
Wait for both. Return a consolidated implementation plan before editing files.
```

## Scope boundaries
- Workers receive a single scoped task. Do not refactor adjacent code.
- Reviewers are read-only. They do not edit files.
- Use `.codex/config.toml` `max_threads` as the hard ceiling on parallel fan-out.
- Hosts: macOS (dev) and Ubuntu (prod). Run the matching bootstrap per machine.

## Build commands
```bash
npm install
npm run dev
npm run build
```

## References
- @docs/specseed-product.md
- @SEED.md
