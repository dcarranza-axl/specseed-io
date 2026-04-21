'use client'

import { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'

const LINKS = [
  { href: '/#generator', label: 'Generator' },
  { href: '/#octopus',   label: 'Octopus' },
  { href: '/#how',       label: 'How it works' },
  { href: '/playground/',label: 'Playground' },
]

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="nav" aria-label="Primary">
      <Link href="/" className="nav-brand">
        SpecSeed<span className="accent">.</span>io
      </Link>

      <ul className={clsx('nav-links', mobileOpen && 'open')}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <span className="nav-status online" aria-label="Live" />
        <button
          type="button"
          className="nav-hamburger focus-brick"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
