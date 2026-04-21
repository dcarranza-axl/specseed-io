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
  | { id: keyof SeedInput; kind: 'text';      label: string; placeholder?: string; hint?: string }
  | { id: keyof SeedInput; kind: 'textarea';  label: string; rows: number; placeholder?: string; hint?: string }
  | { id: keyof SeedInput; kind: 'select';    label: string; options: readonly { value: string; label: string }[]; hint?: string }
  | { id: keyof SeedInput; kind: 'segmented'; label: string; options: readonly { value: string; label: string }[]; hint?: string }

export const FORM_FIELDS: readonly FormFieldSpec[] = [
  { id: 'projectName',      kind: 'text',      label: 'Project name',     placeholder: 'your-project' },
  { id: 'objective',        kind: 'textarea',  label: 'Objective',        rows: 3, placeholder: 'One paragraph mission statement', hint: 'What does this project do?' },
  { id: 'projectType',      kind: 'select',    label: 'Project type',     options: PROJECT_TYPE_OPTIONS, hint: 'Shape of the final deliverable.' },
  { id: 'agentPlatform',    kind: 'segmented', label: 'Agent platform',   options: AGENT_PLATFORM_OPTIONS, hint: 'Which adapters to generate.' },
  { id: 'environment',      kind: 'segmented', label: 'Environment',      options: ENVIRONMENT_OPTIONS, hint: 'Target OS adapters.' },
  { id: 'scope',            kind: 'segmented', label: 'Scope',            options: SCOPE_OPTIONS, hint: 'Drives worker count + decomposition depth.' },
  { id: 'risk',             kind: 'segmented', label: 'Risk',             options: RISK_OPTIONS, hint: 'Higher risk → more workers.' },
  { id: 'parallelism',      kind: 'segmented', label: 'Parallelism',      options: PARALLELISM_OPTIONS, hint: 'How hard to fan out waves.' },
  { id: 'outputStyle',      kind: 'segmented', label: 'Output style',     options: OUTPUT_STYLE_OPTIONS, hint: 'Prose density of generated docs.' },
  { id: 'deploymentTarget', kind: 'select',    label: 'Deployment target', options: DEPLOYMENT_TARGET_OPTIONS, hint: 'Where it lands.' },
  { id: 'constraints',      kind: 'textarea',  label: 'Constraints',      rows: 3, placeholder: 'Any hard constraints — budget, deps, bans' },
  { id: 'repoNotes',        kind: 'textarea',  label: 'Repo / stack notes', rows: 3, placeholder: 'Stack, conventions, quirks' },
]
