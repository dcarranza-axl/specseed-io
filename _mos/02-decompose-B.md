# 02-decompose-B.md — Library Function Decomposition (Phase 2, Worker B)

**Authored:** 2026-04-21
**Author:** CC-OPS-SPECSEED Decomposer Worker B (Opus 4.7, 1M ctx)
**Status:** Proposal for root orchestrator collapse into `_mos/02-decomposition.md`.
**Scope:** `lib/` layer only. Zero 3rd-party runtime deps. Browser-safe. Pure, deterministic, synchronous.

---

## 1. File listing in `lib/`

Final file set (14 source modules + 1 barrel export):

```
lib/
├── index.ts                       # barrel re-export (public surface)
├── seedSchema.ts                  # SeedInput, WavePlan, PhaseSpec, GeneratedSeed types
├── constants.ts                   # scopeBase, parallelismBoost, riskBoost, PHASE_TABLE, AGENT_ROSTER
├── wavePlan.ts                    # workerCap, decompositionDepth, shouldUseAgentTeams, computeWavePlan
├── helpers.ts                     # slugify, indent, repeat, joinLines, markdownTable, escapeYaml, tomlString, bulletList, section
├── generateSeedSections.ts        # 11 per-section builders (buildSection01..buildSection11)
├── generateSeed.ts                # compose the 11 sections into full SEED.md
├── generateClaudeAdapter.ts       # CLAUDE.md + 3 agent .md files (reviewer, recon, tester)
├── generateCodexAdapter.ts        # AGENTS.md + 2 agent .toml files (reviewer, worker) + config.toml
├── generateOSAdapters.ts          # macos-setup.sh + ubuntu-bootstrap.md
├── compileFullSeed.ts             # top-level orchestrator; returns GeneratedSeed bundle
├── bundleManifest.ts              # maps GeneratedSeed → flat file list for ZIP (no jszip dep here; UI owns zipping)
├── clipboard.ts                   # copyToClipboard(text) — browser API wrapper (side-effectful, isolated)
└── downloadBundle.ts              # triggerDownload(blob, filename) — browser DOM wrapper (side-effectful, isolated)
```

**Decision notes:**
- `seedSchema.ts` keeps **types only** (no runtime). Architect-A owns the interface shapes; I reference them here.
- `constants.ts` is extracted so the 9-phase table and model roster live in one traceable place — every SEED.md row traces to a constant.
- `generateSeedSections.ts` is split into **11 small per-section builders** (see §9) rather than one big template literal. Each is individually unit-testable.
- `bundleManifest.ts` isolates the 11-entry file list (name, path, content) so `jszip` usage lives in the component layer, not `lib/`.
- `clipboard.ts` + `downloadBundle.ts` are the **only** impure modules in `lib/`. They're browser-DOM wrappers, not generator code. Kept here for co-location with the artifacts they dispatch.

---

## 2. Function inventory table

