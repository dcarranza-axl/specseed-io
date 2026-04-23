'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { compileFullSeed } from '@/lib/compileFullSeed'
import {
  DEFAULT_SEED_INPUT,
  EMPTY_SEED_INPUT,
  type SeedInput,
} from '@/lib/seedSchema'
import { FORM_FIELDS } from '@/lib/formFields'
import { copyToClipboard } from '@/lib/clipboard'
import { downloadBundle, downloadFile } from '@/lib/downloadFile'
import { buildShareUrl, readShareFromLocation } from '@/lib/shareUrl'
import { getStarredState } from '@/lib/githubStar'
import { Button } from './ui/Button'
import { FormField } from './ui/FormField'
import { TabStrip } from './ui/TabStrip'
import { SegmentedControl } from './ui/SegmentedControl'
import { StarGate } from './ui/StarGate'
import { MarkdownPreview } from './MarkdownPreview'

const MAIN_TABS = [
  { id: 'seed',    label: 'SEED.md' },
  { id: 'claude',  label: 'CLAUDE.md' },
  { id: 'agents',  label: 'AGENTS.md' },
  { id: 'claudeA', label: 'Claude Agents' },
  { id: 'codexA',  label: 'Codex Agents' },
  { id: 'macos',   label: 'macOS' },
  { id: 'ubuntu',  label: 'Ubuntu' },
] as const
type MainTabId = (typeof MAIN_TABS)[number]['id']

const CLAUDE_SUB = [
  { value: 'reviewer', label: 'reviewer.md' },
  { value: 'recon',    label: 'recon.md' },
  { value: 'tester',   label: 'tester.md' },
]
const CODEX_SUB = [
  { value: 'config',   label: 'config.toml' },
  { value: 'reviewer', label: 'reviewer.toml' },
  { value: 'worker',   label: 'worker.toml' },
]

type PendingAction = null | 'seed' | 'pack'

interface SeedGeneratorProps {
  initialInput?: SeedInput
  input?: SeedInput
  onInputChange?: (next: SeedInput) => void
  fullBleed?: boolean
}

