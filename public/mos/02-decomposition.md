# 02-decomposition.md — Decomposition Collapse

**Authored:** 2026-04-21 13:37 UTC
**Author:** CC-OPS-SPECSEED root orchestrator (Opus 4.7)
**Inputs:** `02-decompose-A.md` (Decomposer A — frontend), `02-decompose-B.md` (Decomposer B — library)
**Status:** Binding for Phase 3 (Architecture) and Phase 4 (Build).

This document is the orchestrator's collapse. Full per-worker reasoning lives in the two source files above. Flags raised by both workers are resolved here — the collapse is the source of truth when the source files conflict.

---

## 1. Component inventory — final

**13 components total**, organized as primitives (Group A) → composites (Group B) → page shells (Group C).

### Group A — primitives (6 in `components/ui/`)

| component | responsibility | consumes |
|---|---|---|
| `Button.tsx` | Fleet `.btn` wrapper with `variant` + `size` props. | — |
| `TabStrip.tsx` | Controlled tab rail; reused by both `ArtifactTabs` contexts. Includes `role="tablist"` + keyboard arrow nav. | — |
| `FormField.tsx` | Dispatcher — reads a `FormFieldSpec` and renders `TextInput` / `Textarea` / `Select` / `SegmentedControl` inline. Avoids 4 separate primitive components. | `SegmentedControl` |
| `SegmentedControl.tsx` | Brutalist segmented radio row (bespoke CSS). | — |
| `TierBadge.tsx` | Haiku/Sonnet/Opus pill using `TIER_BADGE_CLASS`. | — |
| `CodeBlock.tsx` | `<pre>` with mono font, crimson left border, scroll. | — |

### Group A-step-2 — leaf section components (5 at `components/` root)

| component | consumes |
|---|---|
| `Nav.tsx` | — (fleet classes only) |
| `Footer.tsx` | — |
| `HowItWorks.tsx` | — (inline SVGs) |
| `Hero.tsx` | `Button` |
| `PhaseCard.tsx` | `TierBadge` |

### Group B — composites (4 at `components/` root)

| component | consumes |
|---|---|
| `MarkdownPreview.tsx` | `CodeBlock` |
| `ArtifactTabs.tsx` | `TabStrip` + `MarkdownPreview` |
| `PhaseOctopus.tsx` | `PhaseCard` |
| `SeedGenerator.tsx` | `FormField`, `TabStrip`, `MarkdownPreview`, `Button` |

### Group C — pages (3 under `app/`)

| component | consumes |
|---|---|
| `app/layout.tsx` (RootLayout) | `next/font/google` — Inter + IBM_Plex_Mono → CSS vars |
| `app/page.tsx` (HomePage) | lifts `input` state; passes to `SeedGenerator` (controlled) + `PhaseOctopus` (read-only plan); all 7 sections composed |
| `app/playground/page.tsx` (PlaygroundPage) | `Nav` + `SeedGenerator fullBleed` + `Footer` only |

**Note on ArtifactTabs.** The landing page has ONE `ArtifactTabs` instance (`#artifacts` section) driven by a **precomputed** `compileFullSeed(DEFAULT_SEED_INPUT)` at module top-level — frozen brochure. The `SeedGenerator`'s live preview uses `MarkdownPreview` directly inside its right panel with a built-in `TabStrip`; it does NOT reuse `ArtifactTabs`. This simplifies data flow (no double indirection) and lets the landing section stay visually distinct from the interactive generator.

---

## 2. Dependency graph

```
app/layout.tsx
  └── next/font/google (Inter, IBM_Plex_Mono)
  └── app/globals.css → styles/palette.css + fleet/components + bespoke/components

app/page.tsx
  ├── Nav
  ├── Hero
  │     └── Button
  ├── SeedGenerator ────────── [input, setInput] lifted from HomePage
  │     ├── FormField (×12)
  │     │     └── SegmentedControl (for 4 fields)
  │     ├── TabStrip
  │     ├── MarkdownPreview
  │     │     └── CodeBlock
  │     └── Button (×4 actions)
  ├── PhaseOctopus ─────────── [plan derived from live input via useMemo]
  │     └── PhaseCard
  │           └── TierBadge
  ├── HowItWorks
  ├── ArtifactTabs ─────────── [precomputed DEFAULT_SEED_INPUT; not live]
  │     ├── TabStrip
  │     └── MarkdownPreview
  │           └── CodeBlock
  └── Footer

app/playground/page.tsx
  ├── Nav
  ├── SeedGenerator (fullBleed, same pattern — state local)
  └── Footer
```