| file | function | signature (TypeScript) | pure? | inputs | outputs | consumer |
|---|---|---|---|---|---|---|
| wavePlan.ts | `workerCap` | `(scope: Scope, parallelism: Parallelism, risk: Risk) => number` | yes | enum tuple | integer 1..12 | `computeWavePlan`, `PhaseOctopus` |
| wavePlan.ts | `decompositionDepth` | `(scope: Scope) => 1 \| 2 \| 3` | yes | enum | integer | `computeWavePlan`, `buildSection07` |
| wavePlan.ts | `shouldUseAgentTeams` | `(scope: Scope, parallelism: Parallelism) => boolean` | yes | enum tuple | bool | `computeWavePlan`, `buildSection06` |
| wavePlan.ts | `computeWavePlan` | `(input: SeedInput) => WavePlan` | yes | SeedInput | WavePlan | `compileFullSeed`, `SeedGenerator` (for octopus preview) |
| helpers.ts | `slugify` | `(s: string) => string` | yes | string | kebab-case string | filename builders, TOML keys |
| helpers.ts | `indent` | `(s: string, n?: number) => string` | yes | string, spaces | indented string | YAML/TOML bodies |
| helpers.ts | `repeat` | `(s: string, n: number) => string` | yes | string, count | repeated string | dividers, padding |
| helpers.ts | `joinLines` | `(lines: (string \| false \| null \| undefined)[]) => string` | yes | mixed list | newline-joined, falsy dropped | every section builder |
| helpers.ts | `markdownTable` | `(headers: string[], rows: string[][]) => string` | yes | 2D strings | MD table block | `buildSection05`, `buildSection07` |
| helpers.ts | `escapeYaml` | `(s: string) => string` | yes | string | YAML-safe scalar | `generateClaudeAgent*` |
| helpers.ts | `tomlString` | `(s: string) => string` | yes | string | TOML-escaped double-quoted | `generateCodexAgent*`, `generateCodexConfig` |
| helpers.ts | `bulletList` | `(items: string[], marker?: string) => string` | yes | string[] | MD bullet block | many |
| helpers.ts | `section` | `(heading: string, body: string) => string` | yes | heading, body | `## heading\n\nbody` | every section builder |
| generateSeedSections.ts | `buildSection01_Objective` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection02_OperatingPrinciple` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection03_TargetRuntime` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection04_GlobalConstraints` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection05_NinePhaseOctopus` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | MD section w/ table | `generateSeed` |
| generateSeedSections.ts | `buildSection06_AgentRoles` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection07_WavePlan` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection08_ClaudeAdapter` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection09_CodexAdapter` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection10_OSAdapter` | `(input: SeedInput) => string` | yes | SeedInput | MD section | `generateSeed` |
| generateSeedSections.ts | `buildSection11_DefinitionOfDone` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | MD section | `generateSeed` |
| generateSeed.ts | `generateSeed` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | complete SEED.md | `compileFullSeed` |
| generateClaudeAdapter.ts | `generateClaudeMd` | `(input: SeedInput) => string` | yes | SeedInput | CLAUDE.md string | `compileFullSeed` |
| generateClaudeAdapter.ts | `generateClaudeReviewerAgent` | `(input: SeedInput) => string` | yes | SeedInput | .md w/ YAML frontmatter | `compileFullSeed` |
| generateClaudeAdapter.ts | `generateClaudeReconAgent` | `(input: SeedInput) => string` | yes | SeedInput | .md w/ YAML frontmatter | `compileFullSeed` |
| generateClaudeAdapter.ts | `generateClaudeTesterAgent` | `(input: SeedInput) => string` | yes | SeedInput | .md w/ YAML frontmatter | `compileFullSeed` |
| generateCodexAdapter.ts | `generateAgentsMd` | `(input: SeedInput) => string` | yes | SeedInput | AGENTS.md string | `compileFullSeed` |
| generateCodexAdapter.ts | `generateCodexConfig` | `(input: SeedInput, plan: WavePlan) => string` | yes | SeedInput, plan | config.toml string | `compileFullSeed` |
| generateCodexAdapter.ts | `generateCodexReviewerAgent` | `(input: SeedInput) => string` | yes | SeedInput | reviewer.toml string | `compileFullSeed` |
| generateCodexAdapter.ts | `generateCodexWorkerAgent` | `(input: SeedInput) => string` | yes | SeedInput | worker.toml string | `compileFullSeed` |
| generateOSAdapters.ts | `generateMacosSetup` | `(input: SeedInput) => string` | yes | SeedInput | bash script string | `compileFullSeed` |
| generateOSAdapters.ts | `generateUbuntuBootstrap` | `(input: SeedInput) => string` | yes | SeedInput | markdown string | `compileFullSeed` |
| compileFullSeed.ts | `compileFullSeed` | `(input: SeedInput) => GeneratedSeed` | yes | SeedInput | full bundle object | `SeedGenerator.tsx` (`useMemo`) |
| bundleManifest.ts | `toBundleManifest` | `(bundle: GeneratedSeed) => BundleFile[]` | yes | GeneratedSeed | flat file list | `AdapterPackDownload.tsx` |
| clipboard.ts | `copyToClipboard` | `(text: string) => Promise<boolean>` | **no** | string | success flag | `CopyButton.tsx` |
| downloadBundle.ts | `triggerDownload` | `(content: string \| Blob, filename: string, mime?: string) => void` | **no** | content + name | (side effect: download) | `DownloadSeedButton`, `AdapterPackDownload` |

**Total: 36 public functions across 14 modules.** All generator functions are pure; only `copyToClipboard` and `triggerDownload` touch the browser.

---

## 3. Per-artifact generator

| Generated file | Producing function | Signature |
|---|---|---|
| `SEED.md` | `generateSeed` | `(input: SeedInput, plan: WavePlan) => string` |
| `CLAUDE.md` | `generateClaudeMd` | `(input: SeedInput) => string` |
| `AGENTS.md` | `generateAgentsMd` | `(input: SeedInput) => string` |
| `.claude/agents/reviewer.md` | `generateClaudeReviewerAgent` | `(input: SeedInput) => string` |
| `.claude/agents/recon.md` | `generateClaudeReconAgent` | `(input: SeedInput) => string` |
| `.claude/agents/tester.md` | `generateClaudeTesterAgent` | `(input: SeedInput) => string` |
| `.codex/config.toml` | `generateCodexConfig` | `(input: SeedInput, plan: WavePlan) => string` |
| `.codex/agents/reviewer.toml` | `generateCodexReviewerAgent` | `(input: SeedInput) => string` |
| `.codex/agents/worker.toml` | `generateCodexWorkerAgent` | `(input: SeedInput) => string` |
| `macos-setup.sh` | `generateMacosSetup` | `(input: SeedInput) => string` |
| `ubuntu-bootstrap.md` | `generateUbuntuBootstrap` | `(input: SeedInput) => string` |

11 artifacts, 11 generators, 1:1 mapping. `compileFullSeed` is the single caller that assembles all of them.

---

## 4. Internal helpers (`helpers.ts`)

