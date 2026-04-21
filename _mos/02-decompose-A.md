# 02-decompose-A.md — Frontend Component Decomposition (Phase 2, Worker A)

**Authored:** 2026-04-21
**Author:** Decomposer Worker A (Opus 4.7)
**Scope:** React/TSX component inventory, build groups, dependency graph, fleet CSS mapping, responsive + animation decisions. Library function inventory is Worker B's domain — I cite them by name only.
**Constraints honored:** `01-strategy.md` (static export, useState-only, brutalist concrete+crimson, radius-0, inline SVG, no remote images, framer-motion sparingly, IBM Plex Mono headings/buttons/code + Inter body).

---

## 1. Component inventory

All components are `'use client'` (static export + form interactivity). No server components fetch data at request time.

Legend: build groups A = primitive/leaf, B = composite (uses A), C = page shell.

| component | responsibility | props (TS-ish) | emits (callbacks) | internal useState | build group | lib functions consumed | other components consumed |
|---|---|---|---|---|---|---|---|
| **Button** | Fleet-class wrapper around `<button>` / `<a>` with size + variant. | `{ variant?: 'primary'\|'secondary'\|'ghost'\|'danger'; size?: 'sm'\|'md'\|'lg'; as?: 'button'\|'a'; href?: string; type?: 'button'\|'submit'; disabled?: boolean; onClick?: (e)=>void; children: ReactNode; className?: string }` | `onClick` | none | A | — | — |
| **Badge** | Tier / status pill (Haiku ghost / Sonnet outline / Opus fill). | `{ tier?: 'haiku'\|'sonnet'\|'opus'; tone?: 'default'\|'accent'\|'muted'; children: ReactNode }` | — | none | A | — | — |
| **SegmentedControl** | 2-to-5-option inline radio-style picker used for `parallelism`, `risk`, `outputStyle`, `environment`. | `{ name: string; value: string; options: {value:string; label:string}[]; onChange: (v:string)=>void; label?: string; hint?: string }` | `onChange(value)` | none | A | — | — |
| **Select** | Fleet `.form-select` wrapper with label + hint slot. | `{ id: string; label: string; value: string; options: {value:string; label:string}[]; onChange: (v:string)=>void; hint?: string; required?: boolean }` | `onChange(value)` | none | A | — | — |
| **Textarea** | Fleet `.form-textarea` wrapper with label + hint + rows. | `{ id: string; label: string; value: string; onChange: (v:string)=>void; placeholder?: string; rows?: number; hint?: string; required?: boolean }` | `onChange(value)` | none | A | — | — |
| **TextInput** | Fleet `.form-input` single-line. | `{ id: string; label: string; value: string; onChange: (v:string)=>void; placeholder?: string; hint?: string; required?: boolean }` | `onChange(value)` | none | A | — | — |
| **Tabs** | Rail of tab buttons + active content slot (imperative — children are `<Tabs.Panel id=...>`). Controlled. | `{ tabs: {id:string; label:string}[]; activeId: string; onChange: (id:string)=>void; children: ReactNode }` | `onChange(id)` | none (controlled) | A | — | — |
| **CodeBlock** | `<pre>` with mono font, scroll, crimson left border, line-wrap off. Optionally shows language label. | `{ code: string; language?: string; maxHeight?: string; className?: string }` | — | none | A | — | — |
| **PhaseCard** | Single phase card in the Octopus row. Shows phase number (crimson), name, model badge, fan-out count, duration, artifact filename. Hover emits fan-out SVG lines. | `{ phase: PhaseDescriptor; workerCount: number; active?: boolean; onHover?: (phaseNumber:number\|null)=>void }` | `onHover(phaseNumber)` | `isHover` (local boolean for SVG gate) | A | — (receives `PhaseDescriptor` built by lib) | `Badge` |
| **Nav** | Sticky top nav — brand `SpecSeed.io`, 4 anchor links (`#generator`, `#octopus`, `#how`, `#artifacts`), GitHub link. Hamburger below 640px. | `{ }` (no props; route-aware via `usePathname`) | — | `mobileOpen: boolean` | A | — | — |
| **Hero** | Full-bleed landing section. Headline (`From one objective to parallel agent execution.`), subhead, 2 CTAs (`Generate SEED.md` → `#generator`, `Open Playground` → `/playground/`). Animated dotted grid bg + horizontal code-scroll strip behind (CSS keyframes). | `{ }` | — | none | A | — | `Button` |
| **HowItWorks** | 7-step flow row (Intent → Seed → Dechunk → Parallel Waves → Collapse → Build → Verify). Each step: inline SVG icon, number, title, one-line description. | `{ }` (static content) | — | none | A | — | — |
| **Footer** | Project name, tagline, GitHub link, "Built with Claude Code" line. | `{ }` | — | none | A | — | — |
| **MarkdownPreview** | Scrollable `<pre>` that renders the currently-selected artifact string. No markdown parsing — raw text with fleet code-block styling. Includes loading/fade state for 100ms opacity transition. | `{ content: string; filename: string; language?: 'markdown'\|'toml'\|'bash' }` | — | none (content is derived) | B | — | `CodeBlock` |
| **ArtifactTabs** | 7-tab preview switcher **inside** `SeedGenerator`'s right panel. Tabs: SEED.md, CLAUDE.md, AGENTS.md, Claude Agents, Codex Agents, macOS, Ubuntu. Renders the selected content via `MarkdownPreview`. Note: this is the SAME component used by the landing-page precomputed "artifacts" section (`#artifacts`), but there it receives a fixed `GeneratedSeed` prop computed once at build time. | `{ generated: GeneratedSeed; defaultTabId?: string }` | — | `activeTabId: string` | B | — | `Tabs`, `MarkdownPreview` |
| **PhaseOctopus** | 9 `PhaseCard`s in a horizontal flex row, scrollable on narrow. Shows dynamic `workerCap` derived from current `SeedInput` (on landing page uses demo input; can be driven by live generator). SVG overlay draws fan-out lines from active card on hover. | `{ input: SeedInput }` | — | `hoveredPhase: number\|null` | B | `buildWavePlan`, `workerCap` (from `@/lib/wavePlan`) | `PhaseCard` |
| **SeedGenerator** | The center of gravity. Left: 12-field form. Right: `ArtifactTabs` preview + 4 action buttons. Recomputes on every input change via `useMemo(compileFullSeed, [input])`. | `{ variant?: 'embedded'\|'fullscreen'; initialInput?: SeedInput }` | — | `input: SeedInput`, `activeTabId: string`, `copyState: 'idle'\|'copied'`, `downloadState: 'idle'\|'building'` | B | `compileFullSeed`, `DEFAULT_SEED_INPUT`, `buildAdapterZip`, `copyToClipboard`, `downloadBlob` | `TextInput`, `Textarea`, `Select`, `SegmentedControl`, `ArtifactTabs`, `Button` |
| **HomePage** (`app/page.tsx`) | Landing composition: `Nav` → `Hero` → `SeedGenerator` (embedded, default input) → `PhaseOctopus` (driven by current generator input) → `HowItWorks` → `ArtifactTabs` (precomputed demo for `#artifacts`) → `Footer`. | (Next page) | — | (lifts `input` up ONLY if PhaseOctopus needs to reflect live form state — see flag below) | C | `DEFAULT_SEED_INPUT`, `compileFullSeed` (for precomputed artifacts section) | `Nav`, `Hero`, `SeedGenerator`, `PhaseOctopus`, `HowItWorks`, `ArtifactTabs`, `Footer` |
| **PlaygroundPage** (`app/playground/page.tsx`) | Full-screen: `Nav` + `SeedGenerator variant="fullscreen"` + `Footer`. No octopus, no hero. | (Next page) | — | none | C | `DEFAULT_SEED_INPUT` | `Nav`, `SeedGenerator`, `Footer` |
| **RootLayout** (`app/layout.tsx`) | Applies `Inter` + `IBM_Plex_Mono` font variables on `<html>`, imports `globals.css`, sets metadata, `<body>` class. | `{ children: ReactNode }` | — | none | C | — | — |

