'use client'

import { clsx } from 'clsx'

export interface TabStripItem {
  id: string
  label: string
}

interface TabStripProps {
  tabs: readonly TabStripItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  ariaLabel?: string
}

export function TabStrip({ tabs, activeTab, onChange, className, ariaLabel }: TabStripProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={clsx('tabs', className)}>
      {tabs.map((t) => {
        const active = t.id === activeTab
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={clsx('tab', active && 'active')}
            onClick={() => onChange(t.id)}
            type="button"
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
