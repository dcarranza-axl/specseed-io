import type { GeneratedSeed } from './seedSchema'

/** Trigger a browser download. No-op on SSR. */
export function downloadFile(
  filename: string,
  content: string | Blob,
  mime: string = 'application/octet-stream',
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Build the adapter-pack ZIP and trigger a download. Lazy-imports JSZip. */
export async function downloadBundle(bundle: GeneratedSeed, projectSlug: string): Promise<void> {
  const { buildAdapterZip } = await import('./buildAdapterZip')
  const blob = await buildAdapterZip(bundle)
  downloadFile(`specseed-${projectSlug}.zip`, blob, 'application/zip')
}
