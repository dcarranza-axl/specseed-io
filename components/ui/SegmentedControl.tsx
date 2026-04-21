'use client'

import { clsx } from 'clsx'

interface SegmentedControlProps {
  name: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (next: string) => void
  className?: string
}

export function SegmentedControl({ name, value, options, onChange, className }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={name} className={clsx('segmented', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            className={clsx('segmented-option', active && 'active')}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