| Helper | Purpose | Justification |
|---|---|---|
| `slugify(s)` | `"SpecSeed.io"` → `"specseed-io"` | Used in SEED filename (`SEED-${slug}.md`), nowhere else we need a URL-safe identifier; small enough to inline but two call sites justify extraction. |
| `indent(s, n=2)` | Re-indent multiline strings | Required for YAML body blocks inside `developer_instructions` TOML triple-quote strings and for nested MD bullet lists. |
| `repeat(s, n)` | `repeat('-', 80)` | Brutalist divider rows and horizontal rules in SEED.md. |
| `joinLines(lines)` | Join with `\n`, drop `false`/`null`/`undefined` | Core pattern: section builders emit `joinLines([ header, '', cond && extraLine, body ])`. Cleaner than ternary-branched strings. Drops empties deterministically. |
| `markdownTable(headers, rows)` | Build GFM pipe table | Used in §5 (phase table) and §7 (wave plan). Keeps column-width padding consistent and deterministic. |
| `escapeYaml(s)` | Wrap in quotes + escape when needed | YAML frontmatter `description` / `name` can contain arbitrary objective text. Needed to guard `:` / `#` / leading `-`. |
| `tomlString(s)` | Escape `\`, `"`, control chars + wrap in `"..."` | Every TOML string field (description, developer_instructions, name) flows through this. |
| `bulletList(items, marker='-')` | `items.map(i => `${marker} ${i}`).join('\n')` | Trivial but used ~30 times across builders. DRY + consistent marker. |
| `section(heading, body)` | `## heading\n\nbody\n` | The 11 section builders all end in this — enforces blank-line-after-heading convention. |

**Removed from initial draft:** `formatTomlString` (merged into `tomlString`); `markdownEscape` (not needed — our inputs are controlled by the form, no user-supplied markdown chars go into interpolated positions that would break rendering). **Kept:** everything above.

No 3rd-party deps. All helpers are ~5–15 lines of straightforward string logic.

---

## 5. Wave algorithm module (`wavePlan.ts`)

**Formulas (verbatim from seed-brief):**

```ts
const scopeBase        = { tiny:1, small:2, medium:4, large:6, platform:8 }
const parallelismBoost = { conservative:-1, balanced:0, aggressive:2 }
const riskBoost        = { low:0, medium:1, high:2 }

workerCap(s,p,r) = clamp(1, 12, scopeBase[s] + parallelismBoost[p] + riskBoost[r])
decompositionDepth(s) = s==='tiny'||s==='small' ? 1 : s==='medium' ? 2 : 3
shouldUseAgentTeams(s,p) = (s==='large'||s==='platform') && p !== 'conservative'
```

### 5.1 Full edge-case table — all 5 × 3 × 3 = 45 cells

Format: `raw = scopeBase + parallelismBoost + riskBoost → clamped workerCap`. **Bold** rows are where clamp changes the raw value.

| scope | parallelism | risk | raw | clamped |
|---|---|---|---|---|
| **tiny** | **conservative** | **low** | **0** | **1** |
| tiny | conservative | medium | 1 | 1 |
| tiny | conservative | high | 2 | 2 |
| tiny | balanced | low | 1 | 1 |
| tiny | balanced | medium | 2 | 2 |
| tiny | balanced | high | 3 | 3 |
| tiny | aggressive | low | 3 | 3 |
| tiny | aggressive | medium | 4 | 4 |
| tiny | aggressive | high | 5 | 5 |
| **small** | **conservative** | **low** | **1** | **1** |
| small | conservative | medium | 2 | 2 |
| small | conservative | high | 3 | 3 |
| small | balanced | low | 2 | 2 |
| small | balanced | medium | 3 | 3 |
| small | balanced | high | 4 | 4 |
| small | aggressive | low | 4 | 4 |
| small | aggressive | medium | 5 | 5 |
| small | aggressive | high | 6 | 6 |
| medium | conservative | low | 3 | 3 |
| medium | conservative | medium | 4 | 4 |
| medium | conservative | high | 5 | 5 |
| medium | balanced | low | 4 | 4 |
| medium | balanced | medium | 5 | 5 | ← **demo default**
| medium | balanced | high | 6 | 6 |
| medium | aggressive | low | 6 | 6 |
| medium | aggressive | medium | 7 | 7 |
| medium | aggressive | high | 8 | 8 |
| large | conservative | low | 5 | 5 |
| large | conservative | medium | 6 | 6 |
| large | conservative | high | 7 | 7 |
| large | balanced | low | 6 | 6 |
| large | balanced | medium | 7 | 7 |
| large | balanced | high | 8 | 8 |
| large | aggressive | low | 8 | 8 |
| large | aggressive | medium | 9 | 9 |
| large | aggressive | high | 10 | 10 |
| platform | conservative | low | 7 | 7 |
| platform | conservative | medium | 8 | 8 |
| platform | conservative | high | 9 | 9 |
| platform | balanced | low | 8 | 8 |
| platform | balanced | medium | 9 | 9 |
| platform | balanced | high | 10 | 10 |
| platform | aggressive | low | 10 | 10 |
| platform | aggressive | medium | 11 | 11 |
| **platform** | **aggressive** | **high** | **12** | **12** |

**Clamp-affected cells:** exactly **1 row** differs from raw: `tiny + conservative + low` (raw 0 → clamp 1). The upper bound (12) is hit by `platform + aggressive + high` (raw 12, no change). No cell exceeds 12 in the raw calculation, so the `min(12, …)` clamp is a safety guard only and never fires for valid inputs. Unit test: assert exactly one row differs pre/post clamp.

### 5.2 `computeWavePlan` — single call site for everything the UI + templates need