**State lifting decision:** `HomePage` owns `[input, setInput]` via `useState(DEFAULT_SEED_INPUT)`. It passes both to `SeedGenerator` as a controlled prop and derives `plan` via `useMemo(() => buildWavePlan(input), [input])` for `PhaseOctopus`. On `/playground/`, `SeedGenerator` manages its own state internally (uncontrolled mode). This is still `useState`-only — no Context, no Redux (strategy compliant).

---

## 3. Library inventory — final (17 modules under `lib/`)

Reconciled from Decomposer B (14 modules) and Architect A (16 modules). Final list:

| file | exports | pure? |
|---|---|---|
| `seedSchema.ts` | Types (`SeedInput`, `WavePlan`, `PhaseSpec`, `GeneratedSeed`, literal unions, `ModelTier`, `AgentRole`) + `DEFAULT_SEED_INPUT` + tuple consts (`SCOPES`, `RISKS`, etc.) | types |
| `constants.ts` | Option arrays, `PHASE_TEMPLATE`, `TIER_BADGE_CLASS`, `AGENT_ROLES`, `SCOPE_BASE` / `PARALLELISM_BOOST` / `RISK_BOOST`, `WORKER_CAP_MIN/MAX` | yes |
| `formFields.ts` | `FormFieldSpec` type + `FORM_FIELDS` literal (12 items) | yes |
| `wavePlan.ts` | `workerCap`, `decompositionDepth`, `shouldUseAgentTeams`, `buildPhases`, `buildWavePlan` | yes |
| `helpers.ts` | `slugify`, `joinLines`, `markdownTable`, `bulletList`, `section`, `indent`, `repeat`, `escapeYaml`, `tomlString` | yes |
| `generateSeedSections.ts` | 11 per-section builders (`sectionObjective` … `sectionDefinitionOfDone`) | yes |
| `generateSeed.ts` | `generateSeed(input, plan): string` composer | yes |
| `generateClaudeMd.ts` | `generateClaudeMd`, `buildCommandsFor`, `fileOwnershipSummary` | yes |
| `generateAgentsMd.ts` | `generateAgentsMd`, `environmentNotes` | yes |
| `generateClaudeAgents.ts` | `generateClaudeAgent(name, input)` dispatching to `reviewer/recon/tester` bodies | yes |
| `generateCodexConfig.ts` | `generateCodexConfig()` (constant) + `generateCodexAgent(name)` | yes |
| `generateOsAdapters.ts` | `generateMacosSetup`, `generateUbuntuBootstrap` | yes |
| `compileFullSeed.ts` | `compileFullSeed(input): GeneratedSeed` | yes |
| `buildAdapterZip.ts` | `buildAdapterZip(bundle, slug): Promise<Blob>` — **lazy JSZip import** | pure-ish (builds ZIP; no I/O) |
| `downloadFile.ts` | `downloadFile(filename, content, mime?)` + `downloadBundle(bundle, slug): Promise<void>` | **impure** (DOM) |
| `clipboard.ts` | `copyToClipboard(text): Promise<boolean>` | **impure** (DOM) |
| `cx.ts` | Re-export `clsx` as `cx` | yes |

**Total exported public functions: ~38** (exact count in Architect-B §1).

### Determinism confirmed

Zero use of `Date.now`, `Math.random`, `crypto.randomUUID`, `process.env`, or any non-deterministic source in `lib/`. Every iteration order is over typed tuple literals from `constants.ts`. `compileFullSeed(input)` is byte-for-byte deterministic. Unit tests assert double-invocation byte-equality.

### Wave algorithm — full 45-cell table

Full enumeration lives in `_mos/02-decompose-B.md §5.1`. Summary:

- Clamp boundary fires exactly ONCE: `tiny + conservative + low` → raw 0 → clamp 1.
- Upper bound (12) hit exactly by `platform + aggressive + high` → raw 12 (no clamp change).
- **Demo default** (`medium + balanced + medium`) → `workerCap = 5`, `decompositionDepth = 2`, `useAgentTeams = false`.

---

## 4. Build groups — Phase 4 execution order

### Group A (foundation — lib + config + fleet CSS)

All parallelizable except the last two rows.

1. Parallel batch (all independent leaf modules):
   - `lib/seedSchema.ts`
   - `lib/constants.ts`
   - `lib/formFields.ts`
   - `lib/wavePlan.ts`
   - `lib/helpers.ts`
   - `lib/clipboard.ts`
   - `lib/downloadFile.ts`
   - `lib/cx.ts`