### Primitive extract-vs-inline recommendations

| primitive | recommendation | one-line reason |
|---|---|---|
| Button | **extract** | Used 10+ times (Hero, form actions, nav, playground); variant + size deserves a single source of truth. |
| Badge | **extract** | Tier badge (Haiku/Sonnet/Opus) appears on every PhaseCard plus inside preview; centralize tier→style logic. |
| SegmentedControl | **extract** | Used for 4 distinct fields in the form (parallelism/risk/outputStyle/environment); inlining 4× is copy-paste debt. |
| Select | **extract** | Used for 4 fields (projectType/agentPlatform/scope/deploymentTarget); wraps `.form-select` with label + hint in one place. |
| Textarea | **extract** | Used for 2 fields (objective, constraints, repoNotes — 3 actually); worth a tiny wrapper. |
| TextInput | **extract** | Used for projectName only — but pairs symmetrically with Textarea/Select and costs nothing. |
| Tabs | **extract** | Used twice (ArtifactTabs in generator + ArtifactTabs on landing section); a11y (`role="tablist"`, keyboard arrow nav) belongs in one place. |
| CodeBlock | **extract** | Preview pane + HowItWorks examples; handles scrolling + crimson left-border variant once. |
| PhaseCard | **extract** | 9 instances + hover animation logic; too much for inlining. |
| Nav | **extract** | Reused on both routes; mobile hamburger state lives here. |
| Hero | **extract** | One page-specific section but 100+ lines; keeps HomePage readable. |
| HowItWorks | **extract** | Self-contained 7-step diagram. |
| Footer | **extract** | Shared between both routes. |

