# CLAUDE.md — SpecSeed.io

## Mission
Build and maintain SpecSeed.io — a generator that turns one project objective into Claude Code and Codex-ready parallel agent execution packages.

## Operating doctrine
1. Read `SEED.md` before any session that touches core generator logic.
2. Explore before coding. Use the recon subagent at session start.
3. Collapse each phase into a `_mos/` artifact before moving on.
4. Keep implementation changes scoped. One wave at a time.
5. Run `npm run lint && npm run build` after every material change.

## Subagents
- @.claude/agents/recon.md — session-start inventory
- @.claude/agents/tester.md — post-wave lint + build verification
- @.claude/agents/reviewer.md — final read-only review before ship

## Build commands
```bash
npm install
npm run dev
npm run lint
npm run build      # → ./out/ (static export)
```

## File ownership
- `app/` — routes, layout, `globals.css`, `styles/` fleet CSS copies
- `components/` — UI only, no business logic
- `lib/` — pure generator functions, deterministic, no I/O
- `_mos/` — build artifact documentation (committed; audit trail)
- `_theme/` — fleet palette + component CSS staging (committed)
- `public/` — static assets (robots, sitemap, og-image)
- `docs/` — product + phase-octopus reference docs
- `.claude/` + `.codex/` — agent adapter files (canonical examples)

## References
- @docs/specseed-product.md
- @docs/phase-octopus.md
- @SEED.md
- @_mos/03-architecture.md  — binding architecture contract

## Verification
Always run lint + build after material changes. Fix at root cause, not with `// @ts-ignore` or ESLint disables.

## Deploy
`./deploy.sh` runs `npm run build` and reloads nginx. nginx site config at `/etc/nginx/sites-available/specseed`; cert via certbot.

---

*CC-OPS-SPECSEED*
