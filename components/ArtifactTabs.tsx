'use client'

import { useMemo, useState } from 'react'
import { compileFullSeed } from '@/lib/compileFullSeed'
import { DEFAULT_SEED_INPUT, type SeedInput } from '@/lib/seedSchema'
import { TabStrip } from './ui/TabStrip'
import { MarkdownPreview } from './MarkdownPreview'

const TABS = [
  { id: 'seed',   label: 'SEED.md' },
  { id: 'claude', label: 'Claude Code' },
  { id: 'codex',  label: 'Codex' },
  { id: 'macos',  label: 'macOS' },
  { id: 'ubuntu', label: 'Ubuntu' },
] as const

type TabId = (typeof TABS)[number]['id']

interface ArtifactTabsProps {
  input?: SeedInput
}

export function ArtifactTabs({ input = DEFAULT_SEED_INPUT }: ArtifactTabsProps) {
  const bundle = useMemo(() => compileFullSeed(input), [input])
  const [active, setActive] = useState<TabId>('seed')

  const content =
    active === 'seed'   ? bundle.seedMd :
    active === 'claude' ? bundle.claudeMd :
    active === 'codex'  ? bundle.agentsMd :
    active === 'macos'  ? bundle.macosSetup :
    /* ubuntu */          bundle.ubuntuBootstrap

  const filename =
    active === 'seed'   ? `SEED-${bundle.slug}.md` :
    active === 'claude' ? 'CLAUDE.md' :
    active === 'codex'  ? 'AGENTS.md' :
    active === 'macos'  ? 'macos-setup.sh' :
                          'ubuntu-bootstrap.md'

  return (
    <section id="artifacts" aria-labelledby="artifacts-heading" className="max-w-6xl mx-auto px-6 py-16">
      <h2 id="artifacts-heading" className="text-2xl mb-4 text-[var(--text-bright)]">
        What you get
      </h2>
      <p className="text-[var(--text-muted)] text-sm mb-6 max-w-2xl">
        Every SpecSeed run produces these files. Below is what the demo input generates.
      </p>
      <TabStrip
        tabs={TABS}
        activeTab={active}
        onChange={(id) => setActive(id as TabId)}
        ariaLabel="Artifact preview tabs"
      />
      <div className="mt-4">
        <MarkdownPreview content={content} filename={filename} maxHeight="50vh" />
      </div>
    </section>
  )
}
