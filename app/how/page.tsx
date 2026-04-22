import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'How it works',
  description:
    'A three-hour, one-seed orchestration run that built SpecSeed.io. The full log: phase timings, the MOS excerpts, the parallel Opus fan-out, and every collapse artifact.',
  openGraph: {
    title: 'How SpecSeed.io was built — one MOS, four parallel Opus, three hours',
    description:
      'Full audit trail of the Nine-Phase Octopus run. Real timings, real adaptations, every artifact readable.',
    url: 'https://specseed.io/how/',
    siteName: 'SpecSeed',
    type: 'article',
  },
}

const DIAGRAM = String.raw`
  ╔═════════════════════════════════════════════════════════╗
  ║     MOS — one human-authored document                   ║
  ║     SPECSEED-MOS.md · ~50 KB · "Nine-Phase Octopus"     ║
  ╚══════════════════════════╤══════════════════════════════╝
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │   CLAUDE OPUS 4.7  ·  root orchestrator                  │
  │   reads MOS · owns fan-out + collapse · writes _mos/     │
  └──────────────────────────┬───────────────────────────────┘
                             │
                             ▼
  ┌─── Phase 0 · Recon ─────────────────────────┐   ~10 min
  │   box inventory · toolchain · fleet template │
  │   (orchestrator alone)                       │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/00-recon.md
  ┌─── Phase 1 · Strategy ──────────────────────┐   ~8 min
  │   stack + export mode + deps locked          │
  │   (orchestrator alone, high effort)          │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/01-strategy.md
  ┌─── Phase 2 · Decompose ─────────────────────┐
  │                                              │
  │     ┌─ Opus-A (frontend components) ──┐     │  ~4 min wall
  │     │                                  │     │  / ~16 min
  │     └─ Opus-B (library functions) ────┤     │  of planner work
  │                                  ∥∥    │     │
  │                   fan-out parallel      │     │
  │                                  ∥∥    │     │
  │          [ ROOT COLLAPSES ]             │     │
  └──────────────────────────┬──────────────┘     │
                             ▼   _mos/02-decomposition.md
  ┌─── Phase 3 · Architecture ─────────────────┐
  │                                              │
  │     ┌─ Opus-A (file tree + TS interfaces) ┐ │  ~4 min wall
  │     │                                       │ │  / ~16 min
  │     └─ Opus-B (function signatures) ──────┤ │  of planner work
  │                                  ∥∥        │ │
  │                   fan-out parallel          │ │
  │                                  ∥∥        │ │
  │          [ ROOT COLLAPSES ]                │ │
  └──────────────────────────┬──────────────────┘
                             ▼   _mos/03-architecture.md
  ┌─── Phase 4 · Build ─────────────────────────┐   ~90 min
  │   create-next-app · npm install              │   (the long pole —
  │   60 files written across lib/, components/, │    1 vCPU droplet)
  │   app/, public/, .claude/, .codex/           │
  └──────────────────────────┬───────────────────┘
                             ▼
  ┌─── Phase 5 · Wire ──────────────────────────┐   ~3 min
  │   import graph verify · prop contracts       │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/05-wire.md
  ┌─── Phase 6 · Test ──────────────────────────┐   ~5 min
  │   npm run lint   · 0 errors                  │
  │   npm run build  · 4 static pages ·          │
  │   TypeScript     · 0 errors                  │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/06-verification.md
  ┌─── Phase 7 · Review ────────────────────────┐   ~5 min
  │   DoD checklist · P0/P1/P2 flags             │
  │   (orchestrator acting as reviewer)          │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/07-review.md
  ┌─── Phase 8 · Integration ───────────────────┐   ~5 min
  │   docs · final build · launch prep           │
  └──────────────────────────┬───────────────────┘
                             ▼   _mos/08-integration.md
  ┌─── DEPLOY  (required operator approval) ────┐   ~5 min +
  │   nginx site · certbot · systemctl reload    │   ~30 min
  │                                              │   approval wait
  └──────────────────────────┬───────────────────┘
                             ▼
  ╔══════════════════════════════════════════════════════════╗
  ║   https://specseed.io                                    ║
  ║   89 files committed · 13 audit artifacts · TLS renews   ║
  ╚══════════════════════════════════════════════════════════╝
`.trimEnd()

