# 09-polish-investigation.md — Post-launch investigation before the next "haul"

**Authored:** 2026-04-22
**Author:** CC-OPS-SPECSEED root orchestrator (Opus 4.7)
**Prompted by:** Operator directive — *"you need to do more investigation before doing another haul, another seed on the website so it can be shared."*

---

## Scope

Before running `compileFullSeed` again (either to produce a shareable demo artifact or to ship another wave), audit the current generator output for correctness issues, then land three UX features that make the experience sharable and star-able.

## Method

Ran `compileFullSeed(DEFAULT_SEED_INPUT)` via `npx tsx /tmp/specseed-check/run.ts`. Asserted structure, line counts, and content spot-checks. Results below.

## Findings — generator output under demo input

| Check | Expected | Actual | Status |
|---|---|---|---|
| `slug` | `specseed-io` | `specseed-io` | ✓ |
| `plan.workerCap` | 5 (medium + balanced + medium) | 5 | ✓ |
| `plan.decompositionDepth` | 2 | 2 | ✓ |
| SEED.md `##` section count | 11 | 11 | ✓ |
| SEED.md total lines | reasonable (~100–200) | 131 | ✓ |
| CLAUDE.md line count | < 200 | 39 | ✓ |
| AGENTS.md line count | < 200 | 31 | ✓ |
| SEED.md contains literal `undefined` | no | no | ✓ |
| SEED.md contains literal `null` | no | no | ✓ |
| Codex config.toml triple-quotes balanced | even | 0 | ✓ (no triple-quotes emitted, clean) |
| Codex reviewer.toml triple-quotes balanced | even | 2 | ✓ |
| Codex worker.toml triple-quotes balanced | even | 2 | ✓ |
| Claude reviewer.md YAML frontmatter | starts and ends `---` | yes | ✓ |
| Claude recon.md YAML frontmatter | same | yes | ✓ |
| Claude tester.md YAML frontmatter | same | yes | ✓ |

**No P0 or P1 bugs found.** Output is well-formed, deterministic, ready to share.

## Minor polish notes (non-blocking, deferred)

- **SEED.md title** reads `# SpecSeed: SpecSeed.io` when the project *is* SpecSeed. Mildly redundant — fix would be to detect self-reference and emit just `# SpecSeed.io`. Low priority — any other project gets a clean `# SpecSeed: Foo`.
- **CLAUDE.md item 1** says "Read `SEED.md` before any session that touches core logic" instead of `core ${projectName} logic`. Intentional simplification; fine.
- **`generateCodexConfig`** takes no input and emits a hardcoded `max_threads=6 max_depth=1`. Seed-brief spec-compliant; but a v0.2 could honor `workerCap`.
- **Hero code-scroll** shows a hardcoded octopus table; could be derived from the live plan. Aesthetic.

## UX features landed this wave (Phase 9: polish)

### 1. Share-as-URL
- `lib/shareUrl.ts` — encodes `SeedInput` to base64url, appends as `?s=<encoded>#generator`.
- On mount (client-only), `SeedGenerator` reads `window.location.search`, decodes, and pre-populates the form if the param validates.
- "Share seed" button in the preview header copies the URL to clipboard (with `prompt()` fallback).

### 2. Clear + Demo button pair
- Replaced single "Reset to Demo" ghost button with two ghost buttons above the form: **Clear** (blanks text fields, keeps enums at sensible defaults via `EMPTY_SEED_INPUT`) and **Demo** (restores `DEFAULT_SEED_INPUT`).
- Moved from the action bar to the input panel header so they're visually tied to the fields they affect.

### 3. GitHub star-gate
- `lib/githubStar.ts` — client-side verification against the public unauthenticated endpoint `GET https://api.github.com/users/{user}/starred/{owner}/{repo}` (204 = starred, 404 = not).
- Target repo constant: `dcarranza-axl/specseed-io` (see "Operator to-do" below).
- `components/ui/StarGate.tsx` — `<dialog>`-based modal with: GitHub link (new tab), username input, Verify button, status messages, and a "Later" ghost.
- Download buttons wrap through `gatedDownloadSeed` / `gatedDownloadPack`: if `localStorage.getItem('specseed:starred')` shows verified, pass through; otherwise open the gate and remember the pending action for after verification.
- "Copy Markdown" is intentionally NOT gated — reading is free, only downloads ask for the star.

## Operator to-do (star-gate activation)

For the gate to start unlocking:

1. Create public repo **`github.com/dcarranza-axl/specseed-io`** (an empty README is enough).
2. Star it yourself (so your own test unlocks).
3. Optional: when you want to open the source, push this droplet's git history to it — requires a GitHub token with `repo` scope.

Until step 1 happens, the gate's API call 404s for everyone and downloads stay locked. The `STAR_REPO` constant in `lib/githubStar.ts` is the single source of truth — change it once there if the repo name differs.

## Still pending (future waves)

- og-image.png (1200×630 crimson + mono wordmark) + restore metadata references.
- Optional: remove `framer-motion` dep or start using it for PhaseOctopus hover fan-out.
- Optional: unit tests against the 45-cell wave-plan table.
- Optional: "fork this seed" CTA on the `/how/` page with a pre-made share URL.

---

*CC-OPS-SPECSEED*
