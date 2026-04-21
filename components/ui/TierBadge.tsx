import type { ModelTier } from '@/lib/seedSchema'
import { clsx } from 'clsx'

const LABEL: Record<ModelTier, string> = {
  haiku: 'Haiku',
  sonnet: 'Sonnet',
  opus: 'Opus',
}

const CLASS: Record<ModelTier, string> = {
  haiku: 'badge badge-haiku',
  sonnet: 'badge badge-sonnet',
  opus: 'badge badge-opus',
}

export function TierBadge({ tier }: { tier: ModelTier }) {
  return <span className={clsx(CLASS[tier])}>{LABEL[tier]}</span>
}