const MOS_OPERATING_DOCTRINE = `You are the root orchestrator for SpecSeed.io. You have one mission:
build a production-quality website that IS the product it describes.

Cardinal rules before any code is written:

1. Do not write a single line of implementation code until Phase 2
   (Decompose) is complete.
2. Read this entire MOS first. The full picture changes what Phase 4
   looks like.
3. Every phase must produce its named collapse artifact as a file in
   _mos/ before the next phase begins.
4. The Nine-Phase Octopus is not a metaphor here. It is your literal
   execution schedule.
5. Worker budget per phase is computed by scope=medium,
   parallelism=balanced, risk=medium → workerCap = 5.
6. If a phase would benefit from parallel subagents, spawn them
   explicitly with scoped instructions. Do not let them recurse.
   The root orchestrator collapses their output.`

const MOS_WAVE_ALGO = `// From Section 4 — the canonical generator logic
const scopeBase        = { tiny: 1, small: 2, medium: 4, large: 6, platform: 8 }
const parallelismBoost = { conservative: -1, balanced: 0, aggressive: 2 }
const riskBoost        = { low: 0, medium: 1, high: 2 }

function workerCap(scope, parallelism, risk) {
  return Math.max(1,
    Math.min(12, scopeBase[scope] + parallelismBoost[parallelism] + riskBoost[risk])
  )
}

// Demo input resolves to:  4 + 0 + 1 = 5 workers in Phase 4 Build.`

const MOS_LAUNCH_PROMPT = `Read SPECSEED-MOS.md in full before doing anything else.

Then execute the Nine-Phase Octopus exactly as specified:

Phase 0: Recon        → write _mos/00-recon.md
Phase 1: Strategy     → write _mos/01-strategy.md
Phase 2: Decompose    → write _mos/02-decomposition.md
Phase 3: Architecture → write _mos/03-architecture.md
Phase 4: Build        → implement all files per the architecture
Phase 5: Wire         → verify all connections → _mos/05-wire.md
Phase 6: Test         → lint + build → _mos/06-verification.md
Phase 7: Review       → audit UX + code → _mos/07-review.md
Phase 8: Integration  → fix P0/P1, final docs, final build

Do not start Phase 4 until Phase 3 artifact exists.
Do not declare done until all items in Definition of Done are checked.

Report final file tree and build status when complete.`

const TIMELINE = [
  { phase: 'Recon',         dur: '~10 min', note: 'apt install Node/nginx/certbot · 2 GB swap · fleet bundle fetched (token burned) + SHA verified · /var/www/specseed-io/ scaffolded' },
  { phase: 'Strategy',      dur: '~8 min',  note: 'stack + export mode + dep list locked · fleet palette substituted for theme-ref endpoint' },
  { phase: 'Decompose',     dur: '~4 min',  note: '2 Opus subagents in parallel (components, lib) · collapsed to 02-decomposition.md' },
  { phase: 'Architecture',  dur: '~4 min',  note: '2 Opus subagents in parallel (file tree + interfaces, signatures + contracts) · collapsed' },
  { phase: 'Build',         dur: '~90 min', note: 'create-next-app · npm install × a few iterations · ~60 files written · Next 16 + Tailwind v4 reality adapted from Next 14 + Tailwind 3 plan' },
  { phase: 'Wire',          dur: '~3 min',  note: 'import graph + prop contracts verified' },
  { phase: 'Test',          dur: '~5 min',  note: '1 TypeScript error (obsolete NextConfig key), 1 ESLint warning (stale import), both fixed · build green first-real-try · 4 static pages emitted to out/' },
  { phase: 'Review',        dur: '~5 min',  note: 'DoD checklist · 3 P1s deferred, 0 P0s' },
  { phase: 'Integration',   dur: '~5 min',  note: 'docs + final build + launch prep' },
  { phase: 'Deploy',        dur: '~5 min',  note: '+ ~30 min operator approval latency · nginx site → enabled → validated → reloaded · certbot --nginx for TLS · HTTP 301→HTTPS wired' },
]

