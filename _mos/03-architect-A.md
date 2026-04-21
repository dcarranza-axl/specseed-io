# 03-architect-A.md — File Tree + TypeScript Interfaces + Config Files

**Authored:** 2026-04-21
**Author:** Architect Worker A (Opus 4.7) under CC-OPS-SPECSEED
**Scope:** Phase 3 Worker A deliverable — complete file tree, all TypeScript interfaces, all configuration files.
**Status:** Decomposer A/B artifacts not yet present at authoring time; design derived from `01-strategy.md` (BINDING) + `seed-brief.md` + `applied-theme.md`. Where Decomposer outputs would have refined names, this doc asserts a contract that Decomposer collapse can reconcile into `03-architecture.md`.

---

## 1. Complete final file tree

All paths relative to `/var/www/specseed-io/`. No `src/` — `app/`, `components/`, `lib/` live at project root (strategy §12 correction, `--no-src-dir`).

```
/var/www/specseed-io/
├── app/
│   ├── layout.tsx                      # Root layout: <html> font vars, <body>, metadata, OG
│   ├── page.tsx                        # "/" — Hero → Generator → Octopus → HowItWorks → Artifacts → Footer
│   ├── globals.css                     # Fleet CSS imports + @tailwind layers + custom utilities
│   ├── playground/
│   │   └── page.tsx                    # "/playground/" — full-screen SeedGenerator only
│   └── styles/
│       ├── palette.css                 # Copied from _theme/palette.css (fleet tokens)
│       └── components/
│           ├── buttons.css             # Fleet .btn-* classes
│           ├── cards.css               # Fleet .card-* classes
│           ├── forms.css               # Fleet .form-* classes
│           └── navigation.css          # Fleet .nav-* classes
├── components/
│   ├── Hero.tsx                        # Headline + dual CTAs + dot-grid bg + code-scroll layer
│   ├── SeedGenerator.tsx               # Form (left) + 7-tab MarkdownPreview (right) + 4 actions
│   ├── MarkdownPreview.tsx             # <pre> scroller with tab strip for 7 artifact views
│   ├── PhaseOctopus.tsx                # Horizontally-scrolling 9 phase cards with fan-out SVG
│   ├── ArtifactTabs.tsx                # 4-tab panel: Claude Code, Codex, macOS, Ubuntu sample
│   ├── HowItWorks.tsx                  # 7-step Intent→Verify flow with inline SVG icons
│   ├── Footer.tsx                      # Name + tagline + GitHub + "Built with Claude Code"
│   └── ui/
│       ├── Button.tsx                  # Wraps fleet .btn classes; variant prop
│       ├── TabStrip.tsx                # Shared tab UI for MarkdownPreview + ArtifactTabs
│       ├── FormField.tsx               # Dispatches FormFieldSpec → input/textarea/select/segmented
│       ├── SegmentedControl.tsx        # Brutalist segmented button group
│       └── TierBadge.tsx               # Haiku/Sonnet/Opus pill using TIER_BADGE_CLASS
├── lib/
│   ├── seedSchema.ts                   # SeedInput, literal unions, WavePlan, PhaseSpec, GeneratedSeed, DEFAULT_SEED_INPUT
│   ├── constants.ts                    # Select option arrays, PHASE_TEMPLATE, TIER_BADGE_CLASS
│   ├── formFields.ts                   # FormFieldSpec type + FORM_FIELDS literal (12 items)
│   ├── wavePlan.ts                     # workerCap, decompositionDepth, shouldUseAgentTeams, buildWavePlan
│   ├── generateSeed.ts                 # generateSeedMd(input) — the 11-section SEED.md
│   ├── generateClaudeMd.ts             # generateClaudeMd(input) — Claude adapter
│   ├── generateAgentsMd.ts             # generateAgentsMd(input) — Codex adapter
│   ├── generateClaudeAgents.ts         # generateReconMd/generateTesterMd/generateReviewerMd
│   ├── generateCodexConfig.ts          # generateCodexConfigToml + generateCodexReviewerToml + generateCodexWorkerToml
│   ├── generateOsAdapters.ts           # generateMacosSetupSh + generateUbuntuBootstrapMd
│   ├── compileFullSeed.ts              # compileFullSeed(input): GeneratedSeed — calls all above
│   ├── buildAdapterZip.ts              # buildAdapterZip(seed: GeneratedSeed): Promise<Blob> using jszip
│   ├── downloadFile.ts                 # downloadBlob(blob, filename) + downloadText(text, filename)
│   ├── clipboard.ts                    # copyToClipboard(text): Promise<boolean>
│   ├── slugify.ts                      # slugify(name): string for SEED-{slug}.md filenames
│   └── cx.ts                           # Re-export of clsx for terse class composition
├── public/
│   ├── robots.txt                      # User-agent:* Allow:/ + sitemap hint
│   ├── sitemap.xml                     # / and /playground/
│   └── og-image.png                    # 1200×630 static placeholder (Phase 8)
├── docs/
│   ├── specseed-product.md             # Product doc (Phase 8)
│   └── phase-octopus.md                # 9-phase schedule reference (Phase 8)
├── .claude/
│   ├── settings.json                   # Per-repo allow/deny (Phase 4 Group D)
│   └── agents/
│       ├── recon.md                    # Recon subagent (Phase 4 Group D)
│       ├── tester.md                   # Tester subagent
│       └── reviewer.md                 # Reviewer subagent
├── .codex/
│   ├── config.toml                     # [agents] max_threads=6 max_depth=1
│   └── agents/
│       ├── reviewer.toml               # Codex reviewer profile
│       └── worker.toml                 # Codex worker profile
├── _mos/                               # Build artifacts (00-recon.md … 08-integration.md) — COMMITTED
├── _theme/                             # Fleet palette + components (staged) — COMMITTED
├── CLAUDE.md                           # This repo's Claude Code doctrine
├── AGENTS.md                           # This repo's Codex doctrine
├── README.md                           # Public-facing project README
├── next.config.ts                      # output:'export', trailingSlash, distDir, images.unoptimized
├── tailwind.config.ts                  # extend colors/fontFamily/boxShadow
├── postcss.config.mjs                  # tailwindcss + autoprefixer (Next 14/15 default form)
├── tsconfig.json                       # strict + noUncheckedIndexedAccess + @/* alias
├── eslint.config.mjs                   # next/core-web-vitals + next/typescript (Next 15 flat)
├── .gitignore                          # node_modules, .next, out, .env*.local, logs, DS_Store
├── package.json                        # deps: next/react/ts/tailwind + framer-motion, clsx, jszip
├── package-lock.json                   # npm lockfile (generated)
└── deploy.sh                           # npm run build && systemctl reload nginx
```

