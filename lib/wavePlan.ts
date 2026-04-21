import type { PhaseSpec, Parallelism, Risk, Scope, SeedInput, WavePlan } from './seedSchema'
import {
  PARALLELISM_BOOST,
  PHASE_TEMPLATE,
  RISK_BOOST,
  SCOPE_BASE,
  WORKER_CAP_MAX,
  WORKER_CAP_MIN,
} from './constants'

/** Compute parallel worker cap, clamped to [1, 12]. */
export function workerCap(scope: Scope, parallelism: Parallelism, risk: Risk): number {
  const raw = SCOPE_BASE[scope] + PARALLELISM_BOOST[parallelism] + RISK_BOOST[risk]
  return Math.max(WORKER_CAP_MIN, Math.min(WORKER_CAP_MAX, raw))
}

/** Depth of dependency decomposition for build phase planning. */
export function decompositionDepth(scope: Scope): 1 | 2 | 3 {
  if (scope === 'tiny' || scope === 'small') return 1
  if (scope === 'medium') return 2
  return 3
}

/** Whether a project warrants agent-team structures (nested fan-out). */
export function shouldUseAgentTeams(scope: Scope, parallelism: Parallelism): boolean {
  return (scope === 'large' || scope === 'platform') && parallelism !== 'conservative'
}

/** Resolve the 9 PhaseSpec rows with the Build workerCount filled from cap. */
export function buildPhases(cap: number): PhaseSpec[] {
  return PHASE_TEMPLATE.map((p) =>
    p.name === 'Build' ? { ...p, workerCount: cap } : { ...p },
  )
}

/** Full wave plan for a SeedInput. */
export function buildWavePlan(input: SeedInput): WavePlan {
  const cap = workerCap(input.scope, input.parallelism, input.risk)
  return {
    workerCap: cap,
    decompositionDepth: decompositionDepth(input.scope),
    useAgentTeams: shouldUseAgentTeams(input.scope, input.parallelism),
    phases: buildPhases(cap),
  }
}