```ts
function computeWavePlan(input: SeedInput): WavePlan {
  const cap = workerCap(input.scope, input.parallelism, input.risk)
  return {
    workerCap: cap,
    decompositionDepth: decompositionDepth(input.scope),
    useAgentTeams: shouldUseAgentTeams(input.scope, input.parallelism),
    phaseSchedule: PHASE_TABLE.map(p => ({
      ...p,
      workers: p.dynamicWorkers ? cap : p.fixedWorkers,
    })),
  }
}
```

`PHASE_TABLE` lives in `constants.ts` — each of the 9 entries is fully specified except phase 4 ("Build") which sets `dynamicWorkers: true`. All other phases have `fixedWorkers: 1 | 2` from the canonical table.

---

## 6. `WavePlan` interface (full shape)

```ts
export interface PhaseSpec {
  index: 0|1|2|3|4|5|6|7|8
  name: 'Recon'|'Strategy'|'Decompose'|'Architecture'|'Build'|'Wire'|'Test'|'Review'|'Integration'
  model: 'Haiku' | 'Sonnet' | 'Opus'
  effort: 'default' | 'high'
  duration: string        // e.g. "30s", "2m", "5m" — template display only
  fanout: string          // e.g. "Builder × workerCap"
  workers: number         // resolved count after computeWavePlan
  artifact: string        // e.g. "00-recon.md"
}

export interface WavePlan {
  workerCap: number           // 1..12, clamped
  decompositionDepth: 1 | 2 | 3
  useAgentTeams: boolean
  phaseSchedule: PhaseSpec[]  // exactly 9 entries, index 0..8
}
```

Architect-A owns the canonical `seedSchema.ts`; above is my proposal that Architect-A should accept or adjust.

---

## 7. `GeneratedSeed` interface

```ts
export interface GeneratedSeed {
  seedMd: string
  claudeMd: string
  agentsMd: string
  claudeAgents: {
    reviewer: string
    recon: string
    tester: string
  }
  codexAgents: {
    reviewer: string
    worker: string
  }
  codexConfig: string
  macosSetup: string
  ubuntuBootstrap: string
  /** Convenience — same values as above flattened for preview tabs and the ZIP builder. */
  manifest: BundleFile[]
  /** The WavePlan used to render, exposed so PhaseOctopus.tsx can consume the same object. */
  plan: WavePlan
}

export interface BundleFile {
  path: string        // e.g. ".claude/agents/reviewer.md" (under specseed-output/)
  content: string
  mime: 'text/markdown' | 'text/x-toml' | 'text/x-shellscript' | 'text/plain'
}
```

Rationale for including `plan` in the bundle: `SeedGenerator.tsx` uses `useMemo(() => compileFullSeed(input), [input])` and then passes `result.plan` to `PhaseOctopus`. Avoids recomputing.

---

## 8. Top-level orchestrator (`compileFullSeed.ts`)

```ts
export function compileFullSeed(input: SeedInput): GeneratedSeed {
  const plan = computeWavePlan(input)

  const seedMd = generateSeed(input, plan)
  const claudeMd = generateClaudeMd(input)
  const agentsMd = generateAgentsMd(input)

  const claudeAgents = {
    reviewer: generateClaudeReviewerAgent(input),
    recon:    generateClaudeReconAgent(input),
    tester:   generateClaudeTesterAgent(input),
  }
  const codexAgents = {
    reviewer: generateCodexReviewerAgent(input),
    worker:   generateCodexWorkerAgent(input),
  }
  const codexConfig       = generateCodexConfig(input, plan)
  const macosSetup        = generateMacosSetup(input)
  const ubuntuBootstrap   = generateUbuntuBootstrap(input)

  const bundle: GeneratedSeed = {
    seedMd, claudeMd, agentsMd,
    claudeAgents, codexAgents, codexConfig,
    macosSetup, ubuntuBootstrap,
    plan,
    manifest: [],           // filled below to avoid referencing bundle before init
  }
  bundle.manifest = toBundleManifest(bundle)
  return bundle
}
```

### 8.1 Conditional logic decision — always generate, never skip

The strategy specifies the ZIP always contains all 11 files regardless of `environment`. So:

- **All 11 generator functions run unconditionally.** `input.environment` is not a gate.
- `input.environment` **does** flow into **section 10 of SEED.md** (OS Adapter) which picks `macos` / `ubuntu` / `both` language.
- `input.environment` **does** flow into `generateMacosSetup` + `generateUbuntuBootstrap` as an "active/passive" marker comment at the top of each script (e.g. `# Generated as primary target` vs `# Included for completeness`).
- `input.agentPlatform === 'codex'` still generates the Claude adapter files (and vice versa) — the adapter pack is a superset. This is the intentionally-liberal MVP policy; the form hint should say "all adapters always included".

This matches `seed-brief.md` line: *"MOS says 10 in one place and 11 in another; we ship all 11 ... Safer to always include both in MVP."*

---

## 9. SEED.md section builders — per-section approach (recommended)

**Recommendation: per-section small functions, not one big template literal.**