const NUMBERS = [
  { k: 'Wall clock',        v: '3 h 6 min',  sub: 'fleet extract → HTTPS live' },
  { k: 'Active Claude time',v: '~75 min',    sub: 'excluding npm install / compile / approvals' },
  { k: 'Parallel planner speedup', v: '~4×', sub: 'Phase 2+3 wall vs serial equivalent' },
  { k: 'Files committed',   v: '89',         sub: 'single commit, local repo, no remote' },
  { k: 'Source code insertions', v: '16,090 lines', sub: 'at HEAD' },
  { k: 'lib/ modules',      v: '17',         sub: 'pure, deterministic, 0 runtime deps' },
  { k: 'Components',        v: '15',         sub: '6 primitives · 6 leaves · 3 composites' },
  { k: '_mos/ audit artifacts', v: '13',     sub: 'full audit trail, readable below' },
  { k: 'Opus subagents',    v: '4',          sub: 'Phase 2+3 parallel planners' },
  { k: 'Initial bundle',    v: '~120 KB gz', sub: 'JSZip lazy-imported' },
  { k: 'First-try build',   v: '✓',          sub: 'after 1 TS edit, 1 lint fix' },
  { k: 'CDN / build farm',  v: '0',          sub: 'built on the 1 vCPU droplet it runs on' },
]

const ADAPTATIONS = [
  { plan: 'Next.js 14 App Router',                  actual: 'Next.js 16.2.4',                     reason: 'create-next-app@latest shipped 16 in April 2026' },
  { plan: 'Tailwind CSS 3 + tailwind.config.ts',    actual: 'Tailwind v4 + @theme in globals.css',reason: 'Scaffold default; v4 uses CSS-native theme tokens' },
  { plan: '--src-dir + --no-import-alias',          actual: 'no src/, @/* alias enabled',          reason: 'MOS Section 3 tree showed app/ at root — tree won over flags' },
  { plan: 'Fetch _theme/theme-ref.json from theme.axlprotocol.org', actual: 'Use /opt/fleet-template/design/ directly', reason: 'Operator directive "adapt" — fleet bundle is the canonical palette source' },
  { plan: 'Gradient palette (gold/cyan/green/purple)', actual: 'Monochrome concrete + crimson',   reason: 'Fleet v0.1.0 brutalist design system supersedes MOS fallback' },
  { plan: 'Tier badges color-encoded per model',    actual: 'Encoded by fill style (ghost/outline/fill)', reason: 'Monochrome crimson-only discipline' },
  { plan: 'Framer Motion for octopus fan-out',      actual: 'Framer installed, not yet used',     reason: 'MVP shipped without motion polish — deferred P1' },
  { plan: 'og-image.png',                           actual: 'Removed from metadata',              reason: 'No image pipeline; real PNG deferred to v0.2 — P1' },
]

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div>
      {label && (
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
          {label}
        </div>
      )}
      <pre className="code-block" tabIndex={0}>{code}</pre>
    </div>
  )
}