**Note on ESLint file:** Next.js 14 ships `.eslintrc.json`; Next.js 15 ships `eslint.config.mjs` (flat config). `create-next-app@latest` in April 2026 will most likely produce the flat config. We adopt `eslint.config.mjs` as the filename — if init writes `.eslintrc.json`, Phase 4 wire will convert.

**Note on PostCSS file:** `postcss.config.mjs` is the Next 14+ default. If init writes `postcss.config.js`, accept it.

**gitignore status:** `_mos/` and `_theme/` are BOTH committed (they are build artifact documentation and the canonical theme source, respectively).

---

## 2. `lib/seedSchema.ts` — TypeScript master file

```ts
// lib/seedSchema.ts
// Canonical type definitions for the SpecSeed generator.
// Pure types + constants; no runtime behavior beyond DEFAULT_SEED_INPUT.

/* ─────────────────────────────────────────────────────────────
 * Literal unions — the 6 select/segmented field domains
 * ──────────────────────────────────────────────────────────── */

export type ProjectType =
  | 'landing-page'
  | 'saas-app'
  | 'docs-site'
  | 'dashboard'
  | 'api'
  | 'full-stack-app'

export type AgentPlatform = 'claude-code' | 'codex' | 'both'

export type Environment = 'macos' | 'ubuntu' | 'both'

export type Scope = 'tiny' | 'small' | 'medium' | 'large' | 'platform'

export type Risk = 'low' | 'medium' | 'high'

export type Parallelism = 'conservative' | 'balanced' | 'aggressive'

export type OutputStyle = 'concise' | 'detailed' | 'exhaustive'

export type DeploymentTarget =
  | 'static'
  | 'vercel'
  | 'docker'
  | 'ubuntu-vps'
  | 'custom'

/* ─────────────────────────────────────────────────────────────
 * SeedInput — the form state (single source of truth)
 * Keys are ordered to match render order in the form.
 * ──────────────────────────────────────────────────────────── */

export interface SeedInput {
  /** Human-readable project name. Used in headings + SEED-{slug}.md filename. */
  projectName: string
  /** One-paragraph mission statement. Rendered verbatim into SEED §1. */
  objective: string
  projectType: ProjectType
  /** Which coding-agent platforms the adapter pack will target. */
  agentPlatform: AgentPlatform
  /** Which developer-OS setup scripts to emit. */
  environment: Environment
  scope: Scope
  risk: Risk
  parallelism: Parallelism
  /** Verbosity of the generated SEED.md — affects SECTION text density only, not structure. */
  outputStyle: OutputStyle
  deploymentTarget: DeploymentTarget
  /** Free-text list of project constraints. One bullet per line when rendered. */
  constraints: string
  /** Free-text stack/repo notes. Rendered under §3 Target Runtime. */
  repoNotes: string
}

/* ─────────────────────────────────────────────────────────────
 * Wave algorithm types
 * ──────────────────────────────────────────────────────────── */

export type ModelTier = 'haiku' | 'sonnet' | 'opus'

export type PhaseName =
  | 'Recon'
  | 'Strategy'
  | 'Decompose'
  | 'Architecture'
  | 'Build'
  | 'Wire'
  | 'Test'
  | 'Review'
  | 'Integration'

export interface PhaseSpec {
  /** 0..8 — stable numeric id matching MOS table. */
  readonly index: number
  readonly name: PhaseName
  readonly model: ModelTier
  /** 'default' | 'high' — maps to Claude Code /effort or Codex model_reasoning_effort. */
  readonly effort: 'default' | 'high'
  /** Human-readable duration estimate (e.g. "30s", "2m"). Display only. */
  readonly duration: string
  /** Human-readable fan-out description ("Decomposer A, B", "Builder × workerCap"). */
  readonly fanOut: string
  /** Canonical artifact filename emitted by this phase. */
  readonly artifact: string
  /**
   * Concrete worker count for THIS phase for THIS input.
   * Filled in per-request by buildWavePlan(). Zero/one for fixed phases; = workerCap for Build.
   */
  readonly workerCount: number
}

export interface WavePlan {
  /** 1..12 clamp result of scopeBase + parallelismBoost + riskBoost. Build phase uses this. */
  readonly workerCap: number
  /** 1..3 — rough heuristic for how deep the Decompose phase subdivides tasks. */
  readonly decompositionDepth: 1 | 2 | 3
  /** Whether Phase 4 Build phase uses tiered agent teams (Reviewer+Worker pairs) vs. flat workers. */
  readonly useAgentTeams: boolean
  /** All 9 phases, index 0..8, workerCount resolved against workerCap. */
  readonly phases: readonly PhaseSpec[]
}

/* ─────────────────────────────────────────────────────────────
 * Agent role registry — what gets spawned under the hood
 * Discriminated by `kind` so the UI + generators can render
 * per-role blurbs without a giant switch.
 * ──────────────────────────────────────────────────────────── */

export type AgentRoleKind =
  | 'recon'
  | 'strategist'
  | 'decomposer'
  | 'architect'
  | 'builder'
  | 'wirer'
  | 'tester'
  | 'reviewer'
  | 'integrator'

export interface AgentRole {
  readonly kind: AgentRoleKind
  readonly label: string
  readonly tier: ModelTier
  /** Short one-line description used in SEED §6 and Claude agent frontmatter. */
  readonly blurb: string
  /** Which phase(s) this role is active in. Index into PhaseSpec.index. */
  readonly activeInPhases: readonly number[]
}

/* ─────────────────────────────────────────────────────────────
 * GeneratedSeed — the bundle returned by compileFullSeed()
 * All fields are string payloads ready to download / copy / zip.
 * ──────────────────────────────────────────────────────────── */

export interface GeneratedSeed {
  /** Slug derived from input.projectName (used for SEED-{slug}.md filename). */
  readonly slug: string
  /** Wave plan resolved for this input. */
  readonly plan: WavePlan
  /** §1–§11 compiled master document. */
  readonly seedMd: string
  /** Claude Code repo-root CLAUDE.md. */
  readonly claudeMd: string
  /** Codex repo-root AGENTS.md. */
  readonly agentsMd: string
  readonly claudeAgents: {
    readonly reconMd: string
    readonly testerMd: string
    readonly reviewerMd: string
  }
  readonly codex: {
    readonly configToml: string
    readonly reviewerToml: string
    readonly workerToml: string
  }
  readonly os: {
    /** Emitted regardless of environment — adapter pack ships both for safety. */
    readonly macosSetupSh: string
    readonly ubuntuBootstrapMd: string
  }
}

/* ─────────────────────────────────────────────────────────────
 * DEFAULT_SEED_INPUT — demo values preloaded on page mount
 * Exact match to seed-brief.md §"Default demo input".
 * ──────────────────────────────────────────────────────────── */

export const DEFAULT_SEED_INPUT: SeedInput = {
  projectName: 'SpecSeed.io',
  objective:
    'Generate the master seed that turns one project objective into parallel agent execution.',
  projectType: 'saas-app',
  agentPlatform: 'both',
  environment: 'both',
  scope: 'medium',
  risk: 'medium',
  parallelism: 'balanced',
  outputStyle: 'detailed',
  deploymentTarget: 'vercel',
  constraints:
    'No paid LLM API calls in MVP. Pure TypeScript template generation. Deterministic output.',
  repoNotes:
    'Next.js 14 App Router, TypeScript strict, Tailwind CSS, Framer Motion.',
} as const

/* ─────────────────────────────────────────────────────────────
 * Readonly tuple constants — used by constants.ts select arrays
 * Exported here so exhaustive-check helpers can import them.
 * ──────────────────────────────────────────────────────────── */

export const PROJECT_TYPES = [
  'landing-page',
  'saas-app',
  'docs-site',
  'dashboard',
  'api',
  'full-stack-app',
] as const satisfies readonly ProjectType[]

export const AGENT_PLATFORMS = [
  'claude-code',
  'codex',
  'both',
] as const satisfies readonly AgentPlatform[]

export const ENVIRONMENTS = [
  'macos',
  'ubuntu',
  'both',
] as const satisfies readonly Environment[]

export const SCOPES = [
  'tiny',
  'small',
  'medium',
  'large',
  'platform',
] as const satisfies readonly Scope[]

export const RISKS = ['low', 'medium', 'high'] as const satisfies readonly Risk[]

export const PARALLELISMS = [
  'conservative',
  'balanced',
  'aggressive',
] as const satisfies readonly Parallelism[]

export const OUTPUT_STYLES = [
  'concise',
  'detailed',
  'exhaustive',
] as const satisfies readonly OutputStyle[]

export const DEPLOYMENT_TARGETS = [
  'static',
  'vercel',
  'docker',
  'ubuntu-vps',
  'custom',
] as const satisfies readonly DeploymentTarget[]
```