2. Parallel batch (depend only on schema + constants + helpers):
   - `lib/generateSeedSections.ts`
   - `lib/generateClaudeMd.ts`
   - `lib/generateAgentsMd.ts`
   - `lib/generateClaudeAgents.ts`
   - `lib/generateCodexConfig.ts`
   - `lib/generateOsAdapters.ts`
3. Serial:
   - `lib/generateSeed.ts` (needs `generateSeedSections`)
   - `lib/compileFullSeed.ts` (needs all generators)
   - `lib/buildAdapterZip.ts` (needs `GeneratedSeed` shape)
4. Config files (parallel, independent):
   - `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `package.json` (base emitted by `create-next-app` — we overwrite configs after init)
5. Styles (parallel):
   - Copy fleet CSS: `app/styles/palette.css`, `app/styles/components/{buttons,cards,forms,navigation}.css` (from `_theme/`)
   - Write bespoke CSS: `app/styles/components/{badges,segmented,tabs,code,hero,octopus}.css`
   - Write `app/globals.css` with the import order defined in `03-architecture.md`

### Group B — primitives then composites

1. Parallel (Group A-step-1 primitives): `Button`, `TabStrip`, `FormField`, `SegmentedControl`, `TierBadge`, `CodeBlock`
2. Parallel (Group A-step-2 leaf sections): `Nav`, `Footer`, `HowItWorks`, `Hero`, `PhaseCard`
3. Parallel (Group B composites): `MarkdownPreview`, `ArtifactTabs`, `PhaseOctopus`, `SeedGenerator` — but `SeedGenerator` must land after `MarkdownPreview` + `FormField`, and `ArtifactTabs` after `MarkdownPreview` + `TabStrip`. Sub-order: `MarkdownPreview` → `{ArtifactTabs, SeedGenerator, PhaseOctopus}` parallel.

### Group C — pages

1. `app/layout.tsx`
2. `app/page.tsx`
3. `app/playground/page.tsx`
All parallel once Group B is complete.

### Group D — agent + adapter + public files (parallel with A/B/C)

Pure repo-root artifacts. Do not touch the Next build graph.

1. `CLAUDE.md`, `AGENTS.md`
2. `.claude/settings.json`, `.claude/agents/{recon,tester,reviewer}.md`
3. `.codex/config.toml`, `.codex/agents/{reviewer,worker}.toml`
4. `public/robots.txt`, `public/sitemap.xml`, `public/og-image.png` (placeholder)
5. `deploy.sh`, `.gitignore`, `README.md`

`docs/specseed-product.md` + `docs/phase-octopus.md` are Phase 8 deliverables.

---

## 5. Fleet CSS class usage — summary

Fleet coverage is near-complete for forms, cards, nav, and buttons. **6 bespoke CSS modules are added** (`badges`, `segmented`, `tabs`, `code`, `hero`, `octopus`) — all additive, radius-0, crimson-only, ~350 lines total. Full per-component mapping in `_mos/02-decompose-A.md §4`.

---

## 6. Responsive breakpoints — final

| breakpoint | Tailwind prefix | use |
|---|---|---|
| `< 640px` | `max-sm:` | Nav hamburger (fleet), Octopus vertical stack, Generator single-column, Hero code-scroll hidden, ArtifactTabs horizontal scroll |
| `640–900px` | `sm:` | Single-column generator; Octopus horizontal scroll with snap |
| `≥ 900px` | custom `gen:` (`900px`) | Generator two-panel side-by-side (form left / preview right) |
| `≥ 1024px` | `lg:` | HowItWorks 7-across row; Hero headline scales up |
| `≥ 1280px` | `xl:` | Octopus — all 9 cards visible without scroll |

Custom breakpoint `gen: '900px'` added to `tailwind.config.ts` so we don't collide with the standard `md: 768px` meaning.

---

## 7. Animation plan — final

Framer Motion imported sparingly, scoped to 7 uses. All one-shot or hover-triggered, **zero infinite loops**. Exception: hero code-scroll background is pure CSS `@keyframes` (strategy-authorized infinite, no Framer). Full list in `_mos/02-decompose-A.md §6`.

**Accessibility**: `prefers-reduced-motion: reduce` is honored via a `@media` block in `app/globals.css` that disables the hero keyframe, plus Framer's built-in `useReducedMotion()` hook inside each component that uses `motion.*` — when true, animations collapse to immediate state changes.

---

## 8. Form fields — final 12 (ordered)

Matches seed-brief demo input defaults exactly. All labels mono-uppercase per fleet `.form-label`. Two `.form-row` pairs: (`scope`, `risk`) and (`parallelism`, `outputStyle`) render side-by-side on ≥640px, stacked on mobile.

| # | id | kind | label | default |
|---|---|---|---|---|
| 1 | `projectName` | text | `PROJECT NAME` | `SpecSeed.io` |
| 2 | `objective` | textarea(3) | `OBJECTIVE` | (see seed-brief) |
| 3 | `projectType` | select | `PROJECT TYPE` | `saas-app` |
| 4 | `agentPlatform` | segmented | `AGENT PLATFORM` | `both` |
| 5 | `environment` | segmented | `ENVIRONMENT` | `both` |
| 6 | `scope` | segmented | `SCOPE` | `medium` |
| 7 | `risk` | segmented | `RISK` | `medium` |
| 8 | `parallelism` | segmented | `PARALLELISM` | `balanced` |
| 9 | `outputStyle` | segmented | `OUTPUT STYLE` | `detailed` |
| 10 | `deploymentTarget` | select | `DEPLOYMENT TARGET` | `vercel` |
| 11 | `constraints` | textarea(3) | `CONSTRAINTS` | (see seed-brief) |
| 12 | `repoNotes` | textarea(3) | `REPO / STACK NOTES` | (see seed-brief) |

Note: I'm reconciling Decomposer A's decisions — `agentPlatform` becomes segmented (3 options, fits nicely), `scope` becomes segmented (5 options, still fits at 5-wide), matching the brutalist horizontal-row idiom. `projectType` and `deploymentTarget` stay as selects (6 and 5 options but visually better as dropdowns to avoid cramped rows).

---

## 9. Preview tabs — final 7

The `SeedGenerator` right-panel preview uses its own inline `TabStrip` over 7 tabs (NOT the `ArtifactTabs` composite — that's reserved for the landing page section).

| # | tab label | bundle key | language |
|---|---|---|---|
| 1 | `SEED.md` | `seedMd` | markdown |
| 2 | `CLAUDE.md` | `claudeMd` | markdown |
| 3 | `AGENTS.md` | `agentsMd` | markdown |
| 4 | `Claude Agents` | sub-tabs: `reviewerMd` / `reconMd` / `testerMd` | markdown |
| 5 | `Codex Agents` | sub-tabs: `configToml` / `reviewerToml` / `workerToml` | toml |
| 6 | `macOS` | `macosSetupSh` | bash |
| 7 | `Ubuntu` | `ubuntuBootstrapMd` | markdown |

Sub-tabs in tab 4 and 5 are a second `SegmentedControl` inline within the preview — terse and discoverable.

**Default active**: tab 1 (`SEED.md`). **Default sub-tab for tab 4**: `reviewer`. **For tab 5**: `config`.

---

## 10. Action buttons — final 4

Rendered in a `.form-actions`-style bar below the preview on `SeedGenerator`. Order: Copy, Download SEED, Download Pack, Reset.

| # | label | class | behavior |
|---|---|---|---|
| 1 | `Copy Markdown` | `.btn .btn-secondary` | Copies active tab content to clipboard. Inline "Copied" confirmation for 1.5s. |
| 2 | `Download SEED.md` | `.btn .btn-primary` | Blob → URL → anchor click → revoke. Filename: `SEED-${slug}.md`. |
| 3 | `Download Adapter Pack` | `.btn .btn-secondary` | Lazy-import JSZip → build bundle → download `specseed-${slug}.zip`. Shows `Building…` with `disabled` during the ~200ms JSZip load + generate. |
| 4 | `Reset to Demo` | `.btn .btn-ghost` | `setInput(DEFAULT_SEED_INPUT)`. No confirmation dialog. |

Slug derivation: `slugify(input.projectName)` → `"SpecSeed.io"` becomes `"specseed-io"`. Empty-after-cleanup falls back to `"specseed"`.

---

## 11. Flag resolutions

### From Decomposer A

1. **PhaseOctopus input source** → Lifted to `HomePage`. Live plan reflected in octopus worker counts.
2. **`#artifacts` section precomputed vs live** → Precomputed. Brochure mode. Uses `DEFAULT_SEED_INPUT`.
3. **Tab label casing** → Keep as-is: `SEED.md`, `CLAUDE.md`, `AGENTS.md` as filenames; `Claude Agents`, `Codex Agents`, `macOS`, `Ubuntu` as human names. Mild inconsistency with fleet all-caps idiom is acceptable — filenames *are* the brand.
4. **Hero code-scroll content** → SEED.md §5 (Nine-Phase Octopus) rendered as monospace text, scrolling vertically (not horizontally — easier to cram text in 240px-tall strip behind hero). Static content baked into `Hero.tsx` from `compileFullSeed(DEFAULT_SEED_INPUT).seedMd` extracted between the `## 5.` and `## 6.` markers.
5. **Copy scope** → Active tab only.
6. **`prefers-reduced-motion`** → Honored. `@media` block + `useReducedMotion()` usage.
7. **Nav scroll-spy** → Deferred. MVP uses anchor links only; `.nav-link.active` only applies to `/playground/`.
8. **Form pair layout** → (`scope`, `risk`) + (`parallelism`, `outputStyle`).
9. **Claude Agents default sub-tab** → `reviewer`.

