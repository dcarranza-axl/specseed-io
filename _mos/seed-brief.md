# seed-brief.md — Condensed MOS reference for Phase 2/3 subagents

Shared context for Decompose-A, Decompose-B, Architect-A, Architect-B.
Read this first along with `00-recon.md`, `01-strategy.md`, `../_theme/applied-theme.md`.

---

## What SpecSeed is

A static website that generates a **SEED.md master orchestration document** plus Claude Code and Codex adapter files, from a structured form input. Pure client-side, deterministic TypeScript templates, no LLM calls.

Target domain: `specseed.io`. Deploy: nginx static file serve of `/var/www/specseed-io/out/`.

The product demonstrates itself — the form preloads with SpecSeed.io's own demo inputs and generates the seed that would build SpecSeed.io.

## Product sections on the home page (render order)

1. **Hero** — headline + two CTAs. Animated dotted grid bg, subtle code-scroll behind.
2. **SeedGenerator** (`#generator`) — form on left, 7-tab preview on right, 4 action buttons.
3. **PhaseOctopus** (`#octopus`) — 9 horizontally-scrolling cards showing the nine-phase schedule with dynamic worker counts.
4. **HowItWorks** (`#how`) — 7-step flow: Intent → Seed → Dechunk → Parallel Waves → Collapse → Build → Verify.
5. **ArtifactTabs** (`#artifacts`) — precomputed example outputs in 4 tabs (Claude Code, Codex, macOS, Ubuntu).
6. **Footer** — name + tagline + GitHub + "Built with Claude Code".

Secondary route: `/playground/` = full-screen SeedGenerator only.

## The canonical generator algorithm (wave plan)

```ts
type Scope = 'tiny' | 'small' | 'medium' | 'large' | 'platform'
type Parallelism = 'conservative' | 'balanced' | 'aggressive'
type Risk = 'low' | 'medium' | 'high'

const scopeBase        = { tiny:1, small:2, medium:4, large:6, platform:8 }
const parallelismBoost = { conservative:-1, balanced:0, aggressive:2 }
const riskBoost        = { low:0, medium:1, high:2 }

function workerCap(scope, parallelism, risk) {
  return Math.max(1, Math.min(12,
    scopeBase[scope] + parallelismBoost[parallelism] + riskBoost[risk]
  ))
}

function decompositionDepth(scope) {
  return scope === 'tiny' || scope === 'small' ? 1
       : scope === 'medium' ? 2
       : 3
}

function shouldUseAgentTeams(scope, parallelism) {
  return (scope === 'large' || scope === 'platform') && parallelism !== 'conservative'
}
```

## The nine-phase schedule (hardcoded template, worker counts dynamic)

| # | Name | Model | Effort | Duration | Fan-out | Artifact |
|---|------|-------|--------|----------|---------|----------|
| 0 | Recon | Haiku | default | 30s | Inventory ×1 | 00-recon.md |
| 1 | Strategy | Opus | high | 2m | Strategy ×1 | 01-strategy.md |
| 2 | Decompose | Opus | high | 2m | Decomposer A, B | 02-decomposition.md |
| 3 | Architecture | Opus | high | 3m | Architect A, B | 03-architecture.md |
| 4 | Build | Sonnet | default | 5m | Builder × workerCap | implementation diffs |
| 5 | Wire | Sonnet | default | 3m | Wiring ×1 | 05-wire.md |
| 6 | Test | Sonnet | default | 3m | Test ×1 | 06-verification.md |
| 7 | Review | Opus | high | 2m | Reviewer ×1 | 07-review.md |
| 8 | Integration | Opus | high | 2m | Integration ×1 | 08-integration.md |

## SEED.md output structure (11 sections, in order)

```
# SpecSeed: {projectName}
## 1. Objective
## 2. Operating Principle
## 3. Target Runtime
## 4. Global Constraints
## 5. Nine-Phase Octopus
## 6. Agent Roles
## 7. Wave Plan
## 8. Claude Code Adapter
## 9. Codex Adapter
## 10. OS Adapter
## 11. Definition of Done
```

## SeedInput interface (canonical)

```ts
interface SeedInput {
  projectName: string
  objective: string
  projectType: 'landing-page' | 'saas-app' | 'docs-site' | 'dashboard' | 'api' | 'full-stack-app'
  agentPlatform: 'claude-code' | 'codex' | 'both'
  environment: 'macos' | 'ubuntu' | 'both'
  scope: 'tiny' | 'small' | 'medium' | 'large' | 'platform'
  risk: 'low' | 'medium' | 'high'
  parallelism: 'conservative' | 'balanced' | 'aggressive'
  outputStyle: 'concise' | 'detailed' | 'exhaustive'
  deploymentTarget: 'static' | 'vercel' | 'docker' | 'ubuntu-vps' | 'custom'
  constraints: string
  repoNotes: string
}
```

