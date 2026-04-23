'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  STAR_REPO,
  checkStarred,
  setStarredState,
  starGithubUrl,
} from '@/lib/githubStar'
import { Button } from './Button'

interface StarGateProps {
  open: boolean
  onClose: () => void
  onVerified: () => void
}

type VerifyStatus = 'idle' | 'checking' | 'ok' | 'not-starred' | 'bad-username'

export function StarGate({ open, onClose, onVerified }: StarGateProps) {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputId = useId()

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  async function verify() {
    const clean = username.trim().replace(/^@/, '')
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(clean)) {
      setStatus('bad-username')
      return
    }
    setStatus('checking')
    const ok = await checkStarred(clean)
    if (ok) {
      setStatus('ok')
      setStarredState(clean)
      setTimeout(() => {
        onVerified()
        onClose()
      }, 700)
    } else {
      setStatus('not-starred')
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      verify()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className="p-0 bg-transparent w-full max-w-lg backdrop:bg-black/70"
    >
      <div className="card card-brick p-6 space-y-4" style={{ borderColor: 'var(--crimson)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[var(--crimson)]">
              Gate
            </div>
            <h3 className="text-xl text-[var(--text-bright)] mt-1">Unlock downloads</h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          SpecSeed is free. It runs on your star. One star per device, lifetime unlock —
          no account, no tracking, no email.
        </p>

        <ol className="text-sm space-y-2 text-[var(--text)]">
          <li>
            <span className="inline-block w-5 text-[var(--crimson)] font-mono">1.</span>
            <a
              href={starGithubUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--crimson)] underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >
              Star {STAR_REPO.owner}/{STAR_REPO.repo} on GitHub ↗
            </a>
          </li>
          <li>
            <span className="inline-block w-5 text-[var(--crimson)] font-mono">2.</span>
            Enter your GitHub username below and verify.
          </li>
        </ol>

        <div className="form-group">
          <label htmlFor={inputId} className="form-label">
            GitHub username
          </label>
          <input
            id={inputId}
            type="text"
            className="form-input focus-brick"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (status !== 'idle') setStatus('idle')
            }}
            onKeyDown={onKeyDown}
            placeholder="octocat"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        <div className="form-actions">
          <Button
            variant="primary"
            onClick={verify}
            disabled={!username.trim() || status === 'checking' || status === 'ok'}
          >
            {status === 'checking' ? 'Verifying…' : status === 'ok' ? 'Starred ✓' : 'Verify star'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Later
          </Button>
        </div>

        {status === 'not-starred' && (
          <div className="form-error">
            No star found for that username. Make sure you were logged in to GitHub when you
            clicked the link, then try again.
          </div>
        )}
        {status === 'bad-username' && (
          <div className="form-error">
            That doesn&apos;t look like a GitHub username. Letters, digits, and hyphens only.
          </div>
        )}

        <div className="text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
          Verified against the public GitHub API. No token stored on this device.
        </div>
      </div>
    </dialog>
  )
}