No primitives recommended for inlining in MVP — fleet CSS handles the chrome; the TSX wrappers stay thin. The only things inlined into pages are small layout wrappers (section headers, anchor targets).

---

## 2. Build groups

Phase 4 proceeds A → B → C. Workers in the same group are independent and parallelizable.

### Group A (leaf primitives — no internal component deps)

1. `Button.tsx`
2. `Badge.tsx`
3. `SegmentedControl.tsx`
4. `Select.tsx`
5. `Textarea.tsx`
6. `TextInput.tsx`
7. `Tabs.tsx`
8. `CodeBlock.tsx`
9. `PhaseCard.tsx` (uses only `Badge` from A — still Group A because `Badge` is built before it within the group; formally A' but MOS-Phase-4 sonnets can build them in parallel as long as `Badge` lands first; call it Group A, step 2)
10. `Nav.tsx`
11. `Hero.tsx` (consumes `Button` — Group A step 2)
12. `HowItWorks.tsx`
13. `Footer.tsx`
14. `MarkdownPreview.tsx` (consumes `CodeBlock` — Group A step 2)

**Sub-ordering inside A:** step 1 = `Button, Badge, SegmentedControl, Select, Textarea, TextInput, Tabs, CodeBlock, Nav, HowItWorks, Footer` (fully independent). Step 2 = `PhaseCard (needs Badge), Hero (needs Button), MarkdownPreview (needs CodeBlock)`. Step 2 can start as soon as its dep exists; all three of step 2 are still parallel to each other.

### Group B (composites — depend on Group A)

1. `ArtifactTabs.tsx` — uses `Tabs` + `MarkdownPreview`.
2. `PhaseOctopus.tsx` — uses `PhaseCard`.
3. `SeedGenerator.tsx` — uses `TextInput, Textarea, Select, SegmentedControl, ArtifactTabs, Button`. (ArtifactTabs must land first → sub-order B step 2.)

**Sub-ordering inside B:** step 1 = `ArtifactTabs, PhaseOctopus` (parallel). Step 2 = `SeedGenerator`.

### Group C (page shells)

1. `app/layout.tsx` (RootLayout)
2. `app/page.tsx` (HomePage) — consumes all of B + A.
3. `app/playground/page.tsx` (PlaygroundPage)

All three can be built in parallel once B is done.

---

## 3. Dependency graph

```
app/layout.tsx ──────────────► globals.css
                               next/font (Inter, IBM_Plex_Mono)

app/page.tsx
  ├── Nav
  ├── Hero
  │     └── Button
  ├── SeedGenerator               [ uses @/lib/DEFAULT_SEED_INPUT, compileFullSeed ]
  │     ├── TextInput
  │     ├── Textarea
  │     ├── Select
  │     ├── SegmentedControl
  │     ├── Button
  │     └── ArtifactTabs          [ renders generated.seedMd, generated.claudeMd, ... ]
  │           ├── Tabs
  │           └── MarkdownPreview
  │                 └── CodeBlock
  ├── PhaseOctopus                [ uses @/lib/wavePlan → buildWavePlan, workerCap ]
  │     └── PhaseCard
  │           └── Badge
  ├── HowItWorks
  ├── ArtifactTabs  (second instance, precomputed — #artifacts section)
  │     ├── Tabs
  │     └── MarkdownPreview
  │           └── CodeBlock
  └── Footer

app/playground/page.tsx
  ├── Nav
  ├── SeedGenerator (variant="fullscreen")
  └── Footer
```

Lib consumers (names cited per strategy — Worker B owns signatures):

- `SeedGenerator` → `compileFullSeed(input: SeedInput): GeneratedSeed`, `DEFAULT_SEED_INPUT`, `buildAdapterZip(generated: GeneratedSeed, input: SeedInput): Promise<Blob>`, `copyToClipboard(text: string): Promise<boolean>`, `downloadBlob(blob: Blob, filename: string): void`.
- `PhaseOctopus` → `buildWavePlan(input: SeedInput): WavePlan`, `workerCap(scope, parallelism, risk): number`. `PhaseOctopus` receives `SeedInput` from its parent (page) — see flag #1 below on whether that's the live form state or the default.
- `HomePage` → `DEFAULT_SEED_INPUT` (for the precomputed landing-page `#artifacts` section) and `compileFullSeed(DEFAULT_SEED_INPUT)` evaluated at module top-level or inside `useMemo(..., [])` to avoid recomputation.

---

## 4. Fleet CSS class usage per component

| component | fleet classes consumed | bespoke CSS needed? |
|---|---|---|
| Button | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg` | none |
| Badge | none directly — bespoke mini-CSS: `.badge`, `.badge-haiku` (ghost, 1px dashed border), `.badge-sonnet` (1px solid concrete-200), `.badge-opus` (crimson fill, text-bright). | YES — small additive module `components/badges.css` (~40 lines). |
| SegmentedControl | `.form-group`, `.form-label`, `.form-hint`; bespoke `.segmented`, `.segmented-option`, `.segmented-option.active` (crimson underline, IBM Plex Mono, radius 0). | YES — `components/segmented.css` (~60 lines). |
| Select | `.form-group`, `.form-label`, `.form-select`, `.form-hint` | none |
| Textarea | `.form-group`, `.form-label`, `.form-textarea`, `.form-hint` | none |
| TextInput | `.form-group`, `.form-label`, `.form-input`, `.form-hint` | none |
| Tabs | bespoke `.tabs`, `.tab`, `.tab.active` (mono uppercase + crimson bottom-border mirroring `.nav-link` idiom) | YES — `components/tabs.css` (~50 lines) — deliberately reuses `.nav-link` visual vocabulary. |
| CodeBlock | bespoke `.code-block` (pre, bg `--concrete-900`, border `var(--border-hard)`, border-left `3px solid var(--crimson)`, mono, overflow auto). | YES — `components/code.css` (~40 lines). |
| PhaseCard | `.card`, `.card-brick`, `.card-accent` (crimson left border for active), `.card-header`, `.card-title`, `.card-value` | none for base; bespoke overlay for fan-out SVG lines (absolute-positioned `<svg>` sibling). |
| Nav | `.nav`, `.nav-brand`, `.nav-links`, `.nav-link`, `.nav-link.active`, `.nav-actions`, `.nav-hamburger`, `.nav-status.online` | none |
| Hero | mostly Tailwind layout + inline style for the animated dotted-grid (CSS bg `radial-gradient` + `@keyframes` scroll). Uses `Button` for CTAs. | YES — `components/hero.css` (~80 lines) for: dotted grid bg, horizontal code-scroll strip `@keyframes scroll-code`, gradient scrim to fade code scroll edges. |
| HowItWorks | `.card`, `.card-accent` on each step; inline SVGs | none |
| Footer | Tailwind layout + raw `<a>` (fleet palette already styles `a` with crimson hover) | none |
| MarkdownPreview | inherits `CodeBlock`; additionally a small `.preview-fade` class for the 100ms opacity transition on tab-switch | YES — tiny 10-line bespoke class in `components/code.css`. |
| ArtifactTabs | inherits `Tabs` + `MarkdownPreview` | none |
| PhaseOctopus | container: Tailwind `overflow-x-auto flex gap-4 snap-x`; bespoke `.octopus-row` for scroll-snap padding and `.octopus-fanout` absolute SVG overlay | YES — `components/octopus.css` (~70 lines): fan-out path styles, scroll-snap helpers, mobile vertical-stack rules, tentacle SVG stroke tokens. |
| SeedGenerator | `.card`, `.card-brick`, `.form-group`, `.form-row`, `.form-actions`; Tailwind grid for two-panel layout | none beyond what its children pull in |

### Summary of bespoke CSS modules to create (additive to fleet)

All go under `app/styles/components/` alongside the fleet copies. Total ~350 lines of additive brutalist CSS, all radius-0, all crimson-only accent.

1. `badges.css` — tier + tone badges.
2. `segmented.css` — segmented-control radio row.
3. `tabs.css` — reused by both ArtifactTabs contexts (visually mirrors nav-link underline).
4. `code.css` — code blocks + preview fade.
5. `hero.css` — dotted grid + code-scroll keyframes.
6. `octopus.css` — phase row + fan-out SVG + mobile stack.

These are imported by `globals.css` after the fleet imports.

---

## 5. Responsive breakpoints

Project-wide: we reuse the fleet `max-width: 640px` breakpoint wherever the fleet CSS already defines it (Nav). For everything else we use three widths aligned with Tailwind defaults.

| breakpoint | Tailwind prefix | use case |
|---|---|---|
| `< 640px` | (mobile, no prefix or via `max-`) | Nav collapses to hamburger (fleet-provided). Octopus stacks vertically. Generator's two-panel becomes single column. Hero subhead scales down. |
| `640–900px` | `sm:` / `md:` | Single-column generator. Octopus becomes horizontally scrollable row with scroll-snap. Form fields full-width. |
| `≥ 900px` (the critical gate for generator) | custom Tailwind screen `gen: '900px'` OR existing `md:` if acceptable — prefer **custom `gen` screen** to avoid collision with `md` (768px) | Two-panel generator layout side by side (form left, preview+actions right). |
| `≥ 1024px` | `lg:` | Hero headline scales up, HowItWorks becomes 7-across row (below: 2- or 3-column grid). |

### Per-component responsive decisions

| component | mobile behavior |
|---|---|
| **Nav** | `max-width: 640px` — hamburger (fleet CSS already handles). Links slide down on open. |
| **Hero** | Below 640px: stack CTAs vertically, headline font scales with `clamp(2rem, 6vw, 4rem)`, hide the code-scroll strip (set `display: none` below 640px to reduce visual noise and paint cost on mobile). |
| **SeedGenerator** | Below `gen: 900px`: stack vertically — form on top, preview (ArtifactTabs) below. Action buttons become full-width stacked (`flex-col gap-2`). Above: two-column grid `grid-cols-[minmax(0,420px)_1fr] gap-8`. |
| **PhaseOctopus** | Below 640px: **vertical stack** (flex-col), each `PhaseCard` full-width, no horizontal scroll, disable fan-out SVG overlay. 640–1280px: horizontal scroll row with scroll-snap (`snap-x snap-mandatory`). ≥1280px: all 9 cards visible no scroll. |
| **ArtifactTabs** | Below 640px: tab rail becomes horizontal scroll (7 tabs don't fit). MOS said consider accordion — rejected for MVP (adds state + layout complexity; horizontal scroll is fine on mobile). Flag: if UX testing shows this sucks, Phase 7 reviewer can request accordion. |
| **HowItWorks** | Below 640px: single column. 640–1024px: 2 columns (4+3 split visually). ≥1024px: 7 across single row. |
| **Footer** | Below 640px: stack vertically (name, github, tagline stacked). |
| **MarkdownPreview** | Below 900px: `max-height: 60vh`. Above: `max-height: 70vh`. Always scrollable. |
| **PhaseCard** | Min-width 220px so cards don't squash in the row; full-width on mobile stack. |

---

## 6. Animations

Framer Motion imported only where listed. Strategy rule honored: sparingly, no infinite loops, hero is pure CSS.

| component | animation | technique |
|---|---|---|
| **Hero** | Dotted-grid pan + horizontal code-scroll strip in the background. | **CSS only.** `@keyframes scroll-code { from { transform: translateX(0) } to { transform: translateX(-50%) } }` on a wide pre element with 2× duplicated code content. Duration 60s, linear, infinite. NOTE: strategy says "no infinite loops" — this is the canonical exception since the hero background is a decorative CSS motion, not Framer. It's infinite at the CSS layer only; no JS, no re-render. |
| **Hero** | CTA buttons on mount | `motion.div` with `initial={{opacity:0, y:8}}`, `animate={{opacity:1, y:0}}`, `transition={{delay:0.15, duration:0.3}}`. One-shot. |
| **SeedGenerator** | Form groups stagger on mount | `motion.div` parent with `variants={{ visible: { transition: { staggerChildren: 0.04 } } }}`. Each form group `variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}`. One-shot. |
| **SeedGenerator** | Preview tab-switch | `AnimatePresence mode="wait"` wrapping `MarkdownPreview`. `initial={{opacity:0}}`, `animate={{opacity:1}}`, `exit={{opacity:0}}`, `transition={{duration:0.1}}`. Matches strategy's "100 ms 50% opacity fade-out/in" spec. |
| **SeedGenerator** | Copy-to-clipboard confirmation | `AnimatePresence` on the "Copied ✓" text label (mono, no emoji actually — plain `Copied`). 1.5s auto-hide via `setTimeout` + state. |
| **PhaseOctopus** | Cards stagger in on mount | `motion.div` parent with `staggerChildren: 0.08`. Each `PhaseCard` in `motion.div` with `initial={{opacity:0, y:12}}`, `animate={{opacity:1, y:0}}`. One-shot — uses `whileInView` with `viewport={{ once: true }}` so it triggers on scroll-in. |
| **PhaseOctopus** | Fan-out SVG lines on card hover | `AnimatePresence` around an absolute `<svg>` overlay. Each line (`motion.path`) animates `pathLength: 0 → 1` over 200ms with stagger. `exit` fades back. Triggered by `hoveredPhase` state in `PhaseOctopus`; disabled on touch-only viewports (below 640px via CSS `pointer: coarse` gate OR simply guard the render on window width if needed). |
| **PhaseCard** | Hover lift | Fleet `.card-brick:hover` handles translate + shadow via CSS. No Framer needed. |
| **HowItWorks** | Step numbers fade in on scroll | `motion.div` per step with `whileInView={{opacity:1, x:0}}`, `viewport={{once:true}}`, `transition={{delay: i * 0.05}}`. One-shot. |
| **ArtifactTabs (landing)** | None beyond tab-switch fade (shared with MarkdownPreview behavior). | — |
| **Nav** | Mobile menu open/close | CSS-only via `.open` class toggle (matches fleet CSS). No Framer. |
| **Button** | Hover translate + shadow | Fleet CSS handles. No Framer. |

**No infinite Framer loops anywhere.** The only infinite motion is the CSS hero code-scroll, which the strategy explicitly authorizes ("Hero background code scroll: pure CSS @keyframes").

---

## 7. Shared primitives decision (summary)

| primitive | decision | where it lives |
|---|---|---|
| Button | **extract** TSX | `components/ui/Button.tsx` |
| Badge | **extract** TSX + bespoke CSS | `components/ui/Badge.tsx` + `styles/components/badges.css` |
| SegmentedControl | **extract** TSX + bespoke CSS | `components/ui/SegmentedControl.tsx` + `styles/components/segmented.css` |
| Select | **wrap fleet class in tiny TSX** | `components/ui/Select.tsx` (no new CSS; fleet `.form-select` sufficient) |
| Textarea | **wrap fleet class in tiny TSX** | `components/ui/Textarea.tsx` |
| TextInput | **wrap fleet class in tiny TSX** | `components/ui/TextInput.tsx` |
| Tabs | **extract** TSX + bespoke CSS (reused by both ArtifactTabs) | `components/ui/Tabs.tsx` + `styles/components/tabs.css` |
| CodeBlock | **extract** TSX + bespoke CSS | `components/ui/CodeBlock.tsx` + `styles/components/code.css` |
| PhaseCard | **extract** TSX (no new CSS beyond octopus.css) | `components/PhaseCard.tsx` |

Proposed filesystem layout (Worker A's request — Architect-A will finalize):

```
components/
  ui/                   <- Group A primitives
    Button.tsx
    Badge.tsx
    SegmentedControl.tsx
    Select.tsx
    Textarea.tsx
    TextInput.tsx
    Tabs.tsx
    CodeBlock.tsx
  Nav.tsx
  Hero.tsx
  HowItWorks.tsx
  Footer.tsx
  PhaseCard.tsx
  MarkdownPreview.tsx
  ArtifactTabs.tsx
  PhaseOctopus.tsx
  SeedGenerator.tsx
