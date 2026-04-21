import type { SeedInput } from './seedSchema'
import { joinLines, slugify } from './helpers'

function buildCommandsFor(input: SeedInput): string {
  const isApi = input.projectType === 'api'
  const cmds = isApi
    ? ['npm install', 'npm run dev', 'npm run test', 'npm run lint', 'npm run build']
    : ['npm install', 'npm run dev', 'npm run lint', 'npm run build']
  return ['```bash', ...cmds, '```'].join('\n')
}

function fileOwnership(input: SeedInput): string {
  const lines = [
    '- `app/` — routes and layouts',
    '- `components/` — UI only, no business logic',
    '- `lib/` — pure functions and data; testable in isolation',
    '- `public/` — static assets',
    '- `_mos/` — build artifact documentation (committed)',
  ]
  if (input.projectType === 'api') {
    lines[0] = '- `src/` — route handlers and services'
  }
  return lines.join('\n')
}

/** Build CLAUDE.md. Guaranteed under 200 lines for any reasonable input. */
export function generateClaudeMd(input: SeedInput): string {
  const { projectName, objective } = input
  const slug = slugify(projectName)
  const mission = objective.trim() || 'See the product doc linked below.'
  return joinLines([
    `# CLAUDE.md — ${projectName}`,
    '',
    '## Mission',
    mission,
    '',
    '## Operating doctrine',
    '1. Read `SEED.md` before any session that touches core logic.',
    '2. Explore before coding. Use the recon subagent at session start.',
    '3. Collapse each phase into a `_mos/` artifact before moving on.',
    '4. Keep implementation changes scoped. One wave at a time.',
    '5. Run lint + build after every material change.',
    '',
    '## Subagents',
    '- @.claude/agents/recon.md — session-start inventory',
    '- @.claude/agents/tester.md — post-wave lint + build',
    '- @.claude/agents/reviewer.md — final read-only review',
    '',
    '## Build commands',
    buildCommandsFor(input),
    '',
    '## File ownership',
    fileOwnership(input),
    '',
    '## References',
    `- @docs/${slug}-product.md`,
    '- @docs/phase-octopus.md',
    '- @SEED.md',
    '',
    '## Verification',
    'Always run `npm run lint` + `npm run build` after material changes. Fix at root cause — do not suppress type errors with `// @ts-ignore`.',
  ])
}
