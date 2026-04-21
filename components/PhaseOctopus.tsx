import type { WavePlan } from '@/lib/seedSchema'
import { PhaseCard } from './PhaseCard'

interface PhaseOctopusProps {
  plan: WavePlan
}

export function PhaseOctopus({ plan }: PhaseOctopusProps) {
  return (
    <section id="octopus" aria-labelledby="octopus-heading" className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <h2 id="octopus-heading" className="text-2xl text-[var(--text-bright)]">
          Nine-Phase Octopus
        </h2>
        <div className="font-mono text-xs text-[var(--text-muted)]">
          workerCap <span className="text-[var(--crimson)]">{plan.workerCap}</span>
          {' · '}
          depth {plan.decompositionDepth}
          {' · '}
          teams {plan.useAgentTeams ? 'on' : 'off'}
        </div>
      </div>
      <div className="octopus-scroll">
        {plan.phases.map((p) => (
          <PhaseCard key={p.index} phase={p} />
        ))}
      </div>
    </section>
  )
}
