# CONVENTIONS.md — Mechanical style rules observed in this codebase

> These are the rules the existing code actually follows (with noted exceptions). Apply them
> to all new code. Where a linter enforces a rule it's marked [lint]; otherwise it's on you.

## TypeScript / Angular

1. **Standalone only.** No `@NgModule` anywhere. [lint-adjacent: none exist — keep it that way]
2. **Signals for state.** `input()`, `model()`, `output()`, `computed()`, `effect()`,
   `contentChildren()`, `viewChild()`. `model()` when a parent/container writes the value
   (size/shape/toggle on buttons); `input()` otherwise. No RxJS in components.
   *Known legacy exceptions:* `icon-button.ts` `appearance`, `button-group.ts` `value`
   (ISSUES-TRIAGED.md #6) — do not copy them.
3. **`host` object, never `@HostBinding`/`@HostListener`.** Host stamps: `'[class]'` bound to a
   readonly `matExpressive<Name>Class` field, plus one `'[attr.data-<x>]': '<x>()'` per attribute.
4. **`ChangeDetectionStrategy.OnPush`** on every `@Component`.
5. **Naming:** class `MatExpressive<Name>`; directive selector `[matExpressive<Name>]`;
   component selector `mat-expressive-<kebab>` [lint]; options token
   `MAT_EXPRESSIVE_<NAME>_OPTIONS`; provide/inject fns `provideMatExpressive<Name>Options` /
   `injectMatExpressive<Name>Options`; internal class-name field `matExpressive<Name>Class`.
6. **File layout per component:** `<name>.ts`, `<name>.options.ts`, `index.ts` barrel;
   `.html`/`.scss` only for real components; specs as `<name>.spec.ts` next to source.
   Types NEVER live in component files — they go in `lib/types/<attr>.ts`.
7. **Types:** string-literal unions, one exported alias per literal plus the union
   (see `size.ts`); aliases re-exported through `lib/types/index.ts`. `unknown` over `any`.
   `import { type X }` / `import type` for type-only imports (mixed style exists; prefer inline
   `type` qualifier as in `create-options.ts:1`).
8. **Visibility:** public API gets JSDoc with `@default` lines; internal-but-Angular-bound
   members get `/** @internal */` (this also hides them from docs/playground extraction);
   truly private fields `private readonly _x` or `_`-prefixed methods (`_onButtonClick`).
9. **DI:** `inject()` in field initializers, never constructor params. Optional context:
   `inject(X, { optional: true })`. Constructor bodies only for `effect()`/`afterRenderEffect()`
   registration and platform guards.
10. **Templates:** native control flow (`@if/@for/@switch`); no arrow functions in templates;
    `track` on every `@for`. [lint]
11. **Docs app components** use `app-` selector prefix and the same signals rules; Tailwind
    utility classes are allowed in docs templates only — NEVER in the library.

## SCSS (library)

12. Two style worlds — never mix them (ADR 0006): Button Family = global mixins under
    `lib/styles/components/all-buttons/`; standalone components = component `styleUrls` +
    `ViewEncapsulation.None` + `--mat-expressive-<component>-*` custom properties with inline
    fallbacks.
13. Directory grammar per family component: `_index.scss` (the `mat-expressive-<name>-styles`
    mixin), `_config.scss` (joins lists), `configs/_<size>.scss` (combination entries),
    `tokens/_<size|common>.scss` (values). Config entry keys limited to
    `size, shape, state, toggle, width, appearance, variant, selection, color, open, menu-open,
    tokens, properties` — validated at compile time by `utils/functions/_validate-config.scss`.
14. Values: `functions.rem(<px>)` for lengths; `var(--mat-sys-*)` for color/typography system
    tokens; **zero hard-coded colors**. Angular Material token names must match the relevant
    `mat.<x>-overrides()` mixin's accepted keys.
15. `@use` with explicit namespaces (`as mat`, `as tokens`); `@forward` only in `_index.scss`
    aggregators. Generated files carry the AUTO-GENERATED banner and are never hand-edited.
16. Selector building via string concatenation on `$selector` follows the exact pattern in
    `button/_index.scss:36-60` — copy it; don't invent new selector grammar.
17. Every consumer-facing mixin takes an `$options` map with `skip-html-element-styles`
    honored via `mixins.apply-tokens-properties`.

## Motion

18. GSAP 3 only; register plugins via `register*Once()` functions called in constructors —
    never at module scope (`sideEffects: false`).
19. Motion tokens are TS constants (`EXPRESSIVE_SPATIAL_SPRINGS` pattern:
    ease name `mat-expressive-<speed>-spatial`, bezier, durationMs, intervalMs). SCSS carries
    only visual tokens.
20. `prefers-reduced-motion` handled in every path: `gsap.matchMedia()` for loops,
    `prefersReducedMotion()` short-circuit + `event.animationComplete()` for enter/leave.

## Markdown / docs content

21. Frontmatter keys: only `title`, `order`, `description`, `isHidden` (build fails otherwise).
22. Terminology from `CONTEXT.md` (Doc Page, Section, Component Page, Playground, …) — the
    file lists forbidden synonyms; respect them in prose and issue titles.
23. Code fences: `angular-ts name="app.ts"` for Angular snippets, `scss`/`bash` otherwise.
    Alerts via marked-alert syntax (`> [!NOTE]`).
24. Every snippet must compile (QUALITY-BAR.md D1).

## Git / process

25. Conventional commits (commitlint + husky enforce; `npm run commit` for the wizard).
    `feat`/`fix` scopes are component or area names (`feat(button-group): …`).
    Releases are semantic-release-automated from `main`; never edit `CHANGELOG.md` by hand.
26. Issues: titles use the terminology glossary; implementation issues carry a "What to build"
    body section; `ready-for-agent` label marks issues scoped tightly enough for AI execution.
27. ADRs in `docs/adr/NNNN-kebab-title.md` — problem, decision, considered options,
    consequences. Write one for any decision a future maintainer could plausibly "fix"
    into a regression (ADR 0006 exists precisely because the style split looks like a bug).
28. Prettier: 100 cols, single quotes, Angular parser for HTML (root `package.json`
    `prettier` block); lint-staged formats on commit.
