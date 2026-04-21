import type { GeneratedSeed, SeedInput } from './seedSchema'
import { slugify } from './helpers'
import { buildWavePlan } from './wavePlan'
import { generateSeed } from './generateSeed'
import { generateClaudeMd } from './generateClaudeMd'
import { generateAgentsMd } from './generateAgentsMd'
import { generateClaudeAgent } from './generateClaudeAgents'
import { generateCodexAgent, generateCodexConfig } from './generateCodexConfig'
import { generateMacosSetup, generateUbuntuBootstrap } from './generateOsAdapters'

/** Top-level orchestrator. Pure, synchronous, deterministic. */
export function compileFullSeed(input: SeedInput): GeneratedSeed {
  const plan = buildWavePlan(input)
  const slug = slugify(input.projectName)
  return {
    slug,
    plan,
    seedMd: generateSeed(input, plan),
    claudeMd: generateClaudeMd(input),
    agentsMd: generateAgentsMd(input),
    claudeAgents: {
      reviewer: generateClaudeAgent('reviewer', input),
      recon:    generateClaudeAgent('recon',    input),
      tester:   generateClaudeAgent('tester',   input),
    },
    codexAgents: {
      reviewer: generateCodexAgent('reviewer'),
      worker:   generateCodexAgent('worker'),
    },
    codexConfig: generateCodexConfig(),
    macosSetup: generateMacosSetup(input),
    ubuntuBootstrap: generateUbuntuBootstrap(input),
  }
}