---

## 3. `lib/constants.ts` — option arrays, phase template, tier badges

```ts
// lib/constants.ts
import type {
  ProjectType,
  AgentPlatform,
  Environment,
  Scope,
  Risk,
  Parallelism,
  OutputStyle,
  DeploymentTarget,
  PhaseSpec,
  ModelTier,
  AgentRole,
} from './seedSchema'

/* ─────────────────────────────────────────────────────────────
 * Select / segmented option arrays
 * `value` is the literal union member; `label` is what users see.
 * ──────────────────────────────────────────────────────────── */

export const PROJECT_TYPE_OPTIONS: readonly { value: ProjectType; label: string }[] = [
  { value: 'landing-page',   label: 'Landing page' },
  { value: 'saas-app',       label: 'SaaS app' },
  { value: 'docs-site',      label: 'Docs site' },
  { value: 'dashboard',      label: 'Dashboard' },
  { value: 'api',            label: 'API' },
  { value: 'full-stack-app', label: 'Full-stack app' },
] as const

export const AGENT_PLATFORM_OPTIONS: readonly { value: AgentPlatform; label: string }[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'codex',       label: 'Codex' },
  { value: 'both',        label: 'Both' },
] as const

export const ENVIRONMENT_OPTIONS: readonly { value: Environment; label: string }[] = [
  { value: 'macos',  label: 'macOS' },
  { value: 'ubuntu', label: 'Ubuntu' },
  { value: 'both',   label: 'Both' },
] as const

export const SCOPE_OPTIONS: readonly { value: Scope; label: string }[] = [
  { value: 'tiny',     label: 'Tiny' },
  { value: 'small',    label: 'Small' },
  { value: 'medium',   label: 'Medium' },
  { value: 'large',    label: 'Large' },
  { value: 'platform', label: 'Platform' },
] as const

export const RISK_OPTIONS: readonly { value: Risk; label: string }[] = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
] as const

export const PARALLELISM_OPTIONS: readonly { value: Parallelism; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced',     label: 'Balanced' },
  { value: 'aggressive',   label: 'Aggressive' },
] as const

export const OUTPUT_STYLE_OPTIONS: readonly { value: OutputStyle; label: string }[] = [
  { value: 'concise',    label: 'Concise' },
  { value: 'detailed',   label: 'Detailed' },
  { value: 'exhaustive', label: 'Exhaustive' },
] as const

export const DEPLOYMENT_TARGET_OPTIONS: readonly { value: DeploymentTarget; label: string }[] = [
  { value: 'static',     label: 'Static' },
  { value: 'vercel',     label: 'Vercel' },
  { value: 'docker',     label: 'Docker' },
  { value: 'ubuntu-vps', label: 'Ubuntu VPS' },
  { value: 'custom',     label: 'Custom' },
] as const

/* ─────────────────────────────────────────────────────────────
 * PHASE_TEMPLATE — the 9-phase schedule.
 * workerCount is a placeholder (0); buildWavePlan() replaces
 * index 4 (Build) with the computed workerCap and leaves the
 * rest at 1 or their spawn count.
 * ──────────────────────────────────────────────────────────── */

export const PHASE_TEMPLATE: readonly PhaseSpec[] = [
  { index: 0, name: 'Recon',        model: 'haiku',  effort: 'default', duration: '30s', fanOut: 'Inventory ×1',          artifact: '00-recon.md',         workerCount: 1 },
  { index: 1, name: 'Strategy',     model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Strategy ×1',            artifact: '01-strategy.md',      workerCount: 1 },
  { index: 2, name: 'Decompose',    model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Decomposer A, B',        artifact: '02-decomposition.md', workerCount: 2 },
  { index: 3, name: 'Architecture', model: 'opus',   effort: 'high',    duration: '3m',  fanOut: 'Architect A, B',         artifact: '03-architecture.md',  workerCount: 2 },
  { index: 4, name: 'Build',        model: 'sonnet', effort: 'default', duration: '5m',  fanOut: 'Builder × workerCap',    artifact: 'implementation diffs', workerCount: 0 /* replaced at runtime */ },
  { index: 5, name: 'Wire',         model: 'sonnet', effort: 'default', duration: '3m',  fanOut: 'Wiring ×1',              artifact: '05-wire.md',          workerCount: 1 },
  { index: 6, name: 'Test',         model: 'sonnet', effort: 'default', duration: '3m',  fanOut: 'Test ×1',                artifact: '06-verification.md',  workerCount: 1 },
  { index: 7, name: 'Review',       model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Reviewer ×1',            artifact: '07-review.md',        workerCount: 1 },
  { index: 8, name: 'Integration',  model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Integration ×1',         artifact: '08-integration.md',   workerCount: 1 },
] as const

/* ─────────────────────────────────────────────────────────────
 * TIER_BADGE_CLASS — how each model tier renders as a badge/pill.
 * Fleet brutalist discipline: monochrome, differentiated by fill.
 *   Haiku  → .btn-ghost     (outline, faint)
 *   Sonnet → .btn-secondary (concrete outline)
 *   Opus   → .btn-primary   (crimson fill)
 * Sized with .btn-sm at call sites.
 * ──────────────────────────────────────────────────────────── */

export const TIER_BADGE_CLASS: Record<ModelTier, string> = {
  haiku:  'btn btn-ghost btn-sm',
  sonnet: 'btn btn-secondary btn-sm',
  opus:   'btn btn-primary btn-sm',
} as const

/* ─────────────────────────────────────────────────────────────
 * AGENT_ROLES — used by SEED §6 generator and Claude agent MD.
 * ──────────────────────────────────────────────────────────── */

export const AGENT_ROLES: readonly AgentRole[] = [
  { kind: 'recon',       label: 'Recon',       tier: 'haiku',  blurb: 'Inventory the box and toolchain. Read-only.',            activeInPhases: [0] },
  { kind: 'strategist',  label: 'Strategist',  tier: 'opus',   blurb: 'Lock stack, output mode, and dep list.',                 activeInPhases: [1] },
  { kind: 'decomposer',  label: 'Decomposer',  tier: 'opus',   blurb: 'Fan tasks out; produce dep graph + build groups.',       activeInPhases: [2] },
  { kind: 'architect',   label: 'Architect',   tier: 'opus',   blurb: 'Final file tree + interfaces + config contracts.',       activeInPhases: [3] },
  { kind: 'builder',     label: 'Builder',     tier: 'sonnet', blurb: 'Implement one scoped task. No adjacent refactors.',      activeInPhases: [4] },
  { kind: 'wirer',       label: 'Wirer',       tier: 'sonnet', blurb: 'Connect components, routes, and public assets.',         activeInPhases: [5] },
  { kind: 'tester',      label: 'Tester',      tier: 'sonnet', blurb: 'Run lint + build + DoD checklist.',                      activeInPhases: [6] },
  { kind: 'reviewer',    label: 'Reviewer',    tier: 'opus',   blurb: 'Read-only pass. No edits. Flag risk and regressions.',   activeInPhases: [7] },
  { kind: 'integrator',  label: 'Integrator',  tier: 'opus',   blurb: 'Deploy, smoke-test, close out _mos/.',                   activeInPhases: [8] },
] as const

/* ─────────────────────────────────────────────────────────────
 * Wave algorithm lookup tables — imported by lib/wavePlan.ts
 * Exposed here so tests and UI can reference the same source.
 * ──────────────────────────────────────────────────────────── */

export const SCOPE_BASE: Record<Scope, number> = {
  tiny: 1, small: 2, medium: 4, large: 6, platform: 8,
} as const

export const PARALLELISM_BOOST: Record<Parallelism, number> = {
  conservative: -1, balanced: 0, aggressive: 2,
} as const

export const RISK_BOOST: Record<Risk, number> = {
  low: 0, medium: 1, high: 2,
} as const

export const WORKER_CAP_MIN = 1
export const WORKER_CAP_MAX = 12
```

