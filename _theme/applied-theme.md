# Applied Theme — AXL Fleet Brutalist v0.1.0

**Source:** `/opt/fleet-template/design/palette.css` (fleet template bundle, MOTHER v0.1.0)
**Applied:** 2026-04-21
**Overrides:** SPECSEED-MOS Section 3 fallback palette (dark gradient + gold/cyan/green/orange/purple) is NOT used. Fleet brutalist concrete + crimson is the canonical source.

---

## Color tokens

### Concrete scale (the weight)

| Token | Value | Use |
|-------|-------|-----|
| `--concrete-900` | `#0a0a0a` | void / base bg (dark) |
| `--concrete-800` | `#1f1f1f` | deep shadow / bg-surface |
| `--concrete-700` | `#3a3a3a` | foundation / bg-raised |
| `--concrete-500` | `#525252` | structural / border |
| `--concrete-400` | `#707070` | body text on light |
| `--concrete-300` | `#8a8a8a` | divider / text-muted |
| `--concrete-200` | `#c4c4c4` | surface-raised (light mode) |
| `--concrete-100` | `#e0e0e0` | surface / text (dark mode) |
| `--concrete-50`  | `#f5f5f5` | background (light mode) |

### Crimson (the only color that gets to exist)

| Token | Value |
|-------|-------|
| `--crimson` | `#dc143c` |
| `--crimson-dark` | `#a00f2f` |
| `--crimson-glow` | `#dc143c33` |

### Semantic (derived)

| Token | Maps to |
|-------|---------|
| `--bg` | `--concrete-900` (dark) / `--concrete-50` (light) |
| `--bg-surface` | `--concrete-800` (dark) / `#ffffff` (light) |
| `--bg-raised` | `--concrete-700` (dark) / `--concrete-100` (light) |
| `--border` | `--concrete-500` (dark) / `--concrete-300` (light) |
| `--text` | `--concrete-100` (dark) / `--concrete-800` (light) |
| `--text-muted` | `--concrete-300` (dark) / `--concrete-500` (light) |
| `--text-bright` | `#ffffff` (dark) / `--concrete-900` (light) |
| `--accent` | `--crimson` |
| `--accent-hover` | `--crimson-dark` |

## Typography

| Token | Value |
|-------|-------|
| `--font-mono` | `'IBM Plex Mono', 'JetBrains Mono', 'Menlo', monospace` |
| `--font-body` | `'Inter', system-ui, -apple-system, sans-serif` |

Display/headings use `--font-mono`, uppercase, `letter-spacing: -0.02em`, weight 700.

## Structure

| Token | Value |
|-------|-------|
| `--radius-none` | `0` (brutalism says no) |
| `--radius-sharp` | `2px` (when something absolutely must have a rounded corner) |
| `--shadow-brick` | `4px 4px 0 var(--concrete-900)` |
| `--border-hard` | `1px solid var(--border)` |

## Component CSS modules staged

All from `/opt/fleet-template/design/components/`:

- `buttons.css` — `.btn`, `.btn-primary` (crimson fill), `.btn-secondary` (outline), `.btn-ghost`, `.btn-danger`, sizes `.btn-sm` / `.btn-lg`. On hover: `translate(-2px, -2px)` + `box-shadow: var(--shadow-brick)`.
- `cards.css` — `.card`, `.card-brick` (4px drop-shadow), `.card-accent` (crimson left border), `.card-alert` (crimson border), `.card-grid` (auto-fill 260px minmax).
- `forms.css` — `.form-group`, `.form-label`, `.form-input/select/textarea` with crimson focus ring, `.form-check`, `.form-row`, `.form-actions`.
- `navigation.css` — `.nav` sticky top, `.nav-brand`, `.nav-link` with crimson active underline, `.nav-status` dots (online/offline/warn), mobile hamburger below 640px.

## Application plan

1. `app/globals.css` imports the palette + components as CSS modules (via `@import` from `/styles/` copies).
2. `tailwind.config.ts` extends `theme.extend.colors` with crimson + concrete keys so Tailwind classes (`bg-concrete-800`, `text-crimson`, etc.) are available alongside the CSS variables.
3. Raw CSS classes (`.btn-primary`, `.card-brick`, `.nav-link`) are used directly in component JSX where the brutalist idiom is canonical; Tailwind fills in layout, spacing, responsive.
4. Font loading via `next/font/google`: `Inter` for body, `IBM_Plex_Mono` for mono/display. Assign CSS variables `--font-body` and `--font-mono` via `className` on `<html>`.
5. No rounded corners anywhere except where `--radius-sharp` is explicitly used.
6. Dark mode default. `[data-theme="light"]` toggle available but not exposed in MVP UI.

## Deviations from MOS Section 3

| MOS Section 3 said | Actual (fleet template) |
|---|---|
| `--bg-void: #030508` | `--concrete-900: #0a0a0a` |
| `--accent-gold: #fbbf24` | ❌ not used — `--crimson` is the only accent |
| `--accent-cyan: #22d3ee` | ❌ not used |
| `--accent-green: #34d399` | ❌ not used (reserved: status-dot `.online` is `#00cc55`) |
| `--accent-orange: #ff6b35` | ❌ not used |
| `--accent-purple: #a78bfa` | ❌ not used |
| `Syne` display font | `IBM Plex Mono` (all headings mono-uppercase) |
| `DM Sans` body | `Inter` |
| `JetBrains Mono` mono | `IBM Plex Mono` (JetBrains is fallback) |

This is deliberate. Fleet template is v0.1.0 canonical; MOS fallback was written before the fleet bundle arrived.

## Implications for UX

- The `PhaseOctopus` phase-number accent that MOS specified as `--accent-gold` becomes **`--crimson`**.
- Model-tier badges (Haiku/Sonnet/Opus) cannot use green/cyan/purple as planned. Options:
  - All tiers use `--crimson` with varying fill density (outlined / half / solid)
  - Use `--concrete-200` / `--concrete-300` / `--crimson` to encode tier
  - **Chosen:** tiered via border style + weight. Haiku = `.btn-ghost` outline, Sonnet = concrete outline, Opus = crimson fill. This preserves the monochromatic brutalist discipline.
- Code blocks / preview panels: dark bg `var(--concrete-900)`, border-left `3px solid var(--crimson)` (was `--accent-cyan` in MOS).

---

*CC-OPS-SPECSEED*
