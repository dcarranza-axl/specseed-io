import type { SeedInput, WavePlan } from './seedSchema'
import { AGENT_ROLES } from './constants'
import { bulletList, joinLines, markdownTable, section } from './helpers'

const PROJECT_TYPE_LABEL: Record<SeedInput['projectType'], string> = {
  'landing-page': 'Landing page',
  'saas-app': 'SaaS application',
  'docs-site': 'Documentation site',
  'dashboard': 'Dashboard',
  'api': 'API service',
  'full-stack-app': 'Full-stack application',
}

const DEPLOYMENT_LABEL: Record<SeedInput['deploymentTarget'], string> = {
  'static': 'Static hosting (nginx / Netlify / Cloudflare Pages)',
  'vercel': 'Vercel',
  'docker': 'Docker container',
  'ubuntu-vps': 'Ubuntu VPS',
  'custom': 'Custom infrastructure',
}

const ENV_LABEL: Record<SeedInput['environment'], string> = {
  'macos': 'macOS',
  'ubuntu': 'Ubuntu',
  'both': 'macOS and Ubuntu',
}

function constraintsList(raw: string): string[] {
  return raw
    .split(/\r?\n|•|·/)
    .map((l) => l.replace(/^\s*[-*]?\s*/, '').trim())
    .filter(Boolean)
}

export function sectionObjective(input: SeedInput): string {
  const objective = input.objective.trim() || '(objective not provided — add one sentence in the form above)'
  return section(
    '1. Objective',
    joinLines([
      objective,
      '',
      `Deliverable shape: **${PROJECT_TYPE_LABEL[input.projectType]}**.`,
    ]),
  )
}

export function sectionOperatingPrinciple(input: SeedInput): string {
  const prose =
    input.outputStyle === 'concise'
      ? 'One agent orchestrates. Fan out. Collapse. Verify.'
      : input.outputStyle === 'exhaustive'
        ? 'One agent orchestrates the whole wave. It decomposes the objective, dispatches subagents in parallel, collapses their output into a single artifact, and moves to the next phase only when the artifact passes review. Every phase is reversible; every artifact is committed.'
        : 'One agent orchestrates the whole wave. It decomposes, dispatches subagents in parallel, collapses their output, and moves on only when the artifact passes review.'
  return section(
    '2. Operating Principle',
    joinLines([
      prose,
      '',
      bulletList([
        'Plan before code. Collapse each phase into a `_mos/` artifact.',
        'One wave at a time. Do not skip ahead.',
        'Trust but verify. Lint + build after every material change.',
        'Reversible by default. Do not introduce flags for hypothetical futures.',
      ]),
    ]),
  )
}

export function sectionTargetRuntime(input: SeedInput): string {
  const repoLine = input.repoNotes.trim() || '(no repo notes provided)'
  return section(
    '3. Target Runtime',
    joinLines([
      `Deployment target: **${DEPLOYMENT_LABEL[input.deploymentTarget]}**.`,
      `Developer environment: **${ENV_LABEL[input.environment]}**.`,
      '',
      `Stack / repo notes:`,
      '',
      '```',
      repoLine,
      '```',
    ]),
  )
}

export function sectionGlobalConstraints(input: SeedInput): string {
  const list = constraintsList(input.constraints)
  const userConstraints = list.length > 0
    ? bulletList(list)
    : '- (no explicit constraints provided)'
  return section(
    '4. Global Constraints',
    joinLines([
      userConstraints,
      '',
      'Fleet guardrails (always active):',
      bulletList([
        'No destructive fs operations without explicit operator checkpoint.',
        'No global package installs without operator approval.',
        'No skipped hooks or disabled type-checking to force a green build.',
        'No secrets in committed files.',
      ]),
    ]),
  )
}

export function sectionNinePhaseOctopus(plan: WavePlan): string {
  const headers = ['#', 'Name', 'Model', 'Effort', 'Duration', 'Fan-out', 'Workers', 'Artifact']
  const rows = plan.phases.map((p) => [
    String(p.index),
    p.name,
    cap1(p.model),
    p.effort,
    p.duration,
    p.fanOut,
    String(p.workerCount),
    p.artifact,
  ])
  return section(
    '5. Nine-Phase Octopus',
    joinLines([
      'The root orchestrator runs the phases in order. Each phase produces a collapse artifact before the next begins.',
      '',
      markdownTable(headers, rows),
    ]),
  )
}

export function sectionAgentRoles(input: SeedInput, plan: WavePlan): string {
  const headers = ['Role', 'Tier', 'Active in phases', 'Blurb']
  const rows = AGENT_ROLES.map((r) => [
    r.label,
    cap1(r.tier),
    r.activeInPhases.map((p) => `#${p}`).join(', '),
    r.blurb,
  ])
  const teamsLine = plan.useAgentTeams
    ? 'This plan uses **agent teams** — each build worker is paired with a scoped reviewer.'
    : 'This plan uses **flat workers** — no nested reviewer pairs.'
  return section(
    '6. Agent Roles',
    joinLines([
      teamsLine,
      '',
      markdownTable(headers, rows),
      '',
      input.agentPlatform === 'claude-code'
        ? 'Platform: Claude Code only. See Section 8.'
        : input.agentPlatform === 'codex'
          ? 'Platform: Codex only. See Section 9.'
          : 'Platforms: both Claude Code (Section 8) and Codex (Section 9).',
    ]),
  )
}