app/
  layout.tsx
  page.tsx
  playground/page.tsx
  styles/
    globals.css
    palette.css            (copy of fleet)
    components/
      buttons.css          (fleet)
      cards.css            (fleet)
      forms.css            (fleet)
      navigation.css       (fleet)
      badges.css           (bespoke)
      segmented.css        (bespoke)
      tabs.css             (bespoke)
      code.css             (bespoke)
      hero.css             (bespoke)
      octopus.css          (bespoke)
```

---

## 8. Form field table (order as they appear in SeedGenerator)

Ordered top-to-bottom inside the form column. Rows 5–6 and 7–8 are paired in `.form-row` side-by-side on ≥640px, stacked on mobile. All labels render in mono uppercase via fleet `.form-label`.

| # | id | label | input type | default value | options (select/segmented) | placeholder / hint |
|---|---|---|---|---|---|---|
| 1 | `projectName` | `PROJECT NAME` | TextInput | `SpecSeed.io` | — | placeholder: `your-project-name` |
| 2 | `objective` | `OBJECTIVE` | Textarea (rows=3) | `Generate the master seed that turns one project objective into parallel agent execution.` | — | placeholder: `One sentence. Make it specific.` · hint: `What does this project do?` |
| 3 | `projectType` | `PROJECT TYPE` | Select | `saas-app` | `landing-page` / `saas-app` / `docs-site` / `dashboard` / `api` / `full-stack-app` | hint: `Shape of the final deliverable.` |
| 4 | `agentPlatform` | `AGENT PLATFORM` | Select | `both` | `claude-code` / `codex` / `both` | hint: `Which agent adapters to generate.` |
| 5 | `environment` | `ENVIRONMENT` | SegmentedControl | `both` | `macos` / `ubuntu` / `both` | hint: `Target OS adapters.` |
| 6 | `scope` | `SCOPE` | Select | `medium` | `tiny` / `small` / `medium` / `large` / `platform` | hint: `Drives worker count + decomposition depth.` |
| 7 | `risk` | `RISK` | SegmentedControl | `medium` | `low` / `medium` / `high` | hint: `Higher risk → more workers + more review.` |
| 8 | `parallelism` | `PARALLELISM` | SegmentedControl | `balanced` | `conservative` / `balanced` / `aggressive` | hint: `How hard to fan out waves.` |
| 9 | `outputStyle` | `OUTPUT STYLE` | SegmentedControl | `detailed` | `concise` / `detailed` / `exhaustive` | hint: `Prose density of generated docs.` |
| 10 | `deploymentTarget` | `DEPLOYMENT TARGET` | Select | `vercel` | `static` / `vercel` / `docker` / `ubuntu-vps` / `custom` | hint: `Where it lands.` |
| 11 | `constraints` | `CONSTRAINTS` | Textarea (rows=3) | `No paid LLM API calls in MVP. Pure TypeScript template generation. Deterministic output.` | — | placeholder: `Any hard constraints — budget, deps, bans.` |
| 12 | `repoNotes` | `REPO NOTES` | Textarea (rows=3) | `Next.js 14 App Router, TypeScript strict, Tailwind CSS, Framer Motion.` | — | placeholder: `Stack, conventions, quirks.` |

Defaults match `seed-brief.md` exactly. `DEFAULT_SEED_INPUT` is a single exported constant (owned by Worker B's `lib/defaults.ts`) imported by both `SeedGenerator` (initial state) and `HomePage` (for the precomputed `#artifacts` section + `PhaseOctopus`).