---

## 4. `lib/formFields.ts` — declarative form driver

```ts
// lib/formFields.ts
import type { SeedInput } from './seedSchema'
import {
  PROJECT_TYPE_OPTIONS,
  AGENT_PLATFORM_OPTIONS,
  ENVIRONMENT_OPTIONS,
  SCOPE_OPTIONS,
  RISK_OPTIONS,
  PARALLELISM_OPTIONS,
  OUTPUT_STYLE_OPTIONS,
  DEPLOYMENT_TARGET_OPTIONS,
} from './constants'

export type FormFieldSpec =
  | { id: keyof SeedInput; kind: 'text';      label: string; placeholder?: string }
  | { id: keyof SeedInput; kind: 'textarea';  label: string; rows: number; placeholder?: string }
  | { id: keyof SeedInput; kind: 'select';    label: string; options: readonly { value: string; label: string }[] }
  | { id: keyof SeedInput; kind: 'segmented'; label: string; options: readonly { value: string; label: string }[] }

export const FORM_FIELDS: readonly FormFieldSpec[] = [
  { id: 'projectName',      kind: 'text',      label: 'Project name',     placeholder: 'SpecSeed.io' },
  { id: 'objective',        kind: 'textarea',  label: 'Objective',        rows: 3,  placeholder: 'One paragraph mission statement' },
  { id: 'projectType',      kind: 'select',    label: 'Project type',     options: PROJECT_TYPE_OPTIONS },
  { id: 'agentPlatform',    kind: 'segmented', label: 'Agent platform',   options: AGENT_PLATFORM_OPTIONS },
  { id: 'environment',      kind: 'segmented', label: 'Environment',      options: ENVIRONMENT_OPTIONS },
  { id: 'scope',            kind: 'segmented', label: 'Scope',            options: SCOPE_OPTIONS },
  { id: 'risk',             kind: 'segmented', label: 'Risk',             options: RISK_OPTIONS },
  { id: 'parallelism',      kind: 'segmented', label: 'Parallelism',      options: PARALLELISM_OPTIONS },
  { id: 'outputStyle',      kind: 'segmented', label: 'Output style',     options: OUTPUT_STYLE_OPTIONS },
  { id: 'deploymentTarget', kind: 'select',    label: 'Deployment target', options: DEPLOYMENT_TARGET_OPTIONS },
  { id: 'constraints',      kind: 'textarea',  label: 'Constraints',      rows: 3,  placeholder: 'One bullet per line' },
  { id: 'repoNotes',        kind: 'textarea',  label: 'Repo / stack notes', rows: 3, placeholder: 'Next.js 14, TypeScript strict, Tailwind…' },
] as const
```