### From Decomposer B

1. **`WavePlan` ownership** → Architect A wins. Field names: `workerCap`, `decompositionDepth`, `useAgentTeams`, `phases` (not `phaseSchedule`). `PhaseSpec.workerCount` (not `.workers`).
2. **Codex `max_threads`** → Constant `6` per seed-brief canonical. NOT scaled with `workerCap`. Seed-brief wins over "clever" scaling.
3. **`buildCommandsFor(projectType, deploymentTarget)` matrix** → Use a minimal pragmatic lookup:
   - `saas-app` + any → `npm install && npm run dev` + `npm run build`
   - `docs-site` + any → same
   - `landing-page` + `static` / `vercel` / `ubuntu-vps` → `npm install && npm run build && npm run export` (if applicable) — but for our own MVP the command is `npm install && npm run build`
   - `dashboard` / `full-stack-app` → `npm install && npm run build && npm start`
   - `api` + any → `npm install && npm start`
   Default fallback: `npm install && npm run build`. One helper function, ~25 lines.
4. **ZIP top-level folder name** → Hardcoded `specseed-output/` per seed-brief.
5. **`fileOwnershipFor(projectType)`** → Simple 3-bullet description per projectType. Not exhaustive.
6. **ZIP folder varies per project?** → No. Always `specseed-output/`. User renames downloaded zip if they want.
7. **Tester agent model** → `sonnet`. No version qualifier.
8. **YAML `tools` syntax** → Comma-separated inline (`tools: Read, Grep, Glob`). Matches Claude Code docs convention.

