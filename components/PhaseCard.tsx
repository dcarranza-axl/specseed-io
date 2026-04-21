import type { PhaseSpec } from '@/lib/seedSchema'
import { TierBadge } from './ui/TierBadge'

interface PhaseCardProps {
  phase: PhaseSpec
  active?: boolean
}

export function PhaseCard({ phase }: PhaseCardProps) {
  return (
    <article className="card card-brick octopus-card">
      <div className="octopus-card-number">
        {String(phase.index).padStart(2, '0')}
      </div>
      <h3 className="octopus-card-name">{phase.name}</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <TierBadge tier={phase.model} />
        <span className="badge badge-sonnet" style={{ borderStyle: 'solid' }}>
          {phase.effort === 'high' ? 'HIGH' : 'DEF'}
        </span>
      </div>
      <div className="octopus-card-meta">
        <div>Duration · {phase.duration}</div>
        <div>Fan-out · {phase.fanOut}</div>
        <div>Workers · <strong className="text-[var(--crimson)]">{phase.workerCount}</strong></div>
      </div>
      <div className="octopus-card-artifact">{phase.artifact}</div>
    </article>
  )
}