Reasons:
1. **Testability.** Each of `buildSection01..buildSection11` can be snapshot-tested with a fixed `SeedInput`/`WavePlan` fixture. Snapshot mismatch immediately localizes the failing section.
2. **Readability.** A 200-line template literal with 40 interpolations is hand-grenade territory. 11 × ~30-line functions are each browsable on one screen.
3. **Reuse.** Section 8 (Claude Adapter) and Section 9 (Codex Adapter) share structure with the standalone CLAUDE.md / AGENTS.md files but with different emphasis — separate builders let us DRY cleanly.
4. **Determinism traceability.** Every line of output has one producing function. A regression in "Section 6 Agent Roles" traces to `buildSection06_AgentRoles` immediately.

### 9.1 Canonical section interfaces

```ts
type SectionBuilder       = (input: SeedInput) => string
type PlanSectionBuilder   = (input: SeedInput, plan: WavePlan) => string
```

### 9.2 Per-section summary (composition plan)

| # | Function | Takes plan? | Key contents |
|---|---|---|---|
| 1 | `buildSection01_Objective` | no | `## 1. Objective` heading + `input.objective` paragraph + project-type context line |
| 2 | `buildSection02_OperatingPrinciple` | no | Fixed 4-bullet operating-principle text + `outputStyle` modifier paragraph |
| 3 | `buildSection03_TargetRuntime` | no | `deploymentTarget` + `environment` resolved to concrete runtime statement |
| 4 | `buildSection04_GlobalConstraints` | no | `input.constraints` bullets + fixed guardrails list (no network, no DB, etc.) |
| 5 | `buildSection05_NinePhaseOctopus` | **yes** | `markdownTable(['#','Name','Model','Effort','Duration','Fan-out','Artifact'], plan.phaseSchedule.map(...))` |
| 6 | `buildSection06_AgentRoles` | **yes** | Role roster: Recon/Strategist/Decomposer/Architect/Builder/Wirer/Tester/Reviewer/Integrator, with `plan.useAgentTeams` conditional for team tiers |
| 7 | `buildSection07_WavePlan` | **yes** | `workerCap=${plan.workerCap}` + `decompositionDepth=${plan.decompositionDepth}` + explanatory table |
| 8 | `buildSection08_ClaudeAdapter` | no | Summary of CLAUDE.md + paths to 3 `.claude/agents/*.md` |
| 9 | `buildSection09_CodexAdapter` | no | Summary of AGENTS.md + paths to `.codex/config.toml` and 2 `.codex/agents/*.toml` |
| 10 | `buildSection10_OSAdapter` | no | Branches on `input.environment`; lists `macos-setup.sh` / `ubuntu-bootstrap.md` / both |
| 11 | `buildSection11_DefinitionOfDone` | **yes** | Fixed DoD checklist + dynamic line: "Parallel build wave uses ${plan.workerCap} workers; ${plan.decompositionDepth}-level decomposition." |

### 9.3 `generateSeed` composition

```ts
export function generateSeed(input: SeedInput, plan: WavePlan): string {
  return joinLines([
    `# SpecSeed: ${input.projectName}`,
    '',
    buildSection01_Objective(input),
    buildSection02_OperatingPrinciple(input),
    buildSection03_TargetRuntime(input),
    buildSection04_GlobalConstraints(input),
    buildSection05_NinePhaseOctopus(input, plan),
    buildSection06_AgentRoles(input, plan),
    buildSection07_WavePlan(input, plan),
    buildSection08_ClaudeAdapter(input),
    buildSection09_CodexAdapter(input),
    buildSection10_OSAdapter(input),
    buildSection11_DefinitionOfDone(input, plan),
    '',
    '---',
    '',
    `*Generated by SpecSeed.io — deterministic template output.*`,
  ])
}
```

No `Date.now()`. No build timestamp. The footer is static text.

---

## 10. CLAUDE.md template sketch

Template string (targeted at ~120–150 lines — well under 200 regardless of input length; free-text fields trimmed via `.slice(0, 400)` in `generateClaudeMd` to enforce the cap):

```ts
export function generateClaudeMd(input: SeedInput): string {
  const { projectName, objective, projectType, deploymentTarget } = input
  const stackNotes = input.repoNotes.trim() || '(none provided)'
  return joinLines([
    `# CLAUDE.md — ${projectName}`,
    '',
    `## Mission`,
    `${objective}`,
    '',
    `## Operating doctrine`,
    `1. Read SEED.md before any session that touches core ${projectName} logic.`,
    `2. Explore before coding. Use the recon subagent at session start.`,
    `3. Collapse each phase into a _mos/ artifact before moving on.`,
    `4. Keep implementation changes scoped. One wave at a time.`,
    `5. Run lint + build after every material change.`,
    '',
    `## Subagents`,
    `- @.claude/agents/recon.md`,
    `- @.claude/agents/tester.md`,
    `- @.claude/agents/reviewer.md`,
    '',
    `## Build commands`,
    buildCommandsFor(projectType, deploymentTarget),     // private helper, returns 3–6 lines of fenced bash
    '',
    `## Stack notes`,
    stackNotes,
    '',
    `## File ownership`,
    fileOwnershipFor(projectType),                       // private helper
    '',
    `## References`,
    `- @docs/${slugify(projectName)}-product.md`,
    `- @docs/phase-octopus.md`,
    `- @SEED.md`,
    '',
    `## Verification`,
    `Always run lint + build after material changes. Fix at root cause, not with suppression comments.`,
  ])
}
```

Two private helpers inside `generateClaudeAdapter.ts` (`buildCommandsFor`, `fileOwnershipFor`) keep the logic deterministic and readable. Each returns a short fenced block. Unit tests iterate all `projectType × deploymentTarget` combos to confirm ≤ 200 lines for every input.

---

## 11. AGENTS.md template sketch

```ts
export function generateAgentsMd(input: SeedInput): string {
  const { projectName, objective, environment, projectType, deploymentTarget } = input
  return joinLines([
    `# AGENTS.md — ${projectName}`,
    '',
    `## Purpose`,
    `Instructions for Codex when working on this repo.`,
    objective ? `` : false,
    objective ? `Mission: ${objective}` : false,
    '',
    `## Spawning subagents`,
    `When working a multi-component task, spawn explicitly. Example:`,
    '',
    '```',
    `Spawn one agent for [task A], one for [task B].`,
    `Wait for both. Return a consolidated implementation plan before editing files.`,
    '```',
    '',
    `## Scope boundaries`,
    `- Workers receive a single scoped task. Do not refactor adjacent code.`,
    `- Reviewers are read-only. They do not edit files.`,
    `- Use \`.codex/config.toml\` \`max_threads\` as the hard ceiling on parallel fan-out.`,
    environment === 'macos'  ? `- Host: macOS. See macos-setup.sh.` : false,
    environment === 'ubuntu' ? `- Host: Ubuntu. See ubuntu-bootstrap.md.` : false,
    environment === 'both'   ? `- Hosts: macOS and Ubuntu. Run the matching bootstrap for each.` : false,
    '',
    `## Build commands`,
    buildCommandsFor(projectType, deploymentTarget),
    '',
    `## References`,
    `- @docs/${slugify(projectName)}-product.md`,
    `- @SEED.md`,
  ])
}
```

`joinLines` drops the `false` entries deterministically.

---

## 12. Claude agent files (3) — YAML frontmatter + body

### 12.1 Shape (shared)

```markdown
---
name: <slug>
description: <escaped one-line summary>
tools: <comma-separated list>
model: <opus|sonnet|haiku>
---

