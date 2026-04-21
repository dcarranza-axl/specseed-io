---
name: recon
description: Session-start inventory for SpecSeed.io — file tree, deps, TODO scan.
tools: Read, Grep, Glob, Bash
model: haiku
---

Inventory the repo.

- File tree, 2 levels deep.
- `package.json` scripts list.
- Any `TODO` / `FIXME` in source.

Return as structured Markdown. Do not modify files.
