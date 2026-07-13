# QUALITY-BAR.md — Objective rubrics and the pre-release checklist

> Purpose: let any model (or human) judge "is this good enough to ship?" without taste.
> Each rubric is pass/fail per row. "Ship" requires every MUST row green.

## 1. Code quality rubric

| # | Rule | How to check | Level |
|---|---|---|---|
| C1 | Standalone, `OnPush`, signals-based state; no `@HostBinding/@HostListener`; `host` object only | ESLint + grep `@Input\(|@Output\(|@HostBinding|@HostListener` in `projects/` — decorator inputs currently exist only in `icon-button.ts` and `button-group.ts` (tracked, ISSUES-TRIAGED.md #6); no new ones | MUST |
| C2 | Directive/component selector prefixes `matExp`/`mat-exp` | `ng lint` (angular-eslint rules) | MUST |
| C3 | No `any`; prefer `unknown` | `ng lint` + review | MUST |
| C4 | Public members JSDoc'd with `@default`; private ones `_`-prefixed + `@internal` | review; the docs pipeline makes missing `@internal` a *public API leak*, not a style nit | MUST |
| C5 | Options-bag DI pattern for all configurable defaults (`matExpCreateOptions`) | new `*.options.ts` matches `button.options.ts` shape | MUST |
| C6 | SSR-safe: no bare `window`/`document`; guards or `afterRenderEffect` | grep + `npm run build:docs` (prerender executes the code) | MUST |
| C7 | `sideEffects: false` preserved — no module-scope side effects in lib | review imports/top-level statements | MUST |
| C8 | Motion tokens in TS, never SCSS; GSAP-only animation; `prefers-reduced-motion` respected in every code path | grep `matchMedia\|prefers-reduced-motion` next to any `gsap.` usage | MUST |
| C9 | No commented-out code left as "documentation" without an ADR reference | review | SHOULD |
| C10 | `exportAs` on every directive | grep `exportAs` — split-button (component, n/a) and fab-menu lack it today | SHOULD |

## 2. Visual fidelity rubric (Material 3 Expressive)

The single source of truth is m3.material.io component specs (+ the Jetpack Compose reference
implementation for motion, which `loading-indicator.animation.ts` already mirrors —
`spring(0.6, 200)`, 650ms interval, 4666ms rotation).

| # | Rule | How to check | Level |
|---|---|---|---|
| V1 | Every size's container height, padding, icon size, and typography match the spec table for that component | compare `tokens/_<size>.scss` values against the spec page; heights are `rem()` of the spec px | MUST |
| V2 | Shape morph on press: round→smaller-radius square per spec; selected/unselected resting shapes swap round↔square | playground manual check at each size | MUST |
| V3 | Same attribute value renders pixel-identical across the Button Family (lone button vs in group vs in split) | side-by-side in playground; this is the family invariant (ADR 0006) | MUST |
| V4 | Colors come from Material system tokens (`--mat-sys-*`) — never hard-coded hex — so consumer themes (incl. dark) apply automatically | grep `#[0-9a-fA-F]` in `lib/styles/` (current count: zero in token files; keep it) | MUST |
| V5 | Transitions use the standard curves in `$button-transition` (`utils/_constants.scss:4-8`) or an M3 Expressive spring from `EXPRESSIVE_SPATIAL_SPRINGS` | review | MUST |
| V6 | Screenshot goldens updated knowingly, never blindly | once Playwright `toHaveScreenshot` exists (ISSUES-TRIAGED.md #8) | SHOULD |
| V7 | Dark theme + `density` variations sanity-checked | docs site theme toggle | SHOULD |

## 3. API ergonomics rubric

| # | Rule | Level |
|---|---|---|
| A1 | Both usage styles work: plain CSS class + `data-*` attributes (no import), and the typed directive — and their outputs are identical | MUST |
| A2 | Inputs are string-literal unions exported from `lib/types/` (autocomplete + compile-time validation) | MUST |
| A3 | Defaults overridable at any injector level via `provideMatExp<X>Options` | MUST |
| A4 | Two-way state uses `model()`; container-broadcast state writable by the container only through `ButtonGroupChild` adapters | MUST |
| A5 | Forms-facing components implement CVA (`button-group.ts` is the reference) | MUST where applicable |
| A6 | No required inputs unless the component is meaningless without them | SHOULD |
| A7 | Breaking API changes only in majors; semantic-release commit types must reflect it (`feat!:`/`BREAKING CHANGE:`) | MUST |

## 4. Docs quality rubric

| # | Rule | How to check | Level |
|---|---|---|---|
| D1 | **Every code snippet compiles against the published package** | scratch-app compile (automate: COMPONENT-FACTORY.md §9.2). The `size="sm"` incident (ISSUES-TRIAGED.md #3) is why this is #1 | MUST |
| D2 | Component Page has all four tabs populated (overview/api/styling/playground) | nav manifest emits 4 children | MUST |
| D3 | Frontmatter: `title`, `order`, `description` present; only legal keys (build enforces) | `npm run build:docs` | MUST |
| D4 | Spellcheck pass over changed `.md` | cspell or careful read | MUST |
| D5 | Every claim about defaults matches `*_DEFAULT_OPTIONS` in code | cross-check | MUST |
| D6 | API tab links use scope-first URLs (`/docs/api/mat-exp/<kind>/<Symbol>`) | grep old `/api/classes/` pattern (5 stale files tracked in issue #65) | MUST |
| D7 | Playground defaults look good — the default render is the product screenshot everyone sees | eyeball | SHOULD |

## 5. Pre-release checklist (run mechanically, in order)

```
1.  git checkout main && git pull            # releases cut from main only
2.  npm ci
3.  npm run generate:style-constants         # must produce no diff (else commit it first)
4.  ng lint                                  # zero errors
5.  npm test -- --watch=false                # BOTH projects; zero failures
      npx ng test --project @ngm-dev/mat-exp --watch=false
      npx ng test --project mat-exp-docs --watch=false
6.  npm run build:lib                        # sass validate-config gates token typos
7.  PACKAGE SMOKE TEST:
      cd dist/ngm-dev/mat-exp && npm pack
      install tarball in fresh ng-new app; @use the sass entry; include all-styles mixin;
      ng build; assert output CSS contains ".mat-exp-button["
      assert package tarball contains src/lib/styles/**/*.scss and non-empty styles.css
8.  npm run build:docs                       # 0 prerender errors; route count didn't shrink
9.  npx ng e2e --project=mat-exp-docs --test-project=chromium
10. Manual playground sweep: every component × sizes × light/dark × reduced-motion
11. Verify CHANGELOG-worthy commits use correct conventional types
12. Push to main; WATCH the release action to completion; then:
      npm view @ngm-dev/mat-exp versions   # new version MUST appear (ISSUES #2)
      npm view @ngm-dev/mat-exp license    # must say PolyForm-Noncommercial-1.0.0
13. Open the live docs site; hard-refresh; click one playground.
```

Step 12's post-publish verification is mandatory until the npm-publish failure mode
(ISSUES-TRIAGED.md #2) has been diagnosed and a regression test exists.
