import type { SeedInput } from './seedSchema'

export const SHARE_PARAM = 's'

const REQUIRED_KEYS: ReadonlyArray<keyof SeedInput> = [
  'projectName', 'objective', 'projectType', 'agentPlatform',
  'environment', 'scope', 'risk', 'parallelism', 'outputStyle',
  'deploymentTarget', 'constraints', 'repoNotes',
]

/** URL-safe base64 (no padding, no + /). */
function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): string {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/** Encode SeedInput to a compact URL-safe string. */
export function encodeSeedInput(input: SeedInput): string {
  return b64urlEncode(JSON.stringify(input))
}

/** Decode a URL param string back to SeedInput, or null on failure. */
export function decodeSeedInput(encoded: string): SeedInput | null {
  try {
    const parsed = JSON.parse(b64urlDecode(encoded)) as Record<string, unknown>
    for (const k of REQUIRED_KEYS) {
      if (typeof parsed[k] !== 'string') return null
    }
    return parsed as unknown as SeedInput
  } catch {
    return null
  }
}

/** Build a shareable URL for the current input. */
export function buildShareUrl(input: SeedInput, origin?: string): string {
  const base =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://specseed.io')
  return `${base}/?${SHARE_PARAM}=${encodeSeedInput(input)}#generator`
}

/** Read the share param from the current window URL. Returns null on SSR or missing. */
export function readShareFromLocation(): SeedInput | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(SHARE_PARAM)
  if (!raw) return null
  return decodeSeedInput(raw)
}
