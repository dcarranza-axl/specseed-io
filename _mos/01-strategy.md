# 01-strategy.md — SpecSeed.io Constraint Contract

**Authored:** 2026-04-21 13:32 UTC
**Author:** CC-OPS-SPECSEED root orchestrator (Opus 4.7)
**Status:** Binding for Phase 2+. Any deviation must be documented in a later collapse artifact.

---

## 1. Stack — LOCKED

- **Next.js 14 App Router** via `create-next-app@latest` (accept whatever 14.x stable ships). App Router only; no `pages/` directory.
- **TypeScript strict** (`"strict": true` in tsconfig).
- **Tailwind CSS 3** utilities + fleet CSS variables from `_theme/palette.css`.
- **React 18** (comes with Next 14).
- No Redux, no Zustand, no React Query, no Axios, no Prisma, no database, no API routes, no serverless functions. MVP is pure client-side static.

**Rejected alternatives:**
- Astro — viable but the PhaseOctopus + live generator need React islands anyway; full Next keeps the dev loop simpler.
- Vite + React SPA — loses static route generation for `/playground/`; we'd have to hand-roll.
- Next.js 15+ — create-next-app@latest will likely be 15 in 2026; if it is, that's acceptable for static export (`output: 'export'` is stable in 14+). Only constraint: no deps that require Node server runtime at request time.

## 2. Export mode — `output: 'export'` (non-negotiable)

nginx on TOR1 serves static files from `/var/www/specseed-io/out/`. No server-side runtime.

**`next.config.ts` must contain:**
```ts
output: 'export'
trailingSlash: true      // /playground/ resolves to /playground/index.html
distDir: 'out'           // nginx root
images: { unoptimized: true }   // no Image Optimization API in export mode
```

**Write `next.config.ts` BEFORE `create-next-app` runs** — the init generates its own, which would overwrite ours. Actual order: init first, then immediately overwrite `next.config.ts` before `npm run build` is ever called.

## 3. Routing plan

| Route | File | Contents |
|-------|------|----------|
| `/` | `app/page.tsx` | Hero → Generator → PhaseOctopus → HowItWorks → ArtifactTabs → Footer |
| `/playground/` | `app/playground/page.tsx` | Full-screen Generator, no other sections |
| `/robots.txt` | `public/robots.txt` | Allow all |
| `/sitemap.xml` | `public/sitemap.xml` | `/` + `/playground/` |
| `/og-image.png` | `public/og-image.png` | Static placeholder (Phase 8) |

Hash anchors on `/`: `#generator`, `#octopus`, `#how`, `#artifacts`, `#footer`.

Both real routes must be static-exportable — no dynamic segments, no server-only data fetching.

## 4. Generator architecture

**Pure TypeScript template functions. Synchronous. Deterministic. No network, no LLM.**