export function SeedGenerator({
  initialInput,
  input: controlledInput,
  onInputChange,
  fullBleed = false,
}: SeedGeneratorProps) {
  const isControlled = controlledInput !== undefined && onInputChange !== undefined
  const [localInput, setLocalInput] = useState<SeedInput>(initialInput ?? DEFAULT_SEED_INPUT)
  const input = isControlled ? controlledInput : localInput

  const setInput = (next: SeedInput) => {
    if (isControlled) onInputChange(next)
    else setLocalInput(next)
  }

  const [activeTab, setActiveTab] = useState<MainTabId>('seed')
  const [claudeSub, setClaudeSub] = useState('reviewer')
  const [codexSub, setCodexSub] = useState('config')
  const [copyLabel, setCopyLabel] = useState<'Copy Markdown' | 'Copied'>('Copy Markdown')
  const [shareLabel, setShareLabel] = useState<'Share seed' | 'Link copied'>('Share seed')
  const [building, setBuilding] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const pendingAction = useRef<PendingAction>(null)

  // Read ?s=... query param on first mount and pre-populate input if present.
  // SSR renders with the server-side default; client reads window here post-hydration,
  // which intentionally triggers one extra render — the cleanest pattern for URL→state
  // in a static-exported page.
  useEffect(() => {
    const shared = readShareFromLocation()
    if (shared) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(shared)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bundle = useMemo(() => compileFullSeed(input), [input])

  const onFieldChange = <K extends keyof SeedInput>(field: K, value: SeedInput[K]) => {
    setInput({ ...input, [field]: value })
  }

  const content: string =
    activeTab === 'seed'    ? bundle.seedMd :
    activeTab === 'claude'  ? bundle.claudeMd :
    activeTab === 'agents'  ? bundle.agentsMd :
    activeTab === 'claudeA' ? bundle.claudeAgents[claudeSub as 'reviewer' | 'recon' | 'tester'] :
    activeTab === 'codexA'  ? (codexSub === 'config' ? bundle.codexConfig : bundle.codexAgents[codexSub as 'reviewer' | 'worker']) :
    activeTab === 'macos'   ? bundle.macosSetup :
                              bundle.ubuntuBootstrap

  const activeFilename =
    activeTab === 'seed'    ? `SEED-${bundle.slug}.md` :
    activeTab === 'claude'  ? 'CLAUDE.md' :
    activeTab === 'agents'  ? 'AGENTS.md' :
    activeTab === 'claudeA' ? `.claude/agents/${claudeSub}.md` :
    activeTab === 'codexA'  ? (codexSub === 'config' ? '.codex/config.toml' : `.codex/agents/${codexSub}.toml`) :
    activeTab === 'macos'   ? 'macos-setup.sh' :
                              'ubuntu-bootstrap.md'

  async function handleCopy() {
    try {
      await copyToClipboard(content)
      setCopyLabel('Copied')
      setTimeout(() => setCopyLabel('Copy Markdown'), 1500)
    } catch {
      alert('Clipboard unavailable — copy manually.')
    }
  }

  async function handleShare() {
    const url = buildShareUrl(input)
    try {
      await copyToClipboard(url)
      setShareLabel('Link copied')
      setTimeout(() => setShareLabel('Share seed'), 1500)
    } catch {
      // Fallback: bounce the URL through window.prompt
      if (typeof window !== 'undefined') {
        window.prompt('Copy this share URL:', url)
      }
    }
  }

  function handleDownloadSeed() {
    downloadFile(`SEED-${bundle.slug}.md`, bundle.seedMd, 'text/markdown;charset=utf-8')
  }

  async function handleDownloadPack() {
    setBuilding(true)
    try {
      await downloadBundle(bundle, bundle.slug)
    } catch {
      alert('Bundle failed — please retry.')
    } finally {
      setBuilding(false)
    }
  }

  function gatedDownloadSeed() {
    if (getStarredState().verified) return handleDownloadSeed()
    pendingAction.current = 'seed'
    setGateOpen(true)
  }

  function gatedDownloadPack() {
    if (getStarredState().verified) return handleDownloadPack()
    pendingAction.current = 'pack'
    setGateOpen(true)
  }

  function onGateVerified() {
    const action = pendingAction.current
    pendingAction.current = null
    if (action === 'seed') handleDownloadSeed()
    else if (action === 'pack') void handleDownloadPack()
  }

  function handleClear() {
    setInput(EMPTY_SEED_INPUT)
  }

  function handleDemo() {
    setInput(DEFAULT_SEED_INPUT)
  }

  return (
    <section
      id={fullBleed ? undefined : 'generator'}
      aria-labelledby="generator-heading"
      className={clsx(fullBleed ? 'w-full' : 'max-w-6xl mx-auto px-6 py-12')}
    >
      {!fullBleed && (
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <h2 id="generator-heading" className="text-2xl text-[var(--text-bright)]">
            Generate
          </h2>
          <div className="font-mono text-xs text-[var(--text-muted)]">
            Live preview · updates on every keystroke
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gen:grid-cols-[minmax(0,420px)_1fr] gap-6">
        <div className="card card-brick p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Input
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDemo}>
                Demo
              </Button>
            </div>
          </div>
          <div className="space-y-0">
            {FORM_FIELDS.map((spec) => (
              <FormField
                key={spec.id}
                spec={spec}
                value={String(input[spec.id as keyof SeedInput] ?? '')}
                onChange={(v) => onFieldChange(spec.id as keyof SeedInput, v as SeedInput[keyof SeedInput])}
              />
            ))}
          </div>
        </div>

        <div className="card card-brick p-6 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Preview
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              {shareLabel}
            </Button>
          </div>

          <TabStrip
            tabs={MAIN_TABS}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as MainTabId)}
            ariaLabel="Preview tabs"
          />

          {activeTab === 'claudeA' && (
            <SegmentedControl
              name="Claude agent file"
              value={claudeSub}
              options={CLAUDE_SUB}
              onChange={setClaudeSub}
            />
          )}
          {activeTab === 'codexA' && (
            <SegmentedControl
              name="Codex file"
              value={codexSub}
              options={CODEX_SUB}
              onChange={setCodexSub}
            />
          )}

          <MarkdownPreview content={content} filename={activeFilename} maxHeight="55vh" />

          <div className="form-actions flex-wrap">
            <Button variant="secondary" onClick={handleCopy}>
              {copyLabel}
            </Button>
            <Button variant="primary" onClick={gatedDownloadSeed}>
              Download SEED.md
            </Button>
            <Button variant="secondary" onClick={gatedDownloadPack} disabled={building}>
              {building ? 'Building…' : 'Download Adapter Pack'}
            </Button>
          </div>
        </div>
      </div>

      <StarGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onVerified={onGateVerified}
      />
    </section>
  )
}
