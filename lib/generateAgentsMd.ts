import type { Environment, SeedInput } from './seedSchema'
import { joinLines, slugify } from './helpers'

function envNotes(env: Environment): string[] {
  switch (env) {
    case 'macos':
      return ['Host: macOS. See `macos-setup.sh`.']
    case 'ubuntu':
      return ['Host: Ubuntu. See `ubuntu-bootstrap.md`.']
    case 'both':
      return ['Hosts: macOS (dev) and Ubuntu (prod). Run the matching bootstrap per machine.']
  }
}

function buildCommands(input: SeedInput): string {
  const isApi = input.projectType === 'api'
  const cmds = isApi
    ? ['npm install', 'npm run dev', 'npm run test', 'npm run build']
    : ['npm install', 'npm run dev', 'npm run build']
  return ['```bash', ...cmds, '```'].join('\n')
}

/** Build AGENTS.md for Codex. */
export function generateAgentsMd(input: SeedInput): string {
  const { projectName, objective } = input
  const slug = slugify(projectName)
  return joinLines([
    `# AGENTS.md — ${projectName}`,
    '',
    '## Purpose',
    'Instructions for Codex when working on this repo.',
    '',
    objective.trim() ? `Mission: ${objective.trim()}` : '',
    '',
    '## Spawning subagents',
    'When working a multi-component task, spawn explicitly:',
    '',
    '```',
    'Spawn one agent for [task A], one for [task B].',
    'Wait for both. Return a consolidated implementation plan before editing files.',
    '```',
    '',
    '## Scope boundaries',
    '- Workers receive a single scoped task. Do not refactor adjacent code.',
    '- Reviewers are read-only. They do not edit files.',
    '- Use `.codex/config.toml` `max_threads` as the hard ceiling on parallel fan-out.',
    ...envNotes(input.environment).map((l) => `- ${l}`),
    '',
    '## Build commands',
    buildCommands(input),
    '',
    '## References',
    `- @docs/${slug}-product.md`,
    '- @SEED.md',
  ])
}
