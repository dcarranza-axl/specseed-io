/**
 * Canonical type definitions for the SpecSeed generator.
 * Pure types + the DEFAULT_SEED_INPUT constant. No runtime behavior.
 */

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

export interface SeedInput {
  projectName: string
  objective: string
  projectType: ProjectType
  agentPlatform: AgentPlatform
  environment: Environment
  scope: Scope
  risk: Risk
  parallelism: Parallelism
  outputStyle: OutputStyle
  deploymentTarget: DeploymentTarget
  constraints: string
  repoNotes: string
}

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
  readonly index: number
  readonly name: PhaseName
  readonly model: ModelTier
  readonly effort: 'default' | 'high'
  readonly duration: string
  readonly fanOut: string
  readonly artifact: string
  readonly workerCount: number
}

export interface WavePlan {
  readonly workerCap: number
  readonly decompositionDepth: 1 | 2 | 3
  readonly useAgentTeams: boolean
  readonly phases: readonly PhaseSpec[]
}

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
  readonly blurb: string
  readonly activeInPhases: readonly number[]
}

export interface GeneratedSeed {
  readonly slug: string
  readonly plan: WavePlan
  readonly seedMd: string
  readonly claudeMd: string
  readonly agentsMd: string
  readonly claudeAgents: {
    readonly reviewer: string
    readonly recon: string
    readonly tester: string
  }
  readonly codexAgents: {
    readonly reviewer: string
    readonly worker: string
  }
  readonly codexConfig: string
  readonly macosSetup: string
  readonly ubuntuBootstrap: string
}

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
    'Next.js App Router, TypeScript strict, Tailwind CSS, Framer Motion.',
}
