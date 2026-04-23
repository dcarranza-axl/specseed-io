/**
 * Client-side GitHub star verification.
 *
 * Uses the public unauthenticated endpoint:
 *   GET https://api.github.com/users/{user}/starred/{owner}/{repo}
 *     → 204 : user has starred
 *     → 404 : user has NOT starred (or user/repo doesn't exist)
 *
 * Rate limit: 60 req/hr/IP unauthenticated — fine for MVP.
 *
 * Verification result is cached in localStorage; once a user on this device
 * has verified, downloads unlock for good on this device.
 */

export const STAR_REPO = { owner: 'dcarranza-axl', repo: 'specseed-io' } as const

const STORAGE_KEY = 'specseed:starred'

export interface StarredState {
  verified: boolean
  user?: string
  verifiedAt?: string
}

export function starGithubUrl(): string {
  return `https://github.com/${STAR_REPO.owner}/${STAR_REPO.repo}`
}

export async function checkStarred(username: string): Promise<boolean> {
  const u = username.trim().replace(/^@/, '')
  if (!u || !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(u)) return false
  const url = `https://api.github.com/users/${encodeURIComponent(u)}/starred/${STAR_REPO.owner}/${STAR_REPO.repo}`
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
    })
    return res.status === 204
  } catch {
    return false
  }
}

export function getStarredState(): StarredState {
  if (typeof localStorage === 'undefined') return { verified: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { verified: false }
    const parsed = JSON.parse(raw) as StarredState
    return parsed.verified ? parsed : { verified: false }
  } catch {
    return { verified: false }
  }
}

export function setStarredState(user: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ verified: true, user: user.trim(), verifiedAt: new Date().toISOString() }),
  )
}

export function clearStarredState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
