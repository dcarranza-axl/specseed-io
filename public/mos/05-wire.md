# 05-wire.md — Wiring Verification

**Authored:** 2026-04-21 16:22 UTC
**Author:** CC-OPS-SPECSEED root orchestrator (Opus 4.7)

---

## Integration checks

| # | Check | Result |
|---|---|---|
| 1 | `app/page.tsx` imports all 7 section components | PASS |
| 2 | `app/page.tsx` lifts `[input, setInput]` and passes to `SeedGenerator` (controlled) and `plan` to `PhaseOctopus` | PASS |
| 3 | `SeedGenerator` supports both controlled + uncontrolled modes (playground is uncontrolled) | PASS |
| 4 | `compileFullSeed` imported in `SeedGenerator` via `useMemo([input])` | PASS |
| 5 | `DEFAULT_SEED_INPUT` exported from `@/lib/seedSchema`, imported where needed | PASS |
| 6 | `PhaseOctopus` receives `plan: WavePlan` prop; renders 9 cards with live `workerCount` | PASS |
| 7 | `ArtifactTabs` renders precomputed `compileFullSeed(DEFAULT_SEED_INPUT)` — landing brochure | PASS |
| 8 | `next.config.ts` has `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true` | PASS |
| 9 | `tsconfig.json` has `"strict": true` + `@/*` path alias | PASS |
| 10 | `app/globals.css` imports fleet palette + fleet components + bespoke components + Tailwind base/components/utilities | PASS (via Tailwind v4 `@import "tailwindcss"` + fleet @import order) |
| 11 | `next/font/google` loads Inter + IBM_Plex_Mono with variables `--font-body`, `--font-mono` | PASS |
| 12 | No server-only APIs used (no `headers()`, `cookies()`, `searchParams`, no route handlers, no middleware) | PASS |
| 13 | All client-interactive components have `'use client'` directive | PASS |
| 14 | JSZip lazy-imported in `downloadFile.ts → downloadBundle` | PASS |
| 15 | Nav anchors to `#generator`, `#octopus`, `#how`, `/playground/` | PASS |

## Notes

- Framer Motion is in `dependencies` but not yet imported — kept as forward option for Phase 8 polish (e.g. page-load stagger). Phase 7 review should decide whether to keep or remove the dep.
- TypeScript: one NextConfig key (`eslint`) was removed between Next 14 (Architect A's reference) and Next 16.2.4 (actual install). Edit applied.
- ESLint: one unused-import warning (`Button` in Hero.tsx) — fixed by removing the import after we decided to use raw `<Link>` with fleet `.btn` classes for hero CTAs.
- All 17 `lib/` modules compile clean under strict TS.
- All 15 components compile clean.
- Both pages (`/`, `/playground/`) compile clean.

## Static export compatibility

Confirmed in Phase 6 build — 4 static pages generated (`/`, `/_not-found`, `/playground/`, and the 404 shell). No server-runtime dependencies. Build output at `/var/www/specseed-io/out/` is ready for nginx to serve.

---

*CC-OPS-SPECSEED*