Pair layout: (scope, risk) side-by-side in one `.form-row`; (parallelism, outputStyle) side-by-side in another. All others full-width rows.

---

## 9. Preview tabs (7 tabs)

The `ArtifactTabs` component renders 7 tabs in this order. Each maps to a key on `GeneratedSeed` (the return type of `compileFullSeed` — Worker B defines exact shape; I use likely names).

| # | tab label | filename shown | GeneratedSeed key (proposed) | language |
|---|---|---|---|---|
| 1 | `SEED.md` | `SEED-{slug}.md` | `seedMd: string` | `markdown` |
| 2 | `CLAUDE.md` | `CLAUDE.md` | `claudeMd: string` | `markdown` |
| 3 | `AGENTS.md` | `AGENTS.md` | `agentsMd: string` | `markdown` |
| 4 | `Claude Agents` | `.claude/agents/*.md` — toggle within tab via a small sub-segmented row (recon / tester / reviewer) | `claudeAgents: { recon: string; tester: string; reviewer: string }` | `markdown` |
| 5 | `Codex Agents` | `.codex/config.toml` + `.codex/agents/{reviewer,worker}.toml` — sub-segmented (config / reviewer / worker) | `codexConfig: string; codexAgents: { reviewer: string; worker: string }` | `toml` |
| 6 | `macOS` | `macos-setup.sh` | `macosSetup: string` | `bash` |
| 7 | `Ubuntu` | `ubuntu-bootstrap.md` | `ubuntuBootstrap: string` | `markdown` |

