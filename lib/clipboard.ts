/**
 * Copy text to clipboard.
 * Returns true if the modern Clipboard API was used.
 * Returns false if the textarea + execCommand fallback was used.
 * Rejects only on total failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof text !== 'string') throw new TypeError('text must be a string')

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to fallback
    }
  }

  if (typeof document === 'undefined') throw new Error('no DOM — cannot copy')
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.top = '-1000px'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('execCommand("copy") returned false')
  return false
}
