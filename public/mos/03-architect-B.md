# 03-architect-B.md — Function Signatures + Integration / Data Flow

**Authored:** 2026-04-21
**Author:** Architect Worker B (Opus 4.7, 1M ctx subagent)
**Task:** Phase 3 Worker B — canonical function signatures, contracts, end-to-end data flow.
**Scope:** Complements Architect A (file tree + interfaces). No source code emitted; this is a binding spec for Phase 4 builders.
**Parallel-write note:** `02-decompose-A.md`, `02-decompose-B.md`, `03-architect-A.md` were NOT present at read time (13:36 UTC). Signatures here are derived from `01-strategy.md` + `seed-brief.md` directly; the orchestrator reconciles at collapse.

---

## 1. Canonical function signatures

All exported functions in `lib/`, grouped by file. Every function is **pure** (deterministic, no side effects) unless explicitly marked impure (clipboard, download helpers).

### 1.1 `lib/seedSchema.ts`

Shared types only — no runtime code. Architect A owns the authoritative interface definitions; this section reproduces the canonical type exports used by every other signature below.

```ts
export type Scope = 'tiny' | 'small' | 'medium' | 'large' | 'platform';
export type Parallelism = 'conservative' | 'balanced' | 'aggressive';
export type Risk = 'low' | 'medium' | 'high';
export type ProjectType =
  | 'landing-page' | 'saas-app' | 'docs-site'
  | 'dashboard'   | 'api'      | 'full-stack-app';
export type AgentPlatform = 'claude-code' | 'codex' | 'both';
export type Environment = 'macos' | 'ubuntu' | 'both';
export type OutputStyle = 'concise' | 'detailed' | 'exhaustive';
export type DeploymentTarget = 'static' | 'vercel' | 'docker' | 'ubuntu-vps' | 'custom';
export type ClaudeAgentName = 'reviewer' | 'recon' | 'tester';
export type CodexAgentName = 'reviewer' | 'worker';

export interface SeedInput {
  projectName: string;
  objective: string;
  projectType: ProjectType;
  agentPlatform: AgentPlatform;
  environment: Environment;
  scope: Scope;
  risk: Risk;
  parallelism: Parallelism;
  outputStyle: OutputStyle;
  deploymentTarget: DeploymentTarget;
  constraints: string;
  repoNotes: string;
}

export interface WavePlan {
  workerCap: number;                // clamped [1,12]
  decompositionDepth: 1 | 2 | 3;
  useAgentTeams: boolean;
  phases: PhaseSpec[];              // length 9, phases 0..8
}

export interface PhaseSpec {
  id: 0|1|2|3|4|5|6|7|8;
  name: string;
  model: 'Haiku' | 'Sonnet' | 'Opus';
  effort: 'default' | 'high';
  duration: string;                 // e.g. "30s", "2m"
  fanout: string;                   // e.g. "Builder × 5"
  artifact: string;                 // e.g. "04-build.md"
  workerCount: number;              // resolved (phase 4 uses workerCap; others ≥1)
}

export interface GeneratedSeed {
  seedMd: string;
  claudeMd: string;
  agentsMd: string;
  claudeAgents: Record<ClaudeAgentName, string>;
  codexAgents: Record<CodexAgentName, string>;
  codexConfig: string;
  macosSetup: string;
  ubuntuBootstrap: string;
}

export const DEFAULT_SEED_INPUT: SeedInput;  // frozen demo input from seed-brief
```

### 1.2 `lib/wavePlan.ts`

```ts
/** Compute parallel worker cap, clamped to [1,12]. */
export function workerCap(scope: Scope, parallelism: Parallelism, risk: Risk): number;

/** Depth of dependency decomposition for build phase planning. */
export function decompositionDepth(scope: Scope): 1 | 2 | 3;

/** Whether a project warrants agent-team structures (nested fan-out). */
export function shouldUseAgentTeams(scope: Scope, parallelism: Parallelism): boolean;

/** Resolve the nine PhaseSpec rows with dynamic worker counts inserted. */
export function buildPhases(cap: number): PhaseSpec[];

/** Full wave plan for an input — phase schedule + worker cap + depth + teams flag. */
export function buildWavePlan(input: SeedInput): WavePlan;
```

### 1.3 `lib/generateSeed.ts`

```ts
/** Build the full SEED.md string (exactly 11 top-level `##` sections). */
export function generateSeed(input: SeedInput, plan: WavePlan): string;

/** Section 1 — Objective. */
export function sectionObjective(input: SeedInput): string;

/** Section 2 — Operating Principle. */
export function sectionOperatingPrinciple(input: SeedInput): string;

/** Section 3 — Target Runtime. */
export function sectionTargetRuntime(input: SeedInput): string;

