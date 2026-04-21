'use client'

import Link from 'next/link'

const SCROLL_TEXT = `## 5. Nine-Phase Octopus

| # | Name          | Model  | Workers | Artifact               |
| - | ------------- | ------ | ------- | ---------------------- |
| 0 | Recon         | Haiku  | 1       | 00-recon.md            |
| 1 | Strategy      | Opus   | 1       | 01-strategy.md         |
| 2 | Decompose     | Opus   | 2       | 02-decomposition.md    |
| 3 | Architecture  | Opus   | 2       | 03-architecture.md     |
| 4 | Build         | Sonnet | 5       | 04-build-diffs         |
| 5 | Wire          | Sonnet | 1       | 05-wire.md             |
| 6 | Test          | Sonnet | 1       | 06-verification.md     |
| 7 | Review        | Opus   | 1       | 07-review.md           |
| 8 | Integration   | Opus   | 1       | 08-integration.md      |

workerCap = clamp(1, 12, scopeBase[scope] + parallelismBoost[p] + riskBoost[r])
`

export function Hero() {
  return (
    <section className="hero relative min-h-[70vh] flex items-center px-6 py-24">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-code-scroll" aria-hidden="true">
        <div className="hero-code-scroll-inner">
          {SCROLL_TEXT}
          {SCROLL_TEXT}
        </div>
      </div>

      <div className="max-w-3xl relative z-10">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--crimson)] mb-4">
          CC-OPS-SPECSEED · v0.1
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight text-[var(--text-bright)] mb-6">
          From one objective
          <br />
          <span className="accent">to parallel agent execution.</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-2xl mb-8">
          SpecSeed turns a rough build request into Claude Code and Codex-ready orchestration seeds.
          Nine phases. Collapsed artifacts. Reversible waves.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/#generator" className="btn btn-primary focus-brick">
            Generate SEED.md
          </Link>
          <Link href="/playground/" className="btn btn-secondary focus-brick">
            Open Playground
          </Link>
        </div>
      </div>
    </section>
  )
}
