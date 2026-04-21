# The Nine-Phase Octopus

A fan-out/collapse orchestration schedule. The root orchestrator runs all 9 phases in order. Each phase writes a `_mos/` artifact before the next begins. Subagents fan out **within** a phase; they do not recurse.

## Phase table

| # | Name          | Model  | Effort  | Duration | Fan-out                  | Artifact                |
|---|---------------|--------|---------|----------|--------------------------|-------------------------|
| 0 | Recon         | Haiku  | default | 30s      | Inventory ×1             | 00-recon.md             |
| 1 | Strategy      | Opus   | high    | 2m       | Strategy ×1              | 01-strategy.md          |
| 2 | Decompose     | Opus   | high    | 2m       | Decomposer A, B          | 02-decomposition.md     |
| 3 | Architecture  | Opus   | high    | 3m       | Architect A, B           | 03-architecture.md      |
| 4 | Build         | Sonnet | default | 5m       | Builder × workerCap      | implementation diffs    |
| 5 | Wire          | Sonnet | default | 3m       | Wiring ×1                | 05-wire.md              |
| 6 | Test          | Sonnet | default | 3m       | Tester ×1                | 06-verification.md      |
| 7 | Review        | Opus   | high    | 2m       | Reviewer ×1              | 07-review.md            |
| 8 | Integration   | Opus   | high    | 2m       | Integrator ×1            | 08-integration.md       |

## Operating principle

One agent orchestrates the whole wave. It decomposes the objective, dispatches subagents in parallel per phase, collapses their output into a single artifact, and moves on only when the artifact passes review. Every phase is reversible; every artifact is committed.

## Rules

1. **Plan before code.** Collapse each phase into a `_mos/` artifact before moving on.
2. **One wave at a time.** Do not skip ahead.
3. **Trust but verify.** Lint + build after every material change in Phase 4+.
4. **Reversible by default.** No feature flags for hypothetical futures.
5. **No recursion.** Subagents within a phase do not spawn more subagents. The root orchestrator owns fan-out.

## Fan-out vs collapse

- **Fan-out** = the root orchestrator spawns N scoped subagents in parallel within a single phase.
- **Collapse** = the orchestrator merges their output into one artifact. Phase is not done until the artifact exists.

Example: Phase 2 (Decompose) fans out to *Decomposer A* (frontend) + *Decomposer B* (library). Both run in parallel with isolated prompts. When both return, the orchestrator writes `02-decomposition.md` — which is a merge, not a concatenation. Conflicts are resolved in the collapse.

## Worker count math

The Build phase (#4) scales with `workerCap`, computed from the user's input:

```
workerCap = clamp(1, 12, scopeBase[scope] + parallelismBoost[parallelism] + riskBoost[risk])
```

All other phases have fixed worker counts:
- Phases 0, 1, 5, 6, 7, 8: 1 worker each
- Phases 2, 3: 2 workers each (A + B)
- Phase 4: `workerCap` workers

## Artifacts as the audit trail

The `_mos/` directory at the end of a clean build is the full audit trail. Reading `00-recon.md → 08-integration.md` in order reproduces the orchestrator's decisions end-to-end.

---

*CC-OPS-SPECSEED*