<body text — ~15–40 lines>
```

### 12.2 Reviewer — model `opus`

```ts
export function generateClaudeReviewerAgent(input: SeedInput): string {
  return joinLines([
    '---',
    `name: reviewer`,
    `description: ${escapeYaml(`Read-only review of ${input.projectName} implementation diffs. Catches regressions, scope creep, and architectural drift before merge.`)}`,
    `tools: Read, Grep, Glob`,
    `model: opus`,
    '---',
    '',
    `You are the reviewer agent for ${input.projectName}.`,
    '',
    `## Scope`,
    `- Read-only. Never edit files.`,
    `- Compare implementation against SEED.md Sections 5, 7, and 11.`,
    `- Flag: untested paths, skipped lint, ignored type errors, unscoped refactors.`,
    '',
    `## Output`,
    `Return a checklist against the Definition of Done. One line per item: PASS / FAIL / N/A with a reason.`,
  ])
}
```

### 12.3 Recon — model `haiku`

```ts
// tools: Read, Grep, Glob, Bash
// Body: "Inventory the repo. Output a short map of files, dependencies, and open TODOs. 30 seconds of effort. No code changes."
```

### 12.4 Tester — model `sonnet`

```ts
// tools: Read, Write, Edit, Bash, Grep, Glob
// Body: "Write unit + smoke tests for wave algorithm and bundle manifest determinism. Run `npm run lint && npm run build`. Report failures with file:line."
```

Tools differ: **reviewer** is read-only (`Read, Grep, Glob`); **recon** adds `Bash` for quick shell inventory; **tester** gets the full toolkit for writing test files and running commands.

---

## 13. Codex agent TOMLs (2) + config.toml

### 13.1 `config.toml` — `generateCodexConfig(input, plan)`

```ts
export function generateCodexConfig(input: SeedInput, plan: WavePlan): string {
  return joinLines([
    `# Codex config for ${input.projectName}`,
    `[agents]`,
    `max_threads = ${Math.min(6, plan.workerCap)}`,    // CAP at 6 per MOS canonical value; still tracks plan
    `max_depth = ${plan.decompositionDepth}`,
  ])
}
```

Decision: `max_threads` follows `min(6, plan.workerCap)` so the MOS canonical `max_threads = 6` is the ceiling even when `workerCap` would push higher. This is deterministic. If Architect-B disagrees, override to a flat `6`.

### 13.2 `.codex/agents/reviewer.toml` — model `o3`, reasoning `high`

```ts
export function generateCodexReviewerAgent(input: SeedInput): string {
  return joinLines([
    `name = ${tomlString('reviewer')}`,
    `description = ${tomlString(`Read-only review of ${input.projectName} diffs against SEED.md.`)}`,
    `model = ${tomlString('o3')}`,
    `model_reasoning_effort = ${tomlString('high')}`,
    `sandbox_mode = ${tomlString('read-only')}`,
    ``,
    `developer_instructions = """`,
    `You are the reviewer for ${input.projectName}.`,
    `- Compare diffs to SEED.md Sections 5, 7, 11.`,
    `- Never edit files.`,
    `- Return a DoD checklist: PASS / FAIL / N/A per item.`,
    `"""`,
  ])
}
```

### 13.3 `.codex/agents/worker.toml` — model `o4-mini`, reasoning `medium`

```ts
export function generateCodexWorkerAgent(input: SeedInput): string {
  return joinLines([
    `name = ${tomlString('worker')}`,
    `description = ${tomlString(`Single-task implementer for ${input.projectName}.`)}`,
    `model = ${tomlString('o4-mini')}`,
    `model_reasoning_effort = ${tomlString('medium')}`,
    `sandbox_mode = ${tomlString('workspace-write')}`,
    ``,
    `developer_instructions = """`,
    `You implement one scoped task from the wave plan.`,
    `- Stay inside the assigned files.`,
    `- Do not refactor adjacent code.`,
    `- Run lint + build before reporting done.`,
    `"""`,
  ])
}
```

All TOML string values go through `tomlString()` for escape safety.

---

## 14. OS adapter scripts

### 14.1 `macos-setup.sh` (bash)

```ts
export function generateMacosSetup(input: SeedInput): string {
  const primary = input.environment === 'macos' || input.environment === 'both'
  return joinLines([
    `#!/usr/bin/env bash`,
    `set -euo pipefail`,
    ``,
    primary ? `# Generated as primary target for ${input.projectName}.`
            : `# Included for completeness. Primary target is ubuntu.`,
    ``,
    `# Check Node + npm versions.`,
    `command -v node >/dev/null 2>&1 || { echo "node not found. Install via Homebrew: brew install node" >&2; exit 1; }`,
    `command -v npm  >/dev/null 2>&1 || { echo "npm not found." >&2; exit 1; }`,
    ``,
    `NODE_MAJOR=$(node -v | sed -E 's/v([0-9]+)\\..*/\\1/')`,
    `if [ "$NODE_MAJOR" -lt 20 ]; then`,
    `  echo "Node 20+ required. Found: $(node -v)" >&2`,
    `  exit 1`,
    `fi`,
    ``,
    `echo "node $(node -v) / npm $(npm -v) ok"`,
    ``,
    `# Install deps.`,
    `npm install`,
    ``,
    `# Note: For background jobs on macOS use launchd plists under ~/Library/LaunchAgents.`,
    `# cron exists but launchd is the native idiom on macOS 10.10+.`,
    ``,
    `echo "${input.projectName} setup complete."`,
  ])
}
```

### 14.2 `ubuntu-bootstrap.md` (markdown w/ embedded bash)

```ts
export function generateUbuntuBootstrap(input: SeedInput): string {
  const primary = input.environment === 'ubuntu' || input.environment === 'both'
  const slug = slugify(input.projectName)
  return joinLines([
    `# Ubuntu bootstrap — ${input.projectName}`,
    '',
    primary ? `Target: Ubuntu 22.04 LTS or 24.04 LTS.`
            : `Included for completeness. Primary target is macOS.`,
    '',
    `## 1. Base packages`,
    '```bash',
    `sudo apt update && sudo apt upgrade -y`,
    `sudo apt install -y curl ca-certificates gnupg build-essential git ufw nginx certbot python3-certbot-nginx jq`,
    '```',
    '',
    `## 2. Node 20.x`,
    '```bash',
    `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`,
    `sudo apt install -y nodejs`,
    '```',
    '',
    `## 3. Deploy user (non-root)`,
    '```bash',
    `sudo adduser --disabled-password --gecos "" deploy`,
    `sudo usermod -aG sudo deploy`,
    `sudo mkdir -p /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh`,
    `sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys`,
    `sudo chown -R deploy:deploy /home/deploy/.ssh`,
    '```',
    '',
    `## 4. SSH hardening`,
    'Edit `/etc/ssh/sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no`, then `sudo systemctl reload ssh`.',
    '',
    `## 5. UFW`,
    '```bash',
    `sudo ufw allow OpenSSH`,
    `sudo ufw allow "Nginx Full"`,
    `sudo ufw --force enable`,
    '```',
    '',
    `## 6. nginx site + TLS`,
    '```bash',
    `sudo tee /etc/nginx/sites-available/${slug} <<'EOF'`,
    `server {`,
    `  listen 80;`,
    `  server_name ${slug}.example.com;`,
    `  root /var/www/${slug}/out;`,
    `  index index.html;`,
    `  location / { try_files $uri $uri/ =404; }`,
    `}`,
    `EOF`,
    `sudo ln -sf /etc/nginx/sites-available/${slug} /etc/nginx/sites-enabled/${slug}`,
    `sudo nginx -t && sudo systemctl reload nginx`,
    `sudo certbot --nginx -d ${slug}.example.com --non-interactive --agree-tos -m admin@${slug}.example.com`,
    '```',
    '',
    `## 7. Deploy path`,
    '```bash',
    `sudo mkdir -p /var/www/${slug}`,
    `sudo chown deploy:deploy /var/www/${slug}`,
    '```',
  ])
}
```

Both scripts are valid shell / markdown. The Ubuntu doc embeds bash inside fenced blocks; the macOS file is pure bash.

---

## 15. Determinism verification

**All generator functions are deterministic.** Explicit scan:

| Non-deterministic source | Used anywhere? |
|---|---|
| `Date.now()` | **No** |
| `new Date()` | **No** |
| `crypto.randomUUID()` | **No** |
| `Math.random()` | **No** |
| `process.env.*` | **No** |
| `performance.now()` | **No** |
| Iteration order on `Object.keys(obj)` for non-stable objects | **No** — every loop iterates a typed array literal (PHASE_TABLE, fixed enum list) with explicit order |
| `toLocaleString`, locale-sensitive APIs | **No** |
| Network / fs / Web APIs inside generator code | **No** — `clipboard.ts` and `downloadBundle.ts` use browser APIs but are NOT part of the generator pipeline; `compileFullSeed` never calls them |

**Flagged exception:** NONE. Footer timestamps are omitted by design. If the UI ever needs to display "Generated at …", that text is built in the component layer from `Date.now()` and never fed back into any templated artifact.

Unit test plan: run `compileFullSeed(demoInput)` twice, assert byte-equality of every field in `GeneratedSeed` including nested `manifest` entries. Run in Node and browser to catch any accidental `globalThis` drift.

---

## 16. Testability

One-sentence test plan per module:

| Module | Unit test approach |
|---|---|
| `wavePlan.ts` | Enumerate all 45 cells and assert `workerCap` equals the table in §5.1; separately assert `decompositionDepth` + `shouldUseAgentTeams` across all scope/parallelism combos. |
| `helpers.ts` | Golden-input tests per helper (`slugify('SpecSeed.io')==='specseed-io'`, `markdownTable` matches fixed snapshot, `tomlString('He said "hi"')` escapes correctly). |
| `generateSeedSections.ts` | Per-section snapshot test with the demo input; when a section changes, the diff pinpoints which builder. |
| `generateSeed.ts` | Compose snapshot for the full SEED.md under demo input + one extreme (platform/aggressive/high). |
| `generateClaudeAdapter.ts` | Snapshot CLAUDE.md + 3 agents; assert CLAUDE.md line count ≤ 200 for all 6×5=30 projectType×deploymentTarget combinations. |
| `generateCodexAdapter.ts` | Snapshot AGENTS.md, config.toml, 2 agent .toml files. Assert TOML parses (import a tiny JS TOML parser in tests only, not runtime). |
| `generateOSAdapters.ts` | Assert bash begins with `#!/usr/bin/env bash` and `set -euo pipefail`; shellcheck (devDep only, not runtime) the output. |
| `compileFullSeed.ts` | Determinism: run twice, deep-equal. Shape: assert every `GeneratedSeed` key is a non-empty string (or populated nested object). |
| `bundleManifest.ts` | Assert exactly 11 entries, expected paths, MIME types, no duplicates. |
| `clipboard.ts` | Mock `navigator.clipboard.writeText`; test both primary and textarea-fallback paths. |
| `downloadBundle.ts` | Mock `document.createElement` + `URL.createObjectURL`; assert `click()` called with correct filename. |