/** Section 4 — Global Constraints. */
export function sectionGlobalConstraints(input: SeedInput): string;

/** Section 5 — Nine-Phase Octopus (markdown table of plan.phases). */
export function sectionNinePhaseOctopus(plan: WavePlan): string;

/** Section 6 — Agent Roles. */
export function sectionAgentRoles(input: SeedInput, plan: WavePlan): string;

/** Section 7 — Wave Plan (worker cap, depth, teams, waves). */
export function sectionWavePlan(plan: WavePlan): string;

/** Section 8 — Claude Code Adapter (references only; files ship separately). */
export function sectionClaudeAdapter(input: SeedInput): string;

/** Section 9 — Codex Adapter. */
export function sectionCodexAdapter(input: SeedInput): string;

/** Section 10 — OS Adapter (selects macos/ubuntu/both per input.environment). */
export function sectionOsAdapter(input: SeedInput): string;

/** Section 11 — Definition of Done. */
export function sectionDefinitionOfDone(input: SeedInput): string;
```

### 1.4 `lib/generateClaudeMd.ts`

```ts
/** Build CLAUDE.md (< 200 lines) tailored to the input. */
export function generateClaudeMd(input: SeedInput): string;

/** Mission paragraph derived from objective. */
export function claudeMission(input: SeedInput): string;

/** Stack-appropriate npm/pnpm/cargo/etc. build commands. */
export function buildCommandsFor(input: SeedInput): string;

/** File-ownership summary from projectType + deploymentTarget. */
export function fileOwnershipSummary(input: SeedInput): string;
```

### 1.5 `lib/generateAgentsMd.ts`

```ts
/** Build AGENTS.md (Codex-facing) tailored to the input. */
export function generateAgentsMd(input: SeedInput): string;

/** Environment-specific notes (macos | ubuntu | both). */
export function environmentNotes(env: Environment): string;
```

### 1.6 `lib/generateClaudeAgent.ts`

```ts
/** Build a single `.claude/agents/{name}.md` file with YAML frontmatter + body. */
export function generateClaudeAgent(name: ClaudeAgentName, input: SeedInput): string;

/** The YAML frontmatter block (starts and ends with `---\n`). */
export function claudeAgentFrontmatter(name: ClaudeAgentName, input: SeedInput): string;

/** The markdown body (no frontmatter). */
export function claudeAgentBody(name: ClaudeAgentName, input: SeedInput): string;
```

### 1.7 `lib/generateCodexAgent.ts`

```ts
/** Build `.codex/agents/{name}.toml` (parseable by the `toml` crate). */
export function generateCodexAgent(name: CodexAgentName): string;
```

### 1.8 `lib/generateCodexConfig.ts`

```ts
/** Build `.codex/config.toml` — `[agents] max_threads max_depth`. */
export function generateCodexConfig(): string;
```

### 1.9 `lib/generateMacosSetup.ts`

```ts
/** Build `macos-setup.sh` — bash script with `set -euo pipefail`. */
export function generateMacosSetup(input: SeedInput): string;
```

### 1.10 `lib/generateUbuntuBootstrap.ts`

```ts
/** Build `ubuntu-bootstrap.md` — apt bootstrap runbook. */
export function generateUbuntuBootstrap(input: SeedInput): string;
```

### 1.11 `lib/compileFullSeed.ts`

```ts
/** Top-level orchestrator. Calls every sub-generator. Pure, synchronous. */
export function compileFullSeed(input: SeedInput): GeneratedSeed;
```

### 1.12 `lib/clipboard.ts` — IMPURE

```ts
/**
 * Write text to clipboard. Prefers navigator.clipboard, falls back to
 * an offscreen textarea + document.execCommand('copy').
 * Resolves true if modern API used, false if fallback used.
 * Rejects only on total failure (no DOM, no clipboard API, no exec command).
 */
export function copyToClipboard(text: string): Promise<boolean>;
```

### 1.13 `lib/download.ts` — IMPURE

```ts
/** Trigger a browser download of `content` as `filename`. No-op on SSR. */
export function downloadFile(
  filename: string,
  content: string | Blob,
  mime?: string
): void;

/** Build a JSZip bundle from a GeneratedSeed and trigger download. */
export function downloadBundle(
  bundle: GeneratedSeed,
  projectSlug: string
): Promise<void>;
```

### 1.14 `lib/slug.ts`

```ts
/** Filesystem-safe kebab-case slug from an arbitrary project name. */
export function toSlug(projectName: string): string;
```

### 1.15 `lib/yaml.ts` and `lib/toml.ts` (tiny in-repo emitters — no dep)

```ts
/** Serialize a flat string-keyed record as YAML frontmatter (between `---`). */
export function yamlFrontmatter(fields: Record<string, string | string[]>): string;

