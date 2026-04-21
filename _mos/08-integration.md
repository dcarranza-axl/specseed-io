# 08-integration.md — Phase 8 Integration + Launch Prep

**Authored:** 2026-04-21 16:25 UTC
**Author:** CC-OPS-SPECSEED root orchestrator (Opus 4.7)

---

## Work completed in Phase 8

1. **`og-image.png` references removed** from `app/layout.tsx` Open Graph + Twitter metadata (avoid 404). Twitter card downgraded from `summary_large_image` to `summary`. Follow-up P1: generate a real 1200×630 crimson+mono card and restore refs.
2. **`docs/specseed-product.md`** written — product positioning, outputs, algorithm, non-goals, audience.
3. **`docs/phase-octopus.md`** written — 9-phase table, operating principle, fan-out/collapse, worker math, audit-trail semantics.
4. **Final `npm run build`** confirmed green after the metadata tweak. 4 static pages emitted.

## Launch-readiness verdict

**GO for deployment.** Build is clean. Out/ directory is ready for nginx to serve from `/var/www/specseed-io/out/`.

## Deviations recorded in `_mos/07-review.md`

See `07-review.md` for the full list. Non-blocking P1/P2 items deferred to v0.2.

## Final file tree delta from init

Created files in `/var/www/specseed-io/`:
- `lib/` — 17 source files
- `components/` — 9 top-level TSX + 6 UI primitives
- `app/` — layout, page, playground/page, globals.css, styles/{palette + 10 components}
- `public/` — robots.txt, sitemap.xml, favicon.svg (og-image deferred)
- `docs/` — specseed-product.md, phase-octopus.md
- `.claude/` — settings.json, agents/{recon,tester,reviewer}.md
- `.codex/` — config.toml, agents/{reviewer,worker}.toml
- Root: `CLAUDE.md`, `AGENTS.md`, `README.md`, `deploy.sh` (+x), updated `next.config.ts`, updated `.gitignore`
- `_mos/` — 13 artifacts (including this one)
- `_theme/` — fleet palette + components (staged)

## Total file count

- `/var/www/specseed-io/**` excluding `node_modules`, `.next`, `out`: ~60 source/doc/config files
- `/var/www/specseed-io/out/`: 1.6 MB static export, ready to deploy

## Next phase: deploy

Deploy requires operator confirmation per fleet consent + destruct rules. Specifically:
- Write nginx site config to `/etc/nginx/sites-available/specseed`
- `sudo ln -s` into `sites-enabled/`
- `sudo nginx -t && sudo systemctl reload nginx`
- `sudo certbot --nginx -d specseed.io -d www.specseed.io`

The orchestrator will present a checkpoint before executing any of these.

---

*CC-OPS-SPECSEED*
