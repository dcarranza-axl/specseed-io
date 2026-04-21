import { joinLines, tomlString } from './helpers'

type CodexAgentName = 'reviewer' | 'worker'

/** `.codex/config.toml` — canonical constants per seed-brief. */
export function generateCodexConfig(): string {
  return joinLines([
    '# Codex configuration',
    '[agents]',
    'max_threads = 6',
    'max_depth = 1',
    '',
  ])
}

/** `.codex/agents/{name}.toml` */
export function generateCodexAgent(name: CodexAgentName): string {
  if (name === 'reviewer') {
    return joinLines([
      `name = ${tomlString('reviewer')}`,
      `description = ${tomlString('Read-only reviewer for correctness, security, accessibility, and missing tests.')}`,
      `model = ${tomlString('o3')}`,
      `model_reasoning_effort = ${tomlString('high')}`,
      `sandbox_mode = ${tomlString('read-only')}`,
      '',
      'developer_instructions = """',
      'Review like an owner. Prioritize: regressions, missing type safety, accessibility violations, deployment risk, and missing edge-case handling. Return concise findings with file references and line numbers.',
      '"""',
      '',
    ])
  }
  return joinLines([
    `name = ${tomlString('worker')}`,
    `description = ${tomlString('Scoped implementation worker. Receives one task and one file scope.')}`,
    `model = ${tomlString('o4-mini')}`,
    `model_reasoning_effort = ${tomlString('medium')}`,
    `sandbox_mode = ${tomlString('workspace-write')}`,
    '',
    'developer_instructions = """',
    'You receive a single scoped task. Implement only what is specified. Do not modify files outside your task scope. Do not refactor adjacent code. When done, report: files changed, lines added/removed, decisions made.',
    '"""',
    '',
  ])
}