/** Serialize a flat table as TOML. Escapes quotes in string values. */
export function tomlTable(table: string, fields: Record<string, string | number | boolean>): string;
```

---

## 2. Function-level contracts

Preconditions (what the function assumes about its input), postconditions (what it guarantees about its output), and invariants (what is true regardless of input).

### 2.1 `compileFullSeed(input: SeedInput): GeneratedSeed`

**Preconditions**
- `input` is a fully populated `SeedInput`. All 12 fields are present (TypeScript enforces; no runtime guard).
- `input.projectName.trim().length > 0` — empty project name is caller's responsibility to block in the form.
- `input.objective` may be an empty string (generator tolerates; SEED.md Section 1 gets a placeholder paragraph).

**Postconditions**
- Returns a `GeneratedSeed` object with all 8 keys populated with non-empty strings (and `claudeAgents` / `codexAgents` with all their respective keys populated).
- Every string ends with exactly one trailing `\n`.
- No string contains the literal substring `undefined` or the literal substring `null` (outside of TOML/YAML where those are intentional literal values — and we emit neither).
- `bundle.seedMd` contains exactly 11 top-level `## ` headings in the canonical order.
- `bundle.claudeMd.split('\n').length < 200`.

**Invariants**
- Pure and synchronous. No I/O, no `await`, no `Math.random`, no `Date.now` in output. Same input bytes → same output bytes.
- Line endings are `\n` only. Never `\r\n`. Builders MUST NOT use template literals that have been pasted with CRLF.
- Runs in < 5 ms on the default input on a mid-tier 2024 laptop (single synchronous call, string concatenation only).

### 2.2 `generateSeed(input, plan): string`

**Preconditions**
- `plan === buildWavePlan(input)` — caller passes a plan consistent with the input. (The orchestrator `compileFullSeed` guarantees this; direct callers must uphold it.)
- `plan.phases.length === 9` and phase ids are `0,1,2,3,4,5,6,7,8` in order.

**Postconditions**
- Output begins with `# SpecSeed: ${input.projectName}\n\n`.
- Contains exactly 11 `## ` sections in canonical order (§1..§11 per `seed-brief`).
- Section 5's markdown table has exactly 9 data rows + 1 header + 1 separator = 11 lines of pipes.
- Section 7 references `plan.workerCap` by literal number and `plan.decompositionDepth` by literal digit.
- No markdown section is empty.

**Invariants**
- Never emits `${` (i.e. un-substituted template literal) — check in tests by grep.
- Never emits `undefined`/`null` as literal substrings.

### 2.3 `generateClaudeMd(input): string`

**Preconditions**
- `input.projectName.trim()` non-empty.

**Postconditions**
- `result.split('\n').length < 200`. Hard cap.
- Starts with `# CLAUDE.md — ${projectName}\n`.
- Contains `## Mission`, `## Operating doctrine`, `## Subagents`, `## Build commands`, `## File ownership`, `## References`, `## Verification` (7 H2 sections).
- `## Subagents` section lists three `@.claude/agents/{name}.md` lines for `recon`, `tester`, `reviewer`.

**Invariants**
- No HTML. No JSX. No code fences that are not closed.

### 2.4 `generateAgentsMd(input): string`

**Preconditions**
- As above.

**Postconditions**
- Starts with `# AGENTS.md — ${projectName}\n`.
- Contains `## Purpose`, `## Spawning subagents`, `## Scope boundaries`, `## Build commands`, `## References`.
- `## Scope boundaries` incorporates `environmentNotes(input.environment)`.

### 2.5 `generateClaudeAgent(name, input): string`

**Preconditions**
- `name ∈ {'reviewer','recon','tester'}` (TypeScript-narrowed).