Exactly 12 items, keys ordered to match the form layout and `SeedInput` structure.

---

## 5. `next.config.ts` — production-ready

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export: nginx serves ./out/ directly. No server runtime.
  output: 'export',

  // /playground/ resolves to /playground/index.html — required for nginx static serving.
  trailingSlash: true,

  // nginx root is ./out/ (not the default .next/).
  distDir: 'out',

  // Image Optimization API is unavailable in export mode.
  images: {
    unoptimized: true,
  },

  // Fail the build on type errors — strict TS is the contract.
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint runs during build. Do not silently skip.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Belt-and-braces: disables the x-powered-by header in any dev/preview server.
  poweredByHeader: false,

  // Deterministic build IDs so `npm run build` is reproducible across deploys.
  generateBuildId: async () => 'specseed',
}

export default nextConfig
```

---

## 6. `tailwind.config.ts` — concrete + crimson

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        concrete: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#c4c4c4',
          300: '#8a8a8a',
          400: '#707070',
          500: '#525252',
          700: '#3a3a3a',
          800: '#1f1f1f',
          900: '#0a0a0a',
        },
        crimson: {
          DEFAULT: '#dc143c',
          dark:    '#a00f2f',
          glow:    '#dc143c33',
        },
      },
      fontFamily: {
        // --font-body is injected by next/font/google Inter.
        sans: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
        // --font-mono is injected by next/font/google IBM_Plex_Mono.
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Brutalist offset shadow — hard 4px drop, no blur, concrete-900.
        brick: '4px 4px 0 #0a0a0a',
        // Inverse hover state (used on some card-brick interactions).
        'brick-hover': '6px 6px 0 #0a0a0a',
      },
      borderRadius: {
        // Project default is 0; sharp is the one exception.
        none:  '0',
        sharp: '2px',
      },
      letterSpacing: {
        // Display text uses --tracking -0.02em per fleet tokens.
        display: '-0.02em',
      },
      keyframes: {
        'code-scroll': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        'code-scroll': 'code-scroll 40s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 7. `tsconfig.json` — strict + path alias

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules", "out", ".next"]
}
```