Sub-segmented tabs (tab 4 and tab 5) are the cleanest way to surface 3 Claude agents + 3 Codex files without exploding the top-level tab count to 13. Uses the existing `SegmentedControl` primitive.

Tab label tokens stay plain strings (no filename dot-extension in the label itself except for tabs 1–3 where the filename IS the brand). Tabs 4–5 use human names; tabs 6–7 use OS names.

---

## 10. Action buttons (4 buttons)

Rendered in `SeedGenerator`'s right panel below the preview, inside a `.form-actions`-style bar. Order: Copy, Download SEED, Download Pack, Reset.

| # | label | behavior | fleet class | variant/rationale |
|---|---|---|---|---|
| 1 | `Copy Markdown` | Copies the **currently-active tab's content** to clipboard via `copyToClipboard(text)`. Shows "Copied" label inline for 1.5s. | `.btn .btn-secondary` | Secondary — it's an assist, not the primary CTA. |
| 2 | `Download SEED.md` | Invokes `downloadBlob(new Blob([generated.seedMd], {type:'text/markdown'}), 'SEED-{slug}.md')`. Slug derived from `input.projectName` (lowercase, kebab). | `.btn .btn-primary` | **Primary** — this is the headline action. Crimson fill. |
| 3 | `Download Adapter Pack` | Calls `buildAdapterZip(generated, input)` → Blob → `downloadBlob(blob, 'specseed-output-{slug}.zip')`. Loading state on button while JSZip builds (≤ 500ms typical). Button text swaps to `Building…` with `disabled`. | `.btn .btn-secondary` | Secondary — power-user action; less visually loud than primary. |
| 4 | `Reset to Demo` | Resets `input` state to `DEFAULT_SEED_INPUT`. No confirm dialog (cheap to reverse). | `.btn .btn-ghost` | Ghost — destructive-ish but low-stakes; ghost keeps visual hierarchy correct. Explicitly NOT `.btn-danger` because `danger` would mis-signal catastrophe for a demo reset. |

