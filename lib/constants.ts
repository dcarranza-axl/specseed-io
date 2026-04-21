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

export const PROJECT_TYPE_OPTIONS: readonly { value: ProjectType; label: string }[] = [
  { value: 'landing-page', label: 'Landing page' },
  { value: 'saas-app', label: 'SaaS app' },
  { value: 'docs-site', label: 'Docs site' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'api', label: 'API' },
  { value: 'full-stack-app', label: 'Full-stack app' },
]

export const AGENT_PLATFORM_OPTIONS: readonly { value: AgentPlatform; label: string }[] = [
  { value: 'claude-code', label: 'Claude' },
  { value: 'codex', label: 'Codex' },
  { value: 'both', label: 'Both' },
]

export const ENVIRONMENT_OPTIONS: readonly { value: Environment; label: string }[] = [
  { value: 'macos', label: 'macOS' },
  { value: 'ubuntu', label: 'Ubuntu' },
  { value: 'both', label: 'Both' },
]

export const SCOPE_OPTIONS: readonly { value: Scope; label: string }[] = [
  { value: 'tiny', label: 'Tiny' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'platform', label: 'Platform' },
]

export const RISK_OPTIONS: readonly { value: Risk; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const PARALLELISM_OPTIONS: readonly { value: Parallelism; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'aggressive', label: 'Aggressive' },
]

export const OUTPUT_STYLE_OPTIONS: readonly { value: OutputStyle; label: string }[] = [
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'exhaustive', label: 'Exhaustive' },
]

export const DEPLOYMENT_TARGET_OPTIONS: readonly { value: DeploymentTarget; label: string }[] = [
  { value: 'static', label: 'Static' },
  { value: 'vercel', label: 'Vercel' },
  { value: 'docker', label: 'Docker' },
  { value: 'ubuntu-vps', label: 'Ubuntu VPS' },
  { value: 'custom', label: 'Custom' },
]

export const SCOPE_BASE: Record<Scope, number> = {
  tiny: 1,
  small: 2,
  medium: 4,
  large: 6,
  platform: 8,
}

export const PARALLELISM_BOOST: Record<Parallelism, number> = {
  conservative: -1,
  balanced: 0,
  aggressive: 2,
}

export const RISK_BOOST: Record<Risk, number> = {
  low: 0,
  medium: 1,
  high: 2,
}

export const WORKER_CAP_MIN = 1
export const WORKER_CAP_MAX = 12

/** 9-phase schedule template. Phase 4 (Build) workerCount is resolved to workerCap at runtime. */
export const PHASE_TEMPLATE: readonly PhaseSpec[] = [
  { index: 0, name: 'Recon',        model: 'haiku',  effort: 'default', duration: '30s', fanOut: 'Inventory ×1',        artifact: '00-recon.md',         workerCount: 1 },
  { index: 1, name: 'Strategy',     model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Strategy ×1',         artifact: '01-strategy.md',      workerCount: 1 },
  { index: 2, name: 'Decompose',    model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Decomposer A, B',     artifact: '02-decomposition.md', workerCount: 2 },
  { index: 3, name: 'Architecture', model: 'opus',   effort: 'high',    duration: '3m',  fanOut: 'Architect A, B',      artifact: '03-architecture.md',  workerCount: 2 },
  { index: 4, name: 'Build',        model: 'sonnet', effort: 'default', duration: '5m',  fanOut: 'Builder × workerCap', artifact: '04-build-diffs',      workerCount: 0 },
  { index: 5, name: 'Wire',         model: 'sonnet', effort: 'default', duration: '3m',  fanOut: 'Wiring ×1',           artifact: '05-wire.md',          workerCount: 1 },
  { index: 6, name: 'Test',         model: 'sonnet', effort: 'default', duration: '3m',  fanOut: 'Tester ×1',           artifact: '06-verification.md',  workerCount: 1 },
  { index: 7, name: 'Review',       model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Reviewer ×1',         artifact: '07-review.md',        workerCount: 1 },
  { index: 8, name: 'Integration',  model: 'opus',   effort: 'high',    duration: '2m',  fanOut: 'Integrator ×1',       artifact: '08-integration.md',   workerCount: 1 },
]

export const TIER_BADGE_CLASS: Record<ModelTier, string> = {
  haiku:  'btn btn-ghost btn-sm',
  sonnet: 'btn btn-secondary btn-sm',
  opus:   'btn btn-primary btn-sm',
}

export const AGENT_ROLES: readonly AgentRole[] = [
  { kind: 'recon',      label: 'Recon',      tier: 'haiku',  blurb: 'Inventory the box and toolchain. Read-only.',          activeInPhases: [0] },
  { kind: 'strategist', label: 'Strategist', tier: 'opus',   blurb: 'Lock stack, output mode, and dep list.',               activeInPhases: [1] },
  { kind: 'decomposer', label: 'Decomposer', tier: 'opus',   blurb: 'Fan tasks out; produce dep graph + build groups.',     activeInPhases: [2] },
  { kind: 'architect',  label: 'Architect',  tier: 'opus',   blurb: 'Final file tree + interfaces + config contracts.',     activeInPhases: [3] },
  { kind: 'builder',    label: 'Builder',    tier: 'sonnet', blurb: 'Implement one scoped task. No adjacent refactors.',    activeInPhases: [4] },
  { kind: 'wirer',      label: 'Wirer',      tier: 'sonnet', blurb: 'Connect components, routes, and public assets.',       activeInPhases: [5] },
  { kind: 'tester',     label: 'Tester',     tier: 'sonnet', blurb: 'Run lint + build + DoD checklist.',                    activeInPhases: [6] },
  { kind: 'reviewer',   label: 'Reviewer',   tier: 'opus',   blurb: 'Read-only pass. No edits. Flag risk and regressions.', activeInPhases: [7] },
  { kind: 'integrator', label: 'Integrator', tier: 'opus',   blurb: 'Deploy, smoke-test, close out _mos/.',                 activeInPhases: [8] },
]