- All generator functions in `lib/` live as pure named exports.
- Top-level `compileFullSeed(input: SeedInput): GeneratedSeed` calls all sub-generators and returns the full artifact bundle.
- Calls happen inside a `useMemo` in `SeedGenerator.tsx` keyed on the form state object.
- No debounce for MVP — generator is fast enough (< 5 ms for the full bundle, it's string concatenation).

Wave algorithm (`lib/wavePlan.ts`) implements the MOS Section 4 canonical formulas exactly:
```ts
scopeBase       = { tiny:1, small:2, medium:4, large:6, platform:8 }
parallelismBoost= { conservative:-1, balanced:0, aggressive:2 }
riskBoost       = { low:0, medium:1, high:2 }
workerCap       = clamp(1, 12, scopeBase + parallelismBoost + riskBoost)
```

## 5. State management

`useState` only. Single source of truth is `SeedInput` in `SeedGenerator.tsx`. Preview tab state + active tab index are separate local state. No Context provider, no global store.

## 6. Styling — fleet brutalist concrete + crimson

- Fleet `palette.css` copied into `app/styles/palette.css` (or imported via `globals.css`).
- Fleet component CSS (`buttons.css`, `cards.css`, `forms.css`, `navigation.css`) copied into `app/styles/components/` and `@import`'d from `globals.css`.
- Tailwind extended colors:
  ```ts
  colors: {
    concrete: { 900:'#0a0a0a', 800:'#1f1f1f', 700:'#3a3a3a', 500:'#525252',
                400:'#707070', 300:'#8a8a8a', 200:'#c4c4c4', 100:'#e0e0e0', 50:'#f5f5f5' },
    crimson: { DEFAULT:'#dc143c', dark:'#a00f2f' }
  }
  ```
- Class naming: prefer raw fleet classes (`.btn-primary`, `.card-brick`, `.nav-link`) for canonical brutalist idioms; Tailwind for layout and responsive (`grid`, `flex`, `md:`, `lg:`).
- No CSS-in-JS. No styled-components. No Emotion.
- Radius is `0` everywhere except `--radius-sharp: 2px` on deliberate cases.

## 7. Animation

**Framer Motion only** — and sparingly.

- `PhaseOctopus` card hover: fan-out SVG lines via `AnimatePresence` + `motion.path`.
- Page load: staggered fade-in (`staggerChildren: 0.08`) on phase cards and form groups.
- Form → preview update: 100 ms 50% opacity fade-out/in on the preview pane.
- No infinite loops. No parallax.
- Hero background "code scroll": pure CSS `@keyframes`, no JS, no Framer.

## 8. Fonts

`next/font/google` — built-in, no external deps, type-safe, self-hosted on the CDN edge.

```ts
import { Inter, IBM_Plex_Mono } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-mono' })
```

Applied on `<html>` via `${inter.variable} ${ibmPlexMono.variable}`. Body uses `--font-body`, headings + code + buttons use `--font-mono`.

## 9. Download mechanisms

**SEED.md single download:**
```ts
const blob = new Blob([seedMd], { type: 'text/markdown' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `SEED-${slug}.md`
a.click()
URL.revokeObjectURL(url)
```

**Adapter Pack ZIP:**
- Dependency: `jszip` (install in Phase 4).
- Build the ZIP client-side on button click (not pre-rendered).
- Structure per MOS Section "Build Group B":
  ```
  specseed-output/
    SEED.md
    CLAUDE.md
    AGENTS.md
    .claude/agents/{reviewer,recon,tester}.md
    .codex/config.toml
    .codex/agents/{reviewer,worker}.toml
    macos-setup.sh
    ubuntu-bootstrap.md
  ```
  That's **10 files** matching the DoD count.

## 10. Copy-to-clipboard

`navigator.clipboard.writeText(text)` as primary path. Fallback: offscreen `<textarea>` + `document.execCommand('copy')` for older browsers. Both wrapped in a single `copyToClipboard(text)` helper in `lib/clipboard.ts`.

## 11. Images

**Zero remote images.** All visual assets are:
- CSS-drawn (dot grid, borders, shadows)
- Inline SVG (icons in `HowItWorks`, nav, octopus fan-out lines)
- One static `og-image.png` in `public/` (generated Phase 8 — 1200x630, can be a simple concrete+crimson wordmark)

No `next/image` with remote sources. If `next/image` is used at all, only with local `public/` paths and `unoptimized: true` from the config.

## 12. Dependencies — final list

**From `create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"`:**

Note — MOS's bootstrap command included `--src-dir` and `--no-import-alias`, but MOS Section 3's file tree places `app/`, `components/`, `lib/` at project root (no `src/`). Tree wins — dropping `--src-dir`, keeping the `@/*` path alias for clean cross-directory imports (`@/lib/generateSeed`, `@/components/Hero`).

Dependencies installed by the init:
- next, react, react-dom
- typescript, @types/node, @types/react, @types/react-dom
- tailwindcss, postcss, autoprefixer
- eslint, eslint-config-next

**Added explicitly:**
- `framer-motion` — octopus animations
- `clsx` — conditional class composition
- `jszip` — adapter pack ZIP

**Not adding:**
- No marked / react-markdown — MarkdownPreview is `<pre>` styled, no rendering. Copy/download ships the raw `.md`.
- No prismjs / highlight.js — syntax highlighting is minimal CSS-class-based per MOS.
- No axios / swr / react-query — no network calls.
- No zod at runtime — type safety via TypeScript alone; zod schema in `lib/seedSchema.ts` is optional doc-only (we skip it for MVP to reduce bundle).
- No react-hook-form — controlled `useState` inputs are fine for this form size.
- No next-sitemap — the two-route sitemap is trivially static.

## 13. Deployment target

`/var/www/specseed-io/out/` — nginx serves directly. The `next export` build writes here via `distDir: 'out'`. Deploy script is `./deploy.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/specseed-io
npm run build            # emits to ./out/
# nginx already points at ./out/ — no copy needed
sudo systemctl reload nginx
```

nginx site config + certbot SSL are in Phase 10 (post-integration) and require an explicit destruct checkpoint before enabling the site + requesting cert.

## 14. Adaptations from MOS baseline

| MOS said | We're doing | Why |
|----------|-------------|-----|
| Fetch `_theme/theme-ref.json` from `theme.axlprotocol.org` | Use fleet template `/opt/fleet-template/design/` directly | Operator directive "adapt"; fleet bundle is the canonical theme source |
| Gradient palette with gold/cyan/green/orange/purple accents | Fleet brutalist concrete + crimson (monochrome accent) | Fleet template supersedes MOS fallback |
| `Syne` / `DM Sans` / `JetBrains Mono` | `IBM Plex Mono` (display+mono) + `Inter` (body) | Fleet tokens |
| Tier badges use green/cyan/purple | Haiku=ghost, Sonnet=outline, Opus=crimson fill | Monochromatic discipline |
| Callsign `CC-OPS-SPECSEED` | Confirmed — signature footer `*CC-OPS-SPECSEED*` on responses | Fleet convention, MOS cover page |
| Hostname `specseed` | Actual hostname is `lalord` — not renaming | Out of scope for web build; renaming the box is a separate operation |
| `Tiny / small / medium / large / platform` scope | Unchanged | MOS canonical |

## 15. Phase 2+3 parallelism plan

4 Opus subagents fanned out in parallel:

1. **Decompose-A** (Phase 2 Worker A): Frontend component inventory, build groups, dep graph.
2. **Decompose-B** (Phase 2 Worker B): Library function inventory, signatures, consumers.
3. **Architect-A** (Phase 3 Worker A): Full file tree + TypeScript interfaces (seedSchema).
4. **Architect-B** (Phase 3 Worker B): Function signature contracts + default prop values + build-order constraints.

Root orchestrator (me) collapses into `_mos/02-decomposition.md` and `_mos/03-architecture.md`.

Each subagent gets a self-contained prompt with: strategy excerpt, theme constraints, its specific assignment, output file path, and a "return structured markdown" directive.

Phase 4 Build fans out Sonnet workers once Phase 3 is merged.

---

## Definition of "Phase 1 done"

- [x] Stack locked (Next.js 14 App Router + TS strict + Tailwind)
- [x] Export mode decided (`output: 'export'`)
- [x] `next.config.ts` requirements documented
- [x] Generator architecture — pure TS, synchronous, client-side
- [x] State mgmt — useState only
- [x] Styling — fleet palette + components via globals.css + Tailwind extend
- [x] Animation — Framer Motion + CSS only
- [x] Fonts — next/font/google Inter + IBM_Plex_Mono
- [x] Download — Blob + URL.createObjectURL + JSZip for adapter pack
- [x] Copy — navigator.clipboard + textarea fallback
- [x] Images — zero remote, inline SVG + one static og-image
- [x] Deps list final
- [x] Deploy path defined

**READY for Phase 2 fan-out.**

---

*CC-OPS-SPECSEED*