Layout: all 4 in one horizontal row on ≥640px (`flex gap-2 flex-wrap`). On mobile they stack full-width (`flex-col`). Button order matches scan priority: Copy (read) → Download SEED (primary write) → Download Pack (power write) → Reset (destroy).

---

## 11. Unknowns / flags

Items that need Architect's call (Phase 3) or deferred strategy clarification:

1. **PhaseOctopus input source.** Strategy says `PhaseOctopus` reflects "the dynamic worker count" — ambiguous whether it mirrors the **live form state** of `SeedGenerator` (requires state lifting to `HomePage` OR a shared context, which strategy forbids) or uses a **static default** (`DEFAULT_SEED_INPUT`) and is purely decorative. **Recommendation:** lift `input` state up to `HomePage` and pass to both `SeedGenerator` (as controlled prop with an `onChange`) and `PhaseOctopus` (read-only). This stays within `useState`-only discipline (no Context), and makes the whole page feel live. On `/playground/` the octopus is absent, so no lifting needed there. **Architect flag #1.**

2. **ArtifactTabs on landing page (`#artifacts` section) — live or precomputed?** Two reads possible: (a) show a frozen example built from `DEFAULT_SEED_INPUT` (brochure-y, static), or (b) mirror the same `generated` from `SeedGenerator`'s live state (redundant with the preview already next to the form). **Recommendation:** option (a) — frozen precomputed — because the generator preview is already present above in the page. The `#artifacts` section serves as a "what you get" brochure and should be stable while the user fiddles. **Architect flag #2.**