export function sectionWavePlan(plan: WavePlan): string {
  const buildPhase = plan.phases.find((p) => p.name === 'Build')
  const buildWorkers = buildPhase?.workerCount ?? plan.workerCap
  return section(
    '7. Wave Plan',
    joinLines([
      bulletList([
        `workerCap = **${plan.workerCap}** (clamped to [1, 12]).`,
        `decompositionDepth = **${plan.decompositionDepth}**.`,
        `useAgentTeams = **${plan.useAgentTeams}**.`,
        `Build phase fans out **${buildWorkers}** parallel workers.`,
      ]),
      '',
      'Formula:',
      '',
      '```',
      'workerCap    = clamp(1, 12, SCOPE_BASE[scope] + PARALLELISM_BOOST[parallelism] + RISK_BOOST[risk])',
      'SCOPE_BASE   = { tiny:1, small:2, medium:4, large:6, platform:8 }',
      'PARA_BOOST   = { conservative:-1, balanced:0, aggressive:2 }',
      'RISK_BOOST   = { low:0, medium:1, high:2 }',
      '```',
    ]),
  )
}

export function sectionClaudeAdapter(input: SeedInput): string {
  if (input.agentPlatform === 'codex') {
    return section(
      '8. Claude Code Adapter',
      joinLines([
        'Not primary for this project (Codex is the selected platform).',
        'Files still generated for portability:',
        bulletList([
          '`CLAUDE.md`',
          '`.claude/agents/reviewer.md`',
          '`.claude/agents/recon.md`',
          '`.claude/agents/tester.md`',
        ]),
      ]),
    )
  }
  return section(
    '8. Claude Code Adapter',
    joinLines([
      'Ship these files at the repo root:',
      '',
      bulletList([
        '`CLAUDE.md` — mission + operating doctrine + build commands. Under 200 lines.',
        '`.claude/agents/reviewer.md` — Opus, read-only, P0/P1/P2 flags.',
        '`.claude/agents/recon.md` — Haiku, inventory the repo on session start.',
        '`.claude/agents/tester.md` — Sonnet, runs lint + build.',
      ]),
      '',
      `Verification: run lint + build after every material change. Do not suppress type errors.`,
    ]),
  )
}

export function sectionCodexAdapter(input: SeedInput): string {
  if (input.agentPlatform === 'claude-code') {
    return section(
      '9. Codex Adapter',
      joinLines([
        'Not primary for this project (Claude Code is the selected platform).',
        'Files still generated for portability:',
        bulletList([
          '`AGENTS.md`',
          '`.codex/config.toml`',
          '`.codex/agents/reviewer.toml`',
          '`.codex/agents/worker.toml`',
        ]),
      ]),
    )
  }
  return section(
    '9. Codex Adapter',
    joinLines([
      'Ship these files at the repo root:',
      '',
      bulletList([
        '`AGENTS.md` — purpose, explicit spawn pattern, scope boundaries.',
        '`.codex/config.toml` — `[agents] max_threads=6 max_depth=1`.',
        '`.codex/agents/reviewer.toml` — o3, high reasoning, read-only.',
        '`.codex/agents/worker.toml` — o4-mini, medium reasoning, workspace-write.',
      ]),
      '',
      'Spawn pattern: explicit — "Spawn one agent for X, one for Y. Wait for both. Consolidate before editing."',
    ]),
  )
}

export function sectionOsAdapter(input: SeedInput): string {
  const env = input.environment
  const body =
    env === 'macos'
      ? 'macOS target: use `macos-setup.sh`. Install Node 20 via Homebrew. Use `launchd` for background jobs.'
      : env === 'ubuntu'
        ? 'Ubuntu target: follow `ubuntu-bootstrap.md`. Run as a non-root deploy user. Use `systemd` + UFW + nginx + certbot.'
        : 'Multi-OS: both scripts ship. macOS dev / Ubuntu prod is a common pattern.'
  return section(
    '10. OS Adapter',
    joinLines([
      body,
      '',
      'Adapter files in the bundle:',
      bulletList([
        '`macos-setup.sh` — bash, `set -euo pipefail`, node/npm version check.',
        '`ubuntu-bootstrap.md` — apt bootstrap runbook with nginx + certbot.',
      ]),
    ]),
  )
}

export function sectionDefinitionOfDone(input: SeedInput): string {
  const extra =
    input.outputStyle === 'exhaustive'
      ? [
          '[ ] All `_mos/` artifacts committed.',
          '[ ] README has a quick-start.',
          '[ ] SEO meta on every page.',
          '[ ] robots.txt + sitemap.xml present.',
        ]
      : []
  return section(
    '11. Definition of Done',
    joinLines([
      bulletList([
        '`npm run lint` passes with zero errors.',
        '`npm run build` completes successfully.',
        'TypeScript reports zero errors.',
        'Every feature listed in §1 works end-to-end.',
        'Adapter files exist and are syntactically valid.',
        ...extra,
      ]),
    ]),
  )
}

function cap1(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1)
}
