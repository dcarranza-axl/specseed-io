# SpecSeed — Product

## Positioning
Generate the master seed that turns one project objective into parallel agent execution.

## One-liner
SpecSeed converts rough intent into Claude Code and Codex-ready orchestration seeds: decomposer, planner, worker, reviewer, looper, analyst, and integration phases.

## The core insight
Coding-agent projects don't fail because the code is hard. They fail because the *orchestration* is fuzzy — who's doing what, in what order, with what inputs. SpecSeed is the deterministic template that makes orchestration explicit.

## What SpecSeed produces

Given one structured `SeedInput`, the generator emits:

- `SEED.md` — 11-section master orchestration document
- `CLAUDE.md` — < 200 lines, project-specific doctrine
- `.claude/agents/{reviewer,recon,tester}.md` — YAML-frontmatter Claude Code agents
- `AGENTS.md` — Codex-facing instructions
- `.codex/config.toml` — `[agents] max_threads=6 max_depth=1`
- `.codex/agents/{reviewer,worker}.toml` — Codex agent profiles
- `macos-setup.sh` + `ubuntu-bootstrap.md` — OS-specific setup runbooks

All emitted from pure TypeScript templates, deterministically. Same input → byte-for-byte identical output.

## The nine phases

See [phase-octopus.md](phase-octopus.md). The short version: Recon → Strategy → Decompose → Architecture → Build → Wire → Test → Review → Integration.

## Wave algorithm

```
workerCap     = clamp(1, 12, scopeBase[scope] + parallelismBoost[p] + riskBoost[r])
scopeBase     = { tiny:1, small:2, medium:4, large:6, platform:8 }
paraBoost     = { conservative:-1, balanced:0, aggressive:2 }
riskBoost     = { low:0, medium:1, high:2 }

depth         = scope ∈ {tiny,small} ? 1 : scope === medium ? 2 : 3
useTeams      = scope ∈ {large,platform} && parallelism !== conservative
```

## Non-goals

- **Not an LLM API wrapper.** SpecSeed generates docs; it doesn't invoke Claude or Codex.
- **Not a codemod tool.** The output is prose + TOML + bash, not AST transforms.
- **Not a project bootstrapper.** Adjacent but distinct from `create-next-app` et al.

## Audience

- Engineers running Claude Code fleets across multiple projects
- Teams evaluating Codex and needing an AGENTS.md starter
- Operators who want a reversible, phase-by-phase build schedule for agent work

---

*CC-OPS-SPECSEED*
