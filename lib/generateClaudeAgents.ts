import type { SeedInput } from './seedSchema'
import { escapeYaml, joinLines } from './helpers'

type ClaudeAgentName = 'reviewer' | 'recon' | 'tester'

function frontmatter(name: ClaudeAgentName, description: string, tools: string, model: string): string {
  return joinLines([
    '---',
    `name: ${name}`,
    `description: ${escapeYaml(description)}`,
    `tools: ${tools}`,
    `model: ${model}`,
    '---',
  ])
}

export function generateClaudeAgent(name: ClaudeAgentName, input: SeedInput): string {
  const projectName = input.projectName
  switch (name) {
    case 'reviewer':
      return joinLines([
        frontmatter(
          'reviewer',
          `Final read-only review of ${projectName} implementation diffs. Flags regressions, scope creep, and drift.`,
          'Read, Grep, Glob',
          'opus',
        ),
        '',
        `You are the reviewer agent for ${projectName}.`,
        '',
        '## Scope',
        '- Read-only. Never edit files.',
        '- Compare implementation against SEED.md §5 (Nine-Phase Octopus), §7 (Wave Plan), §11 (Definition of Done).',
        '- Flag: untested paths, skipped lint, suppressed type errors, unscoped refactors.',
        '',
        '## Output',
        'Return only issues. Each issue: `path:line`, severity (P0/P1/P2), one-line fix suggestion. No summaries.',
      ])
    case 'recon':
      return joinLines([
        frontmatter(
          'recon',
          `Session-start inventory for ${projectName}: file tree, deps, TODO scan.`,
          'Read, Grep, Glob, Bash',
          'haiku',
        ),
        '',
        'Inventory the repo.',
        '',
        '- File tree, 2 levels deep.',
        '- `package.json` scripts list.',
        '- Any `TODO` / `FIXME` in source.',
        '',
        'Return as structured Markdown. Do not modify files.',
      ])
    case 'tester':
      return joinLines([
        frontmatter(
          'tester',
          `Run npm lint + build + basic DoD verification for ${projectName}.`,
          'Read, Bash, Edit',
          'sonnet',
        ),
        '',
        'Run:',
        '',
        '```bash',
        'npm run lint',
        'npm run build',
        '```',
        '',
        'Report pass/fail. On failure, extract the first 20 lines of error output and identify the likely root file + line. Fix only simple lint-level issues you can resolve in a single edit.',
      ])
  }
}