export default function HowPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          <header className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--crimson)]">
              Build log · CC-OPS-SPECSEED · 2026-04-21
            </div>
            <h1 className="text-4xl sm:text-5xl leading-tight text-[var(--text-bright)]">
              How one seed became<br />
              <span className="accent">a production site in three hours.</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              One human-authored MOS (Master Orchestration Seed) document. One root Claude Opus 4.7.
              Four parallel Opus subagents for planning. Nine collapse phases. Nothing else.
              Below: the seed, the diagram, the real times, the honest adaptations, and every audit
              artifact — readable.
            </p>
          </header>

          {/* ─── TL;DR ─────────────────────────────────────────── */}
          <section aria-labelledby="tldr" className="card card-brick card-accent p-6 space-y-3">
            <h2 id="tldr" className="text-lg text-[var(--text-bright)]">TL;DR</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-[var(--text)]">
              <li>
                <strong className="text-[var(--crimson)]">One prompt</strong> — a ~50 KB
                MOS document prescribing nine phases with collapse artifacts — produced
                <strong className="text-[var(--text-bright)]"> 89 files, live HTTPS,
                and TLS auto-renew</strong> in 3 h 6 min wall clock.
              </li>
              <li>
                <strong className="text-[var(--crimson)]">The key lever</strong> isn’t
                the model tier; it’s the <strong className="text-[var(--text-bright)]">
                parallel fan-out</strong>. Phases 2 + 3 ran four Opus subagents
                concurrently and gave ~4× wall-clock speedup on the planning work.
              </li>
              <li>
                <strong className="text-[var(--crimson)]">The discipline</strong> is
                collapse doctrine: every phase writes a
                <code className="mx-1 px-1.5 py-0.5 bg-[var(--concrete-800)] text-[var(--text-bright)] font-mono text-xs">
                  _mos/XX.md
                </code>
                artifact before the next begins. Reversible, auditable, debuggable.
              </li>
            </ul>
          </section>

          {/* ─── THE SEED ─────────────────────────────────────── */}
          <section aria-labelledby="seed" className="space-y-6">
            <h2 id="seed" className="text-3xl text-[var(--text-bright)]">The seed</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              The input was a single Markdown document titled
              <code className="mx-1 px-1.5 py-0.5 bg-[var(--concrete-800)] font-mono text-xs">SPECSEED-MOS.md</code>
              — a Master Orchestration Seed. It’s not a spec. It’s not a todo list. It’s
              an <em>execution contract</em> between a human operator and an agent: nine
              phases, each with a named model tier, a named effort level, a named output
              artifact, and explicit rules about parallelism and recursion.
            </p>

            <p className="text-[var(--text-muted)] leading-relaxed">
              Three excerpts from the seed that did most of the work:
            </p>

            <CodeBlock label="MOS · Section 0 · Operating doctrine" code={MOS_OPERATING_DOCTRINE} />
            <CodeBlock label="MOS · Section 4 · Wave algorithm (canonical)" code={MOS_WAVE_ALGO} />
            <CodeBlock label="MOS · Section 7 · Launch prompt" code={MOS_LAUNCH_PROMPT} />

            <p className="text-[var(--text-muted)] leading-relaxed">
              That’s the whole ignition sequence. No REPL, no eval loop, no
              back-and-forth negotiation. The MOS prescribes <em>what each phase must
              produce</em>, and the orchestrator’s job is to produce it.
            </p>
          </section>

          {/* ─── DIAGRAM ──────────────────────────────────────── */}
          <section aria-labelledby="diagram" className="space-y-4">
            <h2 id="diagram" className="text-3xl text-[var(--text-bright)]">The run, drawn</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Single root orchestrator. Fan-out only where it wins (planning). Collapse
              into one artifact per phase before moving on. Subagents never recurse.
            </p>
            <pre className="code-block text-xs sm:text-sm" aria-label="Phase flow diagram" tabIndex={0}>{DIAGRAM}</pre>
          </section>

          {/* ─── TIMELINE ─────────────────────────────────────── */}
          <section aria-labelledby="timeline" className="space-y-4">
            <h2 id="timeline" className="text-3xl text-[var(--text-bright)]">The run, timed</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Wall clock, phase by phase. The long pole is Phase 4 on a 1 vCPU droplet:
              npm install + writing ~60 files + two build passes. Planning phases (2 + 3)
              ran in four minutes flat because the orchestrator fanned out four Opus
              subagents in parallel.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                    <th className="py-2 pr-4">Phase</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2">What happened</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMELINE.map((t) => (
                    <tr key={t.phase} className="border-b border-[var(--border)] align-top">
                      <td className="py-2 pr-4 font-bold text-[var(--text-bright)] whitespace-nowrap">{t.phase}</td>
                      <td className="py-2 pr-4 text-[var(--crimson)] whitespace-nowrap">{t.dur}</td>
                      <td className="py-2 text-[var(--text)] leading-relaxed">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── FAN-OUT ───────────────────────────────────────── */}
          <section aria-labelledby="fanout" className="space-y-4">
            <h2 id="fanout" className="text-3xl text-[var(--text-bright)]">Why the fan-out earns its keep</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Phase 2 (Decompose) asks two independent questions — <em>what components
              exist?</em> and <em>what library functions exist?</em> — that don’t touch
              each other. Phase 3 (Architecture) splits the same way — <em>what’s
              the file tree and the type system?</em> vs <em>what are the function
              signatures and data flow?</em>.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              So the orchestrator spawned four Opus subagents — Decomposer A + B and
              Architect A + B — in one parallel tool call. Each received its own
              self-contained prompt (they couldn’t see each other, or the root
              conversation). Each wrote its own
              <code className="mx-1 px-1.5 py-0.5 bg-[var(--concrete-800)] font-mono text-xs">_mos/0X-worker.md</code>
              file. The root orchestrator then read all four and wrote the collapsed
              binding contract — resolving conflicts (e.g. Architect B’s
              <code className="mx-1 px-1.5 py-0.5 bg-[var(--concrete-800)] font-mono text-xs">phaseSchedule</code>
              vs Architect A’s
              <code className="mx-1 px-1.5 py-0.5 bg-[var(--concrete-800)] font-mono text-xs">phases</code>
              naming — tree wins, `phases` stays).
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Four minutes of wall clock. About sixteen minutes of sequential Opus
              planning work. That’s the ratio that matters on multi-phase agent runs:
              the model tier gets you <em>quality</em>; the fan-out gets you <em>wall
              clock</em>.
            </p>
          </section>

          {/* ─── ADAPTATIONS ──────────────────────────────────── */}
          <section aria-labelledby="adapt" className="space-y-4">
            <h2 id="adapt" className="text-3xl text-[var(--text-bright)]">What adapted between plan and reality</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              The MOS was written before the run. Between seed and execution, reality
              drifted in eight places. None were blockers; all were documented in the
              collapse artifacts as they happened.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                    <th className="py-2 pr-4 w-1/3">MOS said</th>
                    <th className="py-2 pr-4 w-1/3">Actually did</th>
                    <th className="py-2 w-1/3">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {ADAPTATIONS.map((a, i) => (
                    <tr key={i} className="border-b border-[var(--border)] align-top">
                      <td className="py-2 pr-4 text-[var(--text-muted)]">{a.plan}</td>
                      <td className="py-2 pr-4 text-[var(--text-bright)]">{a.actual}</td>
                      <td className="py-2 text-[var(--text)]">{a.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              The operator’s directive <em>“adapt”</em> was load-bearing. If the
              orchestrator had halted on each precondition (missing working dir, missing
              theme-ref file, Tailwind version mismatch), the run would’ve needed three
              round-trips and probably ~6 hours instead of 3.
            </p>
          </section>

          {/* ─── NUMBERS ──────────────────────────────────────── */}
          <section aria-labelledby="numbers" className="space-y-4">
            <h2 id="numbers" className="text-3xl text-[var(--text-bright)]">Numbers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NUMBERS.map((n) => (
                <div key={n.k} className="card card-brick p-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    {n.k}
                  </div>
                  <div className="font-mono text-xl text-[var(--text-bright)] leading-tight">
                    {n.v}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    {n.sub}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── ARTIFACTS ─────────────────────────────────────── */}
          <section aria-labelledby="artifacts" className="space-y-4">
            <h2 id="artifacts" className="text-3xl text-[var(--text-bright)]">Read the artifacts</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              The full audit trail is served as raw Markdown. Each file is what the
              orchestrator actually wrote during the run — no post-hoc editing, no
              summarization. The 02-decompose-A/B and 03-architect-A/B files are the
              individual subagent outputs before collapse; the 02-decomposition and
              03-architecture files are the merged binding contracts.
            </p>
            <ul className="font-mono text-sm space-y-1.5">
              {[
                ['00-recon.md',         'box inventory + fleet template decision'],
                ['01-strategy.md',      'stack + dependency constraint contract'],
                ['seed-brief.md',       'condensed MOS reference given to the 4 subagents'],
                ['02-decompose-A.md',   'Opus · frontend component inventory'],
                ['02-decompose-B.md',   'Opus · library function inventory'],
                ['02-decomposition.md', 'collapsed — Phase 4 build-group order locked'],
                ['03-architect-A.md',   'Opus · file tree + TypeScript interfaces'],
                ['03-architect-B.md',   'Opus · function signatures + data flow'],
                ['03-architecture.md',  'collapsed — binding contract for Phase 4'],
                ['05-wire.md',          'import + prop wiring verification'],
                ['06-verification.md',  'lint + build result'],
                ['07-review.md',        'DoD checklist + P1 backlog'],
                ['08-integration.md',   'launch-readiness + deploy prep'],
              ].map(([f, desc]) => (
                <li key={f} className="flex gap-4">
                  <a
                    href={`/mos/${f}`}
                    className="text-[var(--crimson)] underline decoration-dotted underline-offset-4 hover:decoration-solid shrink-0 w-56"
                  >
                    {f}
                  </a>
                  <span className="text-[var(--text-muted)]">{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ─── CTA ──────────────────────────────────────────── */}
          <section aria-labelledby="cta" className="card card-brick card-accent p-8 space-y-4">
            <h2 id="cta" className="text-2xl text-[var(--text-bright)]">
              Write your own seed.
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              SpecSeed generates MOS documents for <em>your</em> project. Fill the form.
              Download the adapter pack. Paste the launch prompt into Claude Code or
              Codex. Watch it phase out.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/#generator" className="btn btn-primary focus-brick">
                Generate a seed
              </Link>
              <Link href="/playground/" className="btn btn-secondary focus-brick">
                Open the playground
              </Link>
            </div>
          </section>

          <div className="text-center text-xs font-mono text-[var(--text-muted)] pt-8">
            CC-OPS-SPECSEED · build log permalink: /how/
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