### From Architect B

1. **JSZip eager vs lazy** → **Lazy**. 30 KB savings on initial load. `downloadBundle` dynamically imports.
2. **`clsx` keep or drop** → Keep. ~0.5 KB for real ergonomic wins.
3. **`useCallback` on `onFieldChange`** → Skip. Measurements first, optimization later.
4. **`toSlug` empty fallback** → `"specseed"`.
5. **Phases 2 and 3 worker counts** → Confirmed `2` each (Decomposer A/B and Architect A/B fanouts). Only Phase 4 scales with `workerCap`.
6. **11 `##` headings in SEED.md** → Confirmed. Seed-brief wins.
7. **`generateCodexConfig()` constant** → Constant. No input parameter.
8. **Field naming** → Architect A's names win. `seedMd`, `claudeMd`, `agentsMd`, `claudeAgents`, `codexAgents`, `codexConfig`, `macosSetup`, `ubuntuBootstrap`. Plus `slug` and `plan` on the bundle for convenience (A's addition).
9. **Claude agent tools** →
   - `reviewer` — `Read, Grep, Glob`
   - `recon` — `Read, Grep, Glob, Bash`
   - `tester` — `Read, Bash, Edit`
10. **CLAUDE.md line cap** → Hard cap enforced: `result.split('\n').length < 200`. Emit a unit-test-style assertion in `generateClaudeMd` (dev-mode console.warn if exceeded — production build doesn't crash).

---

## 12. Signals for Phase 3 Architecture collapse

Architect A + B both ran in parallel and produced aligned-but-not-identical outputs. Phase 3 collapse (next section / `_mos/03-architecture.md`) reconciles them. High-level:

- Architect A: complete file tree, `seedSchema.ts`, `constants.ts`, `formFields.ts`, configs, Tailwind extend, prop interfaces.
- Architect B: function signatures, pre/postconditions, data flow, JSZip structure, clipboard/download contracts, static-export audit, 10 Phase-5 Wire checks.

Conflicts: minor naming (`phases` vs `phaseSchedule`) — resolved above. No hard conflicts.

Next: write `_mos/03-architecture.md` as the final binding contract for Phase 4.

---

*CC-OPS-SPECSEED — Root collapse of Phase 2*