---

## 17. Unknowns / flags for Architect

1. **`WavePlan` ownership.** I sketched the interface in §6 but `seedSchema.ts` is Architect-A's jurisdiction. If Architect-A lands a different shape (e.g. `workerCount` instead of `workerCap`, or `phaseSchedule` keyed by phase name), all builders in `generateSeedSections.ts` and the `PhaseOctopus` consumer need to align. **Flag for collapse.**

2. **Codex `max_threads` vs `workerCap`.** MOS lists a fixed `max_threads = 6`. I've proposed `min(6, plan.workerCap)` so conservative inputs don't over-spawn. If the canonical MOS expects a literal `6` regardless of input, Architect-B should override in `generateCodexConfig`.

3. **Build-commands helper signature.** `buildCommandsFor(projectType, deploymentTarget)` returns a fenced bash block. Its exact output per combo (6 projectType × 5 deploymentTarget = 30 cells) isn't specified in seed-brief. I'll propose the matrix in my collapse notes but Architect-B may want to author it as part of contract pinning.

4. **CLAUDE.md `@docs` imports.** I reference `@docs/${slug}-product.md` and `@docs/phase-octopus.md`. These files are created in Phase 8 per strategy — safe to reference with `@` syntax even if they don't exist yet (Claude handles missing imports gracefully). Flagging in case Architect wants a different naming scheme.

5. **File ownership section content.** `fileOwnershipFor(projectType)` content is sketched but not canonical — depends on Architect-A's file tree. Plan to wire this to the final tree once collapse is done.

6. **ZIP top-level folder name.** Seed-brief says `specseed-output/`. I've kept this hardcoded in `bundleManifest.ts`. If the name should vary per project (`${slug}-output/`), flag for override.

7. **Tester agent model.** Spec says `sonnet`. No model version qualifier. Using bare `sonnet` — Architect to confirm or bump to a specific version string.

8. **YAML list syntax for `tools` field.** I'm using comma-separated inline (`tools: Read, Grep, Glob`). Claude Code also accepts the YAML list form. Inline is terser and deterministic; flagging in case Architect prefers list form.

---

*CC-OPS-SPECSEED — Decomposer B*
