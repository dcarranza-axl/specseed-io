export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between text-sm">
        <div>
          <div className="font-mono uppercase tracking-wider text-base text-[var(--text-bright)]">
            SpecSeed<span className="accent">.io</span>
          </div>
          <div className="text-[var(--text-muted)] mt-1">
            Master orchestration seed — deterministic, client-side.
          </div>
        </div>
        <div className="flex gap-4 items-center text-[var(--text-muted)]">
          <a
            href="https://github.com/dcarranza-axl"
            rel="noopener noreferrer"
            target="_blank"
            className="nav-link"
          >
            GitHub
          </a>
          <span>·</span>
          <span>Built with Claude Code</span>
        </div>
      </div>
    </footer>
  )
}
