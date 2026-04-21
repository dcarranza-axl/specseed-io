const STEPS: readonly { title: string; blurb: string }[] = [
  { title: 'Intent',         blurb: 'State one objective. One sentence.' },
  { title: 'Seed',           blurb: 'Generate SEED.md and adapter files.' },
  { title: 'Dechunk',        blurb: 'Break the goal into parallel work packets.' },
  { title: 'Parallel Waves', blurb: 'Fan out workers per phase. No recursion.' },
  { title: 'Collapse',       blurb: 'Each phase writes a _mos/ artifact.' },
  { title: 'Build',          blurb: 'Implement only what the architecture specifies.' },
  { title: 'Verify',         blurb: 'Lint + build + DoD checklist before ship.' },
]

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="max-w-6xl mx-auto px-6 py-20">
      <h2 id="how-heading" className="text-2xl mb-8 text-[var(--text-bright)]">
        How it works
      </h2>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card card-accent p-4">
            <div className="font-mono text-xs text-[var(--text-muted)]">
              0{i + 1}
            </div>
            <div className="font-mono uppercase tracking-wide text-sm text-[var(--text-bright)] mt-1">
              {s.title}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
              {s.blurb}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