3. **Form pair layout under `.form-row`.** Which fields pair with which in horizontal rows? My proposal in §8: (scope, risk) and (parallelism, outputStyle). Architect may prefer (projectType, agentPlatform) paired instead. Non-blocking.

4. **Tab labels — lowercase vs uppercase?** Fleet idiom is uppercase mono for all labels (nav, buttons, form labels). My proposal keeps tab labels as displayed (`SEED.md`, `CLAUDE.md`, etc.) because they ARE filenames and should read literally. Tabs 4–7 use Title Case. This is mild inconsistency with fleet mono-uppercase idiom. **Architect flag #3.**

5. **Hero code-scroll content.** What does the hero background code-scroll actually render? Options: (a) a TypeScript snippet of `workerCap(...)` formula, (b) a rendered snippet of SEED.md section 7 Wave Plan, (c) cycling through all 11 SEED.md section headers. **Recommendation:** (b) — shows the product output, which reinforces the pitch. Static content baked into `Hero.tsx` as a const string. **Architect flag #4.**

6. **Copy Markdown scope.** Does "Copy Markdown" copy ALL artifacts concatenated, or JUST the currently-active tab? My §10 assumes active-tab-only (less surprising, more useful). Strategy doesn't specify. **Architect flag #5.**

7. **Slug derivation.** `SEED-{slug}.md` — slug from `projectName`. Recommendation: `slugify(projectName) = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`. `"SpecSeed.io"` → `"specseed-io"`. Worker B owns this (`lib/slug.ts` or inline in download helper). Flag cited for cross-worker coordination only.

8. **Reduced-motion support.** `prefers-reduced-motion: reduce` — should we kill the hero code-scroll + framer staggers? Fleet CSS doesn't gate on this. **Recommendation:** add a `@media (prefers-reduced-motion: reduce)` block in `globals.css` that disables the hero keyframe and a `useReducedMotion()` hook check in framer-motion components. Not in MVP scope from strategy but a11y-positive and cheap. **Architect flag #6.**

9. **Nav active state on scroll.** Does the nav highlight the currently-visible section (`#generator`, `#octopus`, etc.) via IntersectionObserver? Fleet CSS supports `.nav-link.active` but nothing says who sets it. **Recommendation:** skip for MVP — use anchor-only navigation; `.active` is only ever on the `/playground/` route highlight. Adding scroll-spy is a Phase 5 (Wire) or later enhancement. **Architect flag #7.**

10. **"Claude Agents" tab default sub-item.** Among (recon / tester / reviewer), which shows first? Recommendation: `reviewer` (most prestigious of the three; aligns with strategy's emphasis on review as a phase). Non-blocking.

---

*CC-OPS-SPECSEED — Decomposer A*
