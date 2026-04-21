/** Filesystem-safe kebab-case slug. Empty-after-cleanup falls back to "specseed". */
export function slugify(s: string): string {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'specseed'
}

/** Join lines with `\n`, dropping falsy entries (false/null/undefined/'' — preserves intentional blanks as '\n'). */
export function joinLines(lines: ReadonlyArray<string | false | null | undefined>): string {
  return lines.filter((l): l is string => typeof l === 'string').join('\n')
}

/** Indent every non-empty line of `s` by `n` spaces. */
export function indent(s: string, n = 2): string {
  const pad = ' '.repeat(n)
  return s
    .split('\n')
    .map((line) => (line.length === 0 ? line : pad + line))
    .join('\n')
}

export function repeat(s: string, n: number): string {
  return s.repeat(Math.max(0, n))
}

/** Build a GitHub-flavored-markdown pipe table with padded columns. */
export function markdownTable(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)),
  )
  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))
  const headerRow = `| ${headers.map((h, i) => pad(h, widths[i] ?? h.length)).join(' | ')} |`
  const sepRow = `| ${widths.map((w) => '-'.repeat(Math.max(3, w))).join(' | ')} |`
  const bodyRows = rows.map(
    (r) => `| ${headers.map((_, i) => pad(r[i] ?? '', widths[i] ?? 0)).join(' | ')} |`,
  )
  return [headerRow, sepRow, ...bodyRows].join('\n')
}

/** Wrap lines as `- item` bullets. */
export function bulletList(items: readonly string[], marker = '-'): string {
  return items.map((i) => `${marker} ${i}`).join('\n')
}

/** `## heading\n\nbody\n` */
export function section(heading: string, body: string): string {
  return `## ${heading}\n\n${body}\n`
}

/** Escape a YAML scalar. Wraps in double quotes if it contains : # leading -. */
export function escapeYaml(s: string): string {
  if (s.length === 0) return '""'
  const needsQuoting = /[:#]|^[-?!&*|>'"%@`]|^\s|\s$/.test(s)
  if (!needsQuoting) return s
  const escaped = s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

/** Escape a TOML string scalar (double-quoted form). */
export function tomlString(s: string): string {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
  return `"${escaped}"`
}