**Postconditions**
- First line is `---\n`. A second `---\n` line appears before any markdown body.
- YAML block contains `name`, `description`, `tools`, `model` keys.
- Body is a short (≤ 60 line) markdown block.
- Parseable as gray-matter-style frontmatter (we don't ship gray-matter; invariant is structural).

**Invariants**
- YAML values containing `:` or `#` are double-quoted.
- Tools value is a comma-separated list, NOT a YAML array (matches Claude Code convention).

### 2.6 `generateCodexAgent(name): string` and `generateCodexConfig(): string`

**Preconditions**
- `name ∈ {'reviewer','worker'}` (TypeScript-narrowed).

**Postconditions**
- Output is valid TOML: parseable by the Rust `toml` crate (v0.8+). Tests assert by constructing strings that match a known-good regex for TOML tables.
- `generateCodexConfig()` always emits `[agents]\nmax_threads = 6\nmax_depth = 1\n` exactly (constant — no input dependency per seed-brief).
- `generateCodexAgent(name)` emits a single `[agent]` table with `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, `developer_instructions` keys.

**Invariants**
- String values use double quotes; multi-line uses `"""…"""`.
- Output never contains `\r`.

### 2.7 `buildWavePlan(input): WavePlan`

**Preconditions**
- `input.scope`, `input.parallelism`, `input.risk` are valid enum values.

**Postconditions**
- `result.workerCap ∈ [1, 12]` (integer).
- `result.decompositionDepth ∈ {1, 2, 3}`.
- `result.phases.length === 9` and ids are `0..8` in order.
- Phase 4's `workerCount === result.workerCap`. Phases 0,1,5,6,7,8 have `workerCount === 1`. Phases 2,3 have `workerCount === 2` (A + B).

**Invariants**
- Pure. Referentially transparent.

### 2.8 `copyToClipboard(text): Promise<boolean>`

**Preconditions**
- `text` is a string (may be empty — copying empty string is a no-op but must resolve `true` or `false`, never reject).
- Called from a user gesture (click handler) — required by browser for clipboard write permission; outside our contract to enforce.

**Postconditions**
- Resolves `true` iff `navigator.clipboard.writeText(text)` succeeded.
- Resolves `false` iff the fallback textarea path ran and `document.execCommand('copy')` returned true.
- Rejects only if BOTH paths fail (no `navigator.clipboard`, no `document.execCommand`, or we are SSR). The caller surfaces a toast "Clipboard unavailable".

**Invariants**
- If the DOM is available, the fallback path never leaves a textarea attached to the document.

### 2.9 `downloadFile(filename, content, mime?)`

**Preconditions**
- `filename` is a non-empty string safe for the `download` attribute (no path separators; caller's responsibility). We kebab-slugify project names via `toSlug` before composing filenames.
- Invoked from a user gesture.
- `typeof window !== 'undefined'` — otherwise no-op.

**Postconditions**
- A `<a>` element is momentarily attached and clicked, then the object URL is revoked in the same tick.
- Does NOT throw on SSR; returns early.

**Invariants**
- Never leaks an object URL (every `createObjectURL` is paired with a `revokeObjectURL`).

### 2.10 `downloadBundle(bundle, projectSlug): Promise<void>`

**Preconditions**
- `bundle` is a fully populated `GeneratedSeed`.
- `projectSlug` is a non-empty slug (caller passes `toSlug(input.projectName)`).

**Postconditions**
- Builds a ZIP with the 11 files under `specseed-output/` (see §6).
- Triggers a download named `specseed-${projectSlug}.zip`.
- Resolves after `URL.revokeObjectURL` is called.

**Invariants**
- JSZip is statically imported at module top — not dynamically loaded — so the download is always available after initial JS parse.

---

## 3. Data flow end-to-end

### 3.1 Sequence diagram

```
USER                  SeedGenerator.tsx                 lib/                        DOM / Browser
 │                         │                             │                                 │
 │── types in form ───────▶│                             │                                 │
 │                         │── setInput(prev=>...) ──────│                                 │
 │                         │                             │                                 │
 │                         │ useMemo recomputes          │                                 │
 │                         │── compileFullSeed(input) ──▶│                                 │
 │                         │                             │── buildWavePlan ─────┐          │
 │                         │                             │── generateSeed ──────┤          │
 │                         │                             │── generateClaudeMd ──┤          │
 │                         │                             │── generateAgentsMd ──┤          │
 │                         │                             │── generateClaudeAgent×3          │
 │                         │                             │── generateCodexAgent×2           │
 │                         │                             │── generateCodexConfig            │
 │                         │                             │── generateMacosSetup             │
 │                         │                             │── generateUbuntuBootstrap        │
 │                         │◀── GeneratedSeed ───────────│                                 │
 │                         │                             │                                 │
 │                         │ preview tab reads           │                                 │
 │                         │   generatedSeed[tabKey]     │                                 │
 │                         │                             │                                 │
 │                         │── <MarkdownPreview text> ───────────────────────────────────▶│
 │                         │                             │                                 │
 │── clicks "Copy" ───────▶│── copyToClipboard(text) ───▶│── navigator.clipboard.writeText▶│
 │                         │◀── Promise<boolean> ────────│                                 │
 │                         │                             │                                 │
 │── clicks "Download     ▶│── downloadFile(fn,md,mime)─▶│── Blob → URL.createObjectURL ──▶│
 │    SEED.md"             │                             │── anchor.click(); revoke                 │
 │                         │                             │                                 │
 │── clicks "Download     ▶│── downloadBundle(b, slug) ─▶│── JSZip → generateAsync(blob)──▶│
 │    Adapter Pack"        │                             │── URL.createObjectURL → click → revoke   │
 │                         │                             │                                 │
 │── clicks "Reset" ──────▶│── setInput(DEFAULT_SEED_INPUT)                                │
```

### 3.2 Numbered steps

1. Form renders initially with `useState(DEFAULT_SEED_INPUT)`.
2. User types into any `<input>`/`<select>`/`<textarea>` — `onFieldChange(field, value)` fires.
3. `setInput(prev => ({ ...prev, [field]: value }))` — React batches; new reference for `input`.
4. `useMemo(() => compileFullSeed(input), [input])` recomputes because the input reference changed.
5. Returned `GeneratedSeed` is read by the currently-active preview tab (`seedMd`, `claudeMd`, `agentsMd`, etc.).
6. `<MarkdownPreview>` renders the string inside a styled `<pre>` (no markdown parsing — raw text).
7. **Copy**: `copyToClipboard(generatedSeed[activeTabKey])` → success toast "Copied" / failure toast "Clipboard unavailable".
8. **Download SEED.md**: `downloadFile(\`SEED-\${slug}.md\`, generatedSeed.seedMd, 'text/markdown')`.
9. **Download Adapter Pack**: `await downloadBundle(generatedSeed, slug)`; emits `specseed-<slug>.zip`.
10. **Reset to Demo**: `setInput(DEFAULT_SEED_INPUT)` — triggers full recompute; preview animates (100ms 50%-opacity fade per strategy §7).

---

## 4. Copy-to-clipboard helper — exact contract

```ts
/**
 * Copy `text` to the system clipboard.
 * Returns true if the modern Clipboard API was used.
 * Returns false if the textarea+execCommand fallback was used.
 * Rejects only on total failure (no DOM, no API).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Precondition check: text must be a string; TS enforces, but guard anyway.
  if (typeof text !== 'string') throw new TypeError('text must be a string');

  // Path A: modern API. Requires secure context (https: or localhost).
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to fallback
    }
  }

  // Path B: offscreen textarea + execCommand.
  if (typeof document === 'undefined') throw new Error('no DOM — cannot copy');
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('execCommand("copy") returned false');
  return false;
}
```

**Preconditions**: text is a non-null string; invoked in a user gesture.
**Postconditions**: as in §2.8.
**Invariants**: fallback textarea is always removed (both success and failure) before return — use try/finally in the final build if you need to add more logic, but the straight path above is correct for the current contract.

---

## 5. Blob / download helpers

```ts
/** Trigger a browser download. No-op on SSR. */
export function downloadFile(
  filename: string,
  content: string | Blob,
  mime: string = 'application/octet-stream'
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build the adapter-pack ZIP and trigger download. */
export async function downloadBundle(
  bundle: GeneratedSeed,
  projectSlug: string
): Promise<void> {
  const zip = buildZip(bundle);
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(`specseed-${projectSlug}.zip`, blob, 'application/zip');
}
```

---

## 6. JSZip structure

```ts
import JSZip from 'jszip';
import type { GeneratedSeed } from './seedSchema';

/** Assemble the 11-file adapter pack. Pure — no I/O. */
export function buildZip(seed: GeneratedSeed): JSZip {
  const zip = new JSZip();
  const root = zip.folder('specseed-output')!;

  // Root-level markdown
  root.file('SEED.md',   seed.seedMd);
  root.file('CLAUDE.md', seed.claudeMd);
  root.file('AGENTS.md', seed.agentsMd);

  // Claude agents
  const claudeAgents = root.folder('.claude')!.folder('agents')!;
  claudeAgents.file('reviewer.md', seed.claudeAgents.reviewer);
  claudeAgents.file('recon.md',    seed.claudeAgents.recon);
  claudeAgents.file('tester.md',   seed.claudeAgents.tester);

  // Codex
  const codexRoot   = root.folder('.codex')!;
  codexRoot.file('config.toml', seed.codexConfig);
  const codexAgents = codexRoot.folder('agents')!;
  codexAgents.file('reviewer.toml', seed.codexAgents.reviewer);
  codexAgents.file('worker.toml',   seed.codexAgents.worker);

  // OS adapters — always include both per seed-brief note
  root.file('macos-setup.sh',      seed.macosSetup);
  root.file('ubuntu-bootstrap.md', seed.ubuntuBootstrap);

  return zip;
}
```

**Count audit.** `SEED.md, CLAUDE.md, AGENTS.md, reviewer.md, recon.md, tester.md, config.toml, reviewer.toml, worker.toml, macos-setup.sh, ubuntu-bootstrap.md` = **11 files** = matches seed-brief §"Adapter pack".

---

## 7. Form-change event handler contract

```ts
/**
 * Single generic handler for every form control.
 * Updates SeedInput immutably; preserves referential equality on unchanged fields
 * so useMemo downstream is cheap.
 */
function onFieldChange<K extends keyof SeedInput>(
  field: K,
  value: SeedInput[K]
): void {
  setInput(prev => ({ ...prev, [field]: value }));
}
```

**Usage pattern in controls:**
```tsx
<select
  value={input.scope}
  onChange={e => onFieldChange('scope', e.target.value as Scope)}
>…</select>

<input
  value={input.projectName}
  onChange={e => onFieldChange('projectName', e.target.value)}
/>
```

**Contract:**
- `field` is a literal key of `SeedInput`. Type inference tightens `value` automatically.
- `setInput` is the `useState` setter captured in closure — guaranteed stable identity across renders, so `onFieldChange` need NOT be memoized with `useCallback` for correctness (it may be, for downstream `React.memo` children — build-group call).

---

## 8. `compileFullSeed` sequence — confirmed

The pseudocode given in the task prompt is correct. Expanded below with intermediate variables and a one-line justification per step:

```ts
export function compileFullSeed(input: SeedInput): GeneratedSeed {
  const plan = buildWavePlan(input);                                    // deterministic worker math
  const seedMd = generateSeed(input, plan);                             // 11-section master doc
  const claudeMd = generateClaudeMd(input);                             // top-level adapter
  const agentsMd = generateAgentsMd(input);                             // Codex-facing adapter
  const claudeAgents = {                                                // 3 .claude/agents/*.md
    reviewer: generateClaudeAgent('reviewer', input),
    recon:    generateClaudeAgent('recon',    input),
    tester:   generateClaudeAgent('tester',   input),
  } as const;
  const codexAgents = {                                                 // 2 .codex/agents/*.toml
    reviewer: generateCodexAgent('reviewer'),
    worker:   generateCodexAgent('worker'),
  } as const;
  const codexConfig = generateCodexConfig();                            // .codex/config.toml
  const macosSetup = generateMacosSetup(input);                         // macos-setup.sh
  const ubuntuBootstrap = generateUbuntuBootstrap(input);               // ubuntu-bootstrap.md
  return {
    seedMd, claudeMd, agentsMd,
    claudeAgents, codexAgents, codexConfig,
    macosSetup, ubuntuBootstrap,
  };
}
```

**Ordering justification.** The sub-generators have no cross-dependencies except `generateSeed` needing `plan`. Order of the others is purely cosmetic (result is identical). Keep the order above for readability: master → adapters → agents → OS scripts.

---

## 9. Memoization cost

**Estimate for default input**:

| Step | Approx. ms (mid-tier 2024 laptop) |
|------|-----------------------------------|
| `buildWavePlan` | < 0.05 (3 lookups + 1 clamp + an array literal) |
| `generateSeed` | ~1.0 (11 template strings, ~5KB output) |
| `generateClaudeMd` | ~0.3 |
| `generateAgentsMd` | ~0.3 |
| 3 × `generateClaudeAgent` | ~0.6 |
| 2 × `generateCodexAgent` + `generateCodexConfig` | ~0.2 |
| `generateMacosSetup` + `generateUbuntuBootstrap` | ~0.5 |
| **Total** | **~3 ms** |

**Verdict.** Well under a 16 ms frame budget. A `useMemo(() => compileFullSeed(input), [input])` is sufficient because:
- `input` is always a new reference when any field changes (immutable update in `onFieldChange`).
- Between unrelated re-renders (e.g. active tab toggle), `input` is referentially stable, so `useMemo` returns the cached value without calling `compileFullSeed`.
- No need for `useDeferredValue`, `debounce`, or `useTransition` at this budget.

**Rapid-typing scenario.** 3 keystrokes per 100 ms ≈ ~9 ms spent in `compileFullSeed` per 100 ms window. Still comfortable.

---

## 10. Performance budget

**Target**: < 200 KB gzipped first-load JS (strategy §1, strategy §11 implied).

**Breakdown estimate (gzipped, post Next.js 14 App Router code-split, production `next build`):**

| Package | Est. size | Notes |
|---|---|---|
| react + react-dom | ~45 KB | unavoidable baseline |
| next runtime (client) | ~25 KB | App Router client shim |
| framer-motion (tree-shaken: motion, AnimatePresence) | ~35 KB | pinned to needed exports; full pkg is ~50 KB |
| jszip | ~30 KB | included in main chunk (pre-imported) |
| clsx | ~0.5 KB | |
| Our code (components + lib + Tailwind runtime JSX) | ~15 KB | templates are strings, cheap |
| Tailwind CSS (purged) | ~8 KB | separate — not counted in JS budget |
| **Total JS** | **~150 KB** gzipped | |

**Headroom**: ~50 KB. Flag for orchestrator:
- If Phase 4 adds any markdown renderer (react-markdown is ~40 KB) — **breaks budget**. Current plan does NOT — MarkdownPreview is `<pre>` only.
- If Phase 4 adds a highlighter — **breaks budget**. Current plan does NOT.
- `framer-motion` must be imported as `import { motion, AnimatePresence } from 'framer-motion'` NOT `import * as FM from 'framer-motion'` — tree-shaking requires named imports.
- `jszip` can be behind a lazy `import()` if we want to shave ~30 KB off the initial load and only pay on "Download Adapter Pack" click. **Recommendation: lazy-load JSZip** via dynamic `import('jszip')` inside `downloadBundle` — saves 30 KB on initial page load and the button is a user action so a 100–200 ms delay is imperceptible. Revises `downloadBundle` to `async` returning `Promise<void>` (already async).

**Revised `downloadBundle` with lazy JSZip:**
```ts
export async function downloadBundle(bundle: GeneratedSeed, projectSlug: string): Promise<void> {
  const { default: JSZip } = await import('jszip');
  const zip = buildZip(bundle, JSZip);
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(`specseed-${projectSlug}.zip`, blob, 'application/zip');
}
```

If the orchestrator wants the simpler eager-import path, both fit budget; lazy is the defensive choice. **Flagged to orchestrator.**

---

## 11. Error surfaces

| Surface | Cause | Mitigation |
|---|---|---|
| `navigator.clipboard` unavailable | Insecure context (http on non-localhost), old browser | Fallback textarea path in `copyToClipboard`. Surfaces as `false` return or thrown `Error` on total failure. UI shows toast "Clipboard unavailable — copy manually". |
| `Blob` / `URL.createObjectURL` unavailable | SSR (should never run these at build time) | `typeof window !== 'undefined'` guard at start of `downloadFile`. Returns silently. |
| SSR of generator component | `compileFullSeed` runs during static export | Mark `SeedGenerator.tsx` with `'use client'` so it never executes on the build-time static render. The static export only emits shell HTML; the generator hydrates client-side. **Confirmed static-export compatible.** |
| JSZip dynamic import fails (network blip) | User offline after initial page load, lazy import path only | `try/catch` in the click handler; toast "Bundle failed — please retry". If eager import is chosen, not applicable. |
| Bad input (e.g. runtime sets `scope='xyz'`) | Only possible if someone bypasses TypeScript at runtime (we don't expose this path — form `<select>` has fixed `<option>`s) | Ignored. No runtime enum validation in MVP. TS is the contract. |
| Downloaded filename contains path separators | `projectName` has `/` or `\` that slips past `toSlug` | `toSlug` lowercases + replaces non-[a-z0-9] with `-` and collapses/trims hyphens. Post: result matches `/^[a-z0-9][a-z0-9-]*[a-z0-9]$/` or falls back to `"specseed"` if empty after cleanup. |
| Memoization thrashing | React StrictMode double-invokes render | `compileFullSeed` is pure; double-invocation only wastes ~3 ms per keystroke. No correctness impact. |
| `copyToClipboard` called outside user gesture | E.g. on page load (not a planned code path) | Modern API throws; fallback path's `execCommand('copy')` also requires a gesture. Returns rejection. Not a production concern — all call sites are in click handlers. |

---

## 12. Integration tests (mental) — Phase 5 Wire checklist

The orchestrator will manually walk these ten end-to-end paths after Phase 4 merges:

a. **Load page** — form is pre-populated with SpecSeed.io defaults; preview shows the SEED.md for the demo; octopus shows 9 cards with worker count 5 on Phase 4.
b. **Change `scope` to `large`** — PhaseOctopus Phase 4 worker count recomputes to 6 + 0 + 1 = 7. Preview SEED.md Section 7 reflects new `workerCap`.
c. **Change `agentPlatform` to `codex` only** — Claude Code tabs still render in preview (we ALWAYS generate all artifacts for frictionless switching); SEED.md Section 8 may be condensed, but the file is present in the ZIP download.
d. **Change `environment` to `macos` only** — `macos-setup.sh` still generates; `ubuntu-bootstrap.md` still generates (MVP ships both unconditionally per seed-brief). ZIP contains both.
e. **Copy active tab** — click "Copy", paste elsewhere: exact match with preview text.
f. **Download SEED.md** — file lands as `SEED-specseed-io.md`, opens in a text editor, renders identically to preview.
g. **Download Adapter Pack** — ZIP lands as `specseed-specseed-io.zip`. Unzip: 11 files under `specseed-output/` — `SEED.md`, `CLAUDE.md`, `AGENTS.md`, `.claude/agents/{reviewer,recon,tester}.md`, `.codex/config.toml`, `.codex/agents/{reviewer,worker}.toml`, `macos-setup.sh`, `ubuntu-bootstrap.md`.
h. **Reset to Demo** — click "Reset", form returns to defaults; preview reverts; no stale state.
i. **Navigate to `/playground/`** — URL resolves via `trailingSlash: true` → `/playground/index.html`. Only the SeedGenerator renders; no hero/how/octopus/artifacts/footer.
j. **Dark-mode default + crimson focus rings** — tab through form inputs; focus ring is `--crimson`. Hover on `.btn-primary` triggers `translate(-2px,-2px) + shadow-brick`. Octopus phase numbers render in `--crimson` (NOT gold — strategy §14).

---

## 13. Static-export compatibility audit

| Feature | Breaks `next export`? | Our usage | Verdict |
|---|---|---|---|
| Dynamic route segments (`[slug]`) | YES (without `generateStaticParams`) | None — both routes are literal paths | PASS |
| `next/image` with remote sources | YES in export mode | None — `images.unoptimized = true` + only local/inline SVG | PASS |
| Server Components with `headers()` / `cookies()` | YES | Every interactive component is `'use client'` | PASS |
| Server Components with `searchParams` | Partial (static params only) | None used | PASS |
| `fetch()` at build time | Not broken, but requires `generateStaticParams` for dynamic routes | None | PASS |
| Route handlers (`app/api/*/route.ts`) | YES | None | PASS |
| Middleware (`middleware.ts`) | YES | None | PASS |
| `next/font/google` | NO — self-hosts at build time | `Inter`, `IBM_Plex_Mono` | PASS |
| Client-only APIs (`window`, `document`, `navigator`, `Blob`, `URL.createObjectURL`) | Safe iff guarded | All usage in `'use client'` components or guarded with `typeof window !== 'undefined'` | PASS |
| `framer-motion` | NO — client-only, guarded by `'use client'` on parent component | PhaseOctopus + form→preview fade | PASS |
| `jszip` | NO — browser-safe lib | Download handler | PASS |
| Hash anchors (`#generator`, `#octopus`, ...) | NO | Static anchors on `/` | PASS |

**Conclusion.** No function in lib/ or component in components/ breaks `output: 'export'`. All generator functions are pure and synchronous — safe to call in client render. All impure helpers (`copyToClipboard`, `downloadFile`, `downloadBundle`) are invoked only inside event handlers, never during render.

---

## 14. Unknowns / flags for orchestrator

1. **JSZip eager vs lazy import.** Recommended lazy for 30 KB savings on initial load; trivially simpler to be eager. **Orchestrator decides at collapse.** (Both fit the 200 KB budget.)
2. **`clsx` necessity.** With Tailwind's `class:` conventions and fleet's raw class names, `clsx` mostly disambiguates conditional classes. We can drop it and hand-join strings; ~0.5 KB savings. Recommendation: keep (ergonomic, tiny).
3. **`useCallback` on `onFieldChange`.** Only needed if child controls are wrapped in `React.memo`. Phase 4 build group call. Default: skip for simplicity; add if profiler shows child re-render cost.
4. **`toSlug` edge case: empty after cleanup.** Proposal: return `"specseed"`. Confirm at collapse.
5. **`WavePlan.phases[i].workerCount` for phases 2 and 3.** Seed-brief says "Decomposer A, B" and "Architect A, B" (two workers each). Hardcoded to 2. Confirm not overridden by `workerCap` — these phases are NOT cap-driven; only phase 4 (Build) is. My stance: confirmed from seed-brief table — only phase 4 scales with `workerCap`.
6. **Number of top-level `##` headings in SEED.md.** Seed-brief specifies exactly 11. Architect A's interfaces may add/remove; if a discrepancy arises at collapse, **seed-brief wins**.
7. **`generateCodexConfig()` constant vs input-driven.** Seed-brief shows a hardcoded `max_threads = 6, max_depth = 1` block. Worker cap is NOT propagated into `.codex/config.toml` in MVP. Flagged: seems like a natural feature for v2 (emit `max_threads = workerCap`); not in MVP scope.
8. **Worker B did not see parallel files.** If Architect A defines `GeneratedSeed` with different field names (e.g. `seedMarkdown` instead of `seedMd`), the orchestrator must reconcile. My field names follow `seed-brief` conventions + camelCase.
9. **`generateClaudeAgent` tools list per agent.** Not specified in seed-brief. Proposal: `reviewer` = `Read, Grep, Glob`; `recon` = `Read, Grep, Glob, Bash`; `tester` = `Read, Bash, Edit`. Orchestrator may override.
10. **Line-count hard cap on CLAUDE.md.** Seed-brief says "< 200 lines". Emit a Phase 6 test that asserts this as a regression guard.

---

*CC-OPS-SPECSEED — Architect B*
