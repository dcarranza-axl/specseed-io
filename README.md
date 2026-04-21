# SpecSeed.io

Master orchestration seed generator. Turn one project objective into Claude Code and Codex-ready parallel agent execution packages.

Live: **https://specseed.io**

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Build the static site:

```bash
npm run build    # emits ./out/
```

## Deploy

The production target is an nginx static site at `/var/www/specseed-io/out/` on TOR1. Use:

```bash
./deploy.sh      # npm run build + systemctl reload nginx
```

## Structure

- `app/` — Next.js App Router
- `components/` — React components (primitives in `components/ui/`)
- `lib/` — pure TypeScript generator functions
- `_mos/` — nine-phase build artifacts (audit trail)
- `_theme/` — fleet brutalist palette + component CSS
- `.claude/` + `.codex/` — agent adapter files

## Docs

- [Architecture](_mos/03-architecture.md)
- [Product](docs/specseed-product.md) *(Phase 8)*
- [Phase Octopus](docs/phase-octopus.md) *(Phase 8)*

---

Built with Claude Code. CC-OPS-SPECSEED.
