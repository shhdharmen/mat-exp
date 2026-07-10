# AI Handoff Documentation

Written 2026-07-09 against branch `feature/revamped-docs` (commit `05966f0`) by a full-repo
audit that included building the library and docs site, running every test suite, and
installing the published npm package in a blank Angular 21 app.

**Reading order for a model with zero context:**

1. **ARCHITECTURE.md** — how the library and docs site actually work; invariants; dragons.
   Read before any code change.
2. **CONVENTIONS.md** — mechanical style rules. Read before writing code.
3. **STATE-OF-PROGRESS.md** — what exists, component status matrix, docs-revamp checklist.
4. **ISSUES-TRIAGED.md** — every known problem, ordered by leverage, with fix recipes.
   *Start here when asked "what should I work on?"*
5. **COMPONENT-FACTORY.md** — step-by-step playbook to ship a new component.
6. **QUALITY-BAR.md** — pass/fail rubrics + the mechanical pre-release checklist.
7. **DX-AUDIT.md** — fresh-install ground truth; the customer's actual experience.
8. **DECISION-LOG.md** — why things are the way they are; when to revisit each decision.
9. **BUSINESS-STRATEGY.md** — licensing/monetization recommendation and 90-day plan
   (owner-facing; not needed for code tasks).

Ground rules these documents assume:

- `feature/revamped-docs` is the source of truth, not `main` (until merged).
- The checked-in root `CLAUDE.md` is **stale** (describes the removed ng-doc setup); prefer
  ARCHITECTURE.md until it's rewritten.
- Any packaging change requires the package smoke test (QUALITY-BAR.md §5 step 7) — the
  costliest defect in this repo's history shipped because that test didn't exist.
- When these docs and the code disagree, trust the code and fix the doc in the same PR.

Single most urgent fact: **the published npm package (v1.0.1) ships no usable styles; no
documented install path works.** Fix ISSUES-TRIAGED.md #1–#3 before anything else.