---

## 8. `eslint.config.mjs` — flat config, Next 15 style

```mjs
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['out/**', '.next/**', 'node_modules/**'],
  },
]

export default eslintConfig
```

No custom rules. `next/typescript` already includes the strict-type rule set; anything beyond that risks blocking the build on stylistic issues.

**Fallback:** if `create-next-app` on the target Node 20.20 emits `.eslintrc.json`, use:
```json
{ "extends": ["next/core-web-vitals", "next/typescript"] }
```

---

## 9. PostCSS + `app/globals.css`

### `postcss.config.mjs`

```mjs
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

### `app/globals.css` — import order

```css
/* app/globals.css */

/* 1. Tailwind base resets — MUST come before fleet CSS so our brutalist
      component rules (e.g. .btn border/shadow) override Tailwind's preflight
      defaults rather than the other way around. */
@tailwind base;

/* 2. Fleet palette (CSS custom properties). Tokens only — no rule bodies. */
@import './styles/palette.css';

/* 3. Fleet component classes. These reference the palette variables. */
@import './styles/components/buttons.css';
@import './styles/components/cards.css';
@import './styles/components/forms.css';
@import './styles/components/navigation.css';

/* 4. Tailwind component + utility layers LAST so `bg-concrete-800 !important`
      and the like can override fleet rules when a page needs a one-off. */
@tailwind components;
@tailwind utilities;

/* 5. Project-specific utilities not worth adding to Tailwind config. */