## Default demo input (preloaded on page load)

```json
{
  "projectName": "SpecSeed.io",
  "objective": "Generate the master seed that turns one project objective into parallel agent execution.",
  "projectType": "saas-app",
  "agentPlatform": "both",
  "environment": "both",
  "scope": "medium",
  "risk": "medium",
  "parallelism": "balanced",
  "outputStyle": "detailed",
  "deploymentTarget": "vercel",
  "constraints": "No paid LLM API calls in MVP. Pure TypeScript template generation. Deterministic output.",
  "repoNotes": "Next.js 14 App Router, TypeScript strict, Tailwind CSS, Framer Motion."
}
```

With these defaults: `workerCap = 4 + 0 + 1 = 5`. `decompositionDepth = 2`. `shouldUseAgentTeams = false`.

## Adapter pack — files included in the ZIP download

Exactly 10 files under a `specseed-output/` top-level folder:

```
specseed-output/
├── SEED.md
├── CLAUDE.md
├── AGENTS.md
├── .claude/agents/reviewer.md
├── .claude/agents/recon.md
├── .claude/agents/tester.md
├── .codex/config.toml
├── .codex/agents/reviewer.toml
├── .codex/agents/worker.toml
├── macos-setup.sh
└── ubuntu-bootstrap.md
```

(11 files counting both scripts — MOS says 10 in one place and 11 in another; we ship all 11 and the DoD item "Download Adapter Pack produces a ZIP with all 10 expected files" treats `macos-setup.sh` and `ubuntu-bootstrap.md` as conditional on `environment`. Safer to always include both in MVP.)

## CLAUDE.md adapter template (generated output target, < 200 lines)

```markdown
# CLAUDE.md — {projectName}

## Mission
{objective-derived paragraph}

## Operating doctrine
1. Read SEED.md before any session that touches core {projectName} logic.
2. Explore before coding. Use the recon subagent at session start.
3. Collapse each phase into a _mos/ artifact before moving on.
4. Keep implementation changes scoped. One wave at a time.
5. Run lint + build after every material change.

## Subagents
- @.claude/agents/recon.md
- @.claude/agents/tester.md
- @.claude/agents/reviewer.md

## Build commands
{stack-appropriate commands}

## File ownership
{project-structure-summary}

## References
- @docs/{projectName}-product.md
- @docs/phase-octopus.md

## Verification
Always run lint + build after material changes. Fix at root cause, not with suppression comments.
```

## AGENTS.md adapter template (for Codex)

```markdown
# AGENTS.md — {projectName}

## Purpose
Instructions for Codex when working on this repo.

## Spawning subagents
When working a multi-component task, spawn explicitly. Example:
  "Spawn one agent for [task A], one for [task B].
   Wait for both. Return a consolidated implementation plan before editing files."

## Scope boundaries
- Workers receive a single scoped task. Do not refactor adjacent code.
- Reviewers are read-only. They do not edit files.
- {environment-specific notes}

## Build commands
{stack-appropriate commands}

## References
- @docs/{projectName}-product.md
```

## Claude agent files (3)

`.claude/agents/recon.md`, `.claude/agents/tester.md`, `.claude/agents/reviewer.md`.

YAML frontmatter `name / description / tools / model`, then a short body.

## Codex config (TOML)

```toml
[agents]
max_threads = 6
max_depth = 1
```

## Codex agent files (2)

`.codex/agents/reviewer.toml`, `.codex/agents/worker.toml` — TOML with `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, `developer_instructions`.

## OS adapters

- `macos-setup.sh` — bash script `set -euo pipefail`, checks node/npm versions, note about launchd for background jobs.
- `ubuntu-bootstrap.md` — apt update, install list, non-root deploy user, SSH keys, UFW, nginx, systemd, certbot.

## Section 6 Definition of Done (abbreviated — full list in MOS)

Build is done when: lint passes, build passes, TypeScript zero-errors, 9 phase cards render with correct worker counts, form defaults to SpecSeed.io demo, preview live-updates, copy + download + adapter pack work, `/playground/` renders, all `.claude/` + `.codex/` files exist, `_mos/` has all 9 phase artifacts, docs + README + robots + sitemap exist.

---

*CC-OPS-SPECSEED*
