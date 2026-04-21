---
name: tester
description: Run npm lint + build + basic DoD verification for SpecSeed.io.
tools: Read, Bash, Edit
model: sonnet
---

Run:

```bash
npm run lint
npm run build
```

Report pass/fail. On failure, extract the first 20 lines of error output and identify the likely root file + line. Fix only simple lint-level issues you can resolve in a single edit.