/* Dot-grid hero background */
.bg-dot-grid {
  background-image:
    radial-gradient(circle, var(--concrete-700) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Hard brutalist focus ring override (safety net for browser defaults). */
.focus-brick:focus-visible {
  outline: 2px solid var(--crimson);
  outline-offset: 2px;
}

/* Horizontal scroll container for PhaseOctopus — scroll-snap + hide scrollbar tail. */
.octopus-scroll {
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}
.octopus-scroll::-webkit-scrollbar {
  height: 6px;
}
.octopus-scroll::-webkit-scrollbar-thumb {
  background: var(--concrete-500);
}

/* Preview pane fade-in (100ms) — Framer owns the transition but this is the
   baseline for no-JS / reduced-motion users. */
@media (prefers-reduced-motion: reduce) {
  .motion-safe\:animate-code-scroll { animation: none !important; }
}
```

### Why `@tailwind base` first, fleet next, `@tailwind utilities` last

**Decision:** `@tailwind base` → fleet → `@tailwind components/utilities`.

**Justification:**
- Tailwind `base` is preflight — a global CSS reset (`box-sizing`, `margin: 0`, etc.). It must come FIRST so the fleet classes can override the reset. If fleet came first, Tailwind's reset would nuke fleet's borders and margins.
- Fleet components come NEXT, styling `.btn`, `.card`, `.form-*` etc. on top of Tailwind's reset.
- Tailwind `components` and `utilities` come LAST so single-class utilities like `bg-crimson` or `mt-4` applied in JSX override fleet's rule-based styling when needed. Utilities are the escape hatch; they must win.
- No `!important` required anywhere. Specificity is identical (single class), so source order decides.

---

## 10. `package.json` — final dependency list

```json
{
  "name": "specseed-io",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "jszip": "^3.10.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

**Notes:**
- `jszip` ships its own TypeScript definitions since v3.5, so `@types/jszip` is NOT needed.
- `clsx` ships its own types.
- `framer-motion` ships its own types.
- If `create-next-app@latest` emits Next 15, the major bumps to `"next": "^15.0.0"` and `"eslint-config-next": "^15.0.0"`. All other pins remain compatible.
- `@eslint/eslintrc` is a transitive of `eslint-config-next` under flat config; no explicit install.

---

## 11. Component prop interfaces

```ts
// Prop contracts for the major components. Defined inline per component
// but collected here for the Phase 4 build reference.

import type { SeedInput, WavePlan, GeneratedSeed, ModelTier } from '@/lib/seedSchema'

export type HeroProps = Record<string, never>
// Hero is static. Takes no props. Uses constants only.

export interface SeedGeneratorProps {
  /** Seed the form with something other than DEFAULT_SEED_INPUT (e.g. for /playground/ deep-link later). */
  initialInput?: SeedInput
  /** When true, renders without its own chrome/section wrapper — used inside /playground/. */
  fullBleed?: boolean
}

export interface MarkdownPreviewProps {
  /** The compiled seed bundle; the preview tabs read from this. */
  seed: GeneratedSeed
  /** Controlled active tab index. Parent holds state so "switching to tab X after copy" works. */
  activeTab: number
  onTabChange: (index: number) => void
}

export interface PhaseOctopusProps {
  /** If absent, Octopus renders with DEFAULT_SEED_INPUT's resolved plan. */
  plan?: WavePlan
}

export interface ArtifactTabsProps {
  /** Drives the precomputed sample outputs shown in the 4 sample tabs. */
  input?: SeedInput
}

export type HowItWorksProps = Record<string, never>
// HowItWorks is static — 7-step flow hardcoded.

export type FooterProps = Record<string, never>
// Footer is static.

/* ── UI primitives ──────────────────────────────────────────── */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export interface TabStripProps {
  tabs: readonly { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
}

export interface FormFieldProps {
  spec: import('@/lib/formFields').FormFieldSpec
  value: string
  onChange: (next: string) => void
}

export interface SegmentedControlProps {
  name: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (next: string) => void
}

export interface TierBadgeProps {
  tier: ModelTier
}
```

**Conventions:**
- Static section components use `Record<string, never>` (TypeScript-idiomatic "no props"), not `{}` — `{}` is too permissive under strict mode.
- `SeedGeneratorProps.initialInput` is optional; the component falls back to `DEFAULT_SEED_INPUT` when not provided.
- `MarkdownPreview` is controlled (`activeTab` + `onTabChange`), not stateful — lets the parent reset the tab on e.g. "Download SEED.md" click.

---

## 12. Build-order constraints for Phase 4

Reiterated from strategy §15 with concrete file-level ordering. Four build groups; A and D can fan out in parallel, B depends on A, C depends on B.

### Group A — Foundation (blocks everything else)

Must ship first. Pure leaf-node files; no component imports.

1. `lib/seedSchema.ts`
2. `lib/constants.ts`
3. `lib/formFields.ts`
4. `lib/wavePlan.ts`
5. `lib/slugify.ts`, `lib/clipboard.ts`, `lib/downloadFile.ts`, `lib/cx.ts` (all trivial, parallel-safe)
6. `lib/generateSeed.ts`, `lib/generateClaudeMd.ts`, `lib/generateAgentsMd.ts`, `lib/generateClaudeAgents.ts`, `lib/generateCodexConfig.ts`, `lib/generateOsAdapters.ts` (depend on schema + constants only; can run in parallel)
7. `lib/compileFullSeed.ts` (depends on all generators above)
8. `lib/buildAdapterZip.ts` (depends on `compileFullSeed` output shape)
9. Config files: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json` (all independent)
10. `app/styles/palette.css` + `app/styles/components/*.css` (copies from `_theme/`)
11. `app/globals.css`

### Group B — UI primitives + section components (depends on A)

Primitives first, then sections that use them.

1. Primitives (parallel): `components/ui/Button.tsx`, `components/ui/TabStrip.tsx`, `components/ui/FormField.tsx`, `components/ui/SegmentedControl.tsx`, `components/ui/TierBadge.tsx`
2. Sections (parallel once primitives exist):
   - `components/Hero.tsx`
   - `components/MarkdownPreview.tsx`
   - `components/SeedGenerator.tsx` (imports MarkdownPreview + FormField + primitives)
   - `components/PhaseOctopus.tsx` (imports TierBadge)
   - `components/ArtifactTabs.tsx` (imports TabStrip)
   - `components/HowItWorks.tsx`
   - `components/Footer.tsx`

`SeedGenerator` depends on `MarkdownPreview` + `FormField`; those must land before it in the dependency order within Group B.

### Group C — Page composition (depends on B)

Last to ship. Pure glue.

1. `app/layout.tsx` (imports `next/font/google` fonts, globals.css)
2. `app/page.tsx` (imports all six section components)
3. `app/playground/page.tsx` (imports SeedGenerator only, with `fullBleed`)

### Group D — Agent / adapter files (independent; parallel with A/B/C)

No TypeScript, no imports into the Next build graph. Pure repo-root artifacts.

1. `CLAUDE.md`, `AGENTS.md`
2. `.claude/settings.json`, `.claude/agents/{recon,tester,reviewer}.md`
3. `.codex/config.toml`, `.codex/agents/{reviewer,worker}.toml`
4. `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png` (placeholder OK)
5. `deploy.sh`, `.gitignore`, `README.md`

Docs (`docs/specseed-product.md`, `docs/phase-octopus.md`) are deferred to Phase 8 per seed-brief.

### Critical gate between groups

After Group A + B: `npm run lint` must pass (no unresolved imports). After Group C: `npm run build` must succeed and emit `out/`. Group D does not affect the build at all — it can ship before, during, or after.

---

## 13. `.gitignore`

```gitignore
# ──────────────────────────────────────────────────────────────
# Node / Next.js
# ──────────────────────────────────────────────────────────────
node_modules/
/.next/
/out/
/build/
next-env.d.ts

# ──────────────────────────────────────────────────────────────
# Environment / secrets
# ──────────────────────────────────────────────────────────────
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# ──────────────────────────────────────────────────────────────
# Logs + debug
# ──────────────────────────────────────────────────────────────
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# ──────────────────────────────────────────────────────────────
# OS / editor
# ──────────────────────────────────────────────────────────────
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo

# ──────────────────────────────────────────────────────────────
# TypeScript incremental
# ──────────────────────────────────────────────────────────────
*.tsbuildinfo

# ──────────────────────────────────────────────────────────────
# Project-specific
# ──────────────────────────────────────────────────────────────
# COMMITTED on purpose (do NOT ignore):
#   _mos/       — build-artifact documentation; the audit trail
#   _theme/     — fleet palette + components (canonical source)
#   docs/       — public product docs (Phase 8)
#
# Anything matching this pattern would be a raw-fetch artifact — none
# exist today, but guard future theme-ref.json drops:
_theme/*.raw
_theme/theme-ref.json
```

`next-env.d.ts` is in gitignore because Next regenerates it on every build (this is the official Next.js recommendation; the file is in `tsconfig.include` but never versioned).

---

## Summary of decisions this doc locks in

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | `src/`-less tree with `@/*` alias | Strategy §12 correction |
| 2 | `eslint.config.mjs` flat config | Next 15+ default; falls back to `.eslintrc.json` if init writes that |
| 3 | `postcss.config.mjs` | Next 14+ default filename |
| 4 | `next-env.d.ts` gitignored | Regenerated per build |
| 5 | CSS order: Tailwind base → fleet → Tailwind components+utilities | Reset first, component layer middle, utility escape-hatch wins |
| 6 | `Record<string, never>` for propless components | Stricter than `{}` under `strict: true` |
| 7 | No `@types/jszip` | jszip ships its own types since v3.5 |
| 8 | `DEFAULT_SEED_INPUT` lives in `seedSchema.ts` | Co-located with the type it instantiates; imported everywhere |
| 9 | `PHASE_TEMPLATE.workerCount` is 0-placeholder for Build | `buildWavePlan()` replaces at runtime |
| 10 | Build groups A (foundation) / B (components) / C (pages) / D (agent files) — A+D parallel, B depends on A, C depends on B | Minimizes critical path |

---

*CC-OPS-SPECSEED — Architect A*
