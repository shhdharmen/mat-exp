---
title: Reducing the CSS Payload
order: 3
description: Strategies for shrinking Mat Expressive's generated CSS — per-component mixins, sizes/appearances/colors filtering, and skipping HTML element styles.
---

`mat-exp-all-styles()` emits every component's full size × shape × state × toggle × appearance combination matrix flat, because each Directive-based button family member has no `styleUrls` and can only style itself through global mixins keyed off `data-*` attribute selectors. Measured against the real published package (`npm pack` tarball, `@use '@ngm-dev/mat-exp' as me`, `sass` CLI, expanded output, uncompressed) this mixin produces **~177 KB of raw CSS** (gzip compresses this well thanks to repetitive selectors, but the raw number is still worth budgeting for — Angular's default initial-bundle budget is 500 KB).

## Two ways to cut this down

From least to most work:

1. **Only include the mixins for components you use.** A single `mat-exp-button-styles()` call, for example, compiles to roughly **62 KB** raw — about a third of the full `mat-exp-all-styles()` payload — because it skips every other family member's combination matrix entirely.
2. **Filter out unused size / appearance / color combinations.** Every button-family mixin accepts a `sizes` option (`icon-button` also accepts `appearances`; `fab-menu` / `fab-menu-trigger` accept `colors`) that drops the rest of that axis's combinations at Sass compile time. For example, restricting `mat-exp-all-styles()` to `sizes: ('s', 'm')` plus `colors: ('primary')` cuts the ~177 KB payload to roughly **75 KB** — a ~57% reduction — with no runtime cost, because the CSS for the excluded sizes/colors is simply never generated.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles(
    (
      sizes: ('s', 'm'),
      colors: ('primary'),
    )
  );
}
```

> [!NOTE]
> If a component renders with a `data-size` / `data-appearance` / `data-color` value you filtered out, no error is thrown — the element just won't match a `[data-size='...']`-qualified selector, so it falls back to whatever base (non-attribute-qualified) styles the component defines, which is visually wrong for that size/appearance/color. Double-check the filter list covers every value your app actually renders before shipping.

These two techniques compose: apply a `sizes` / `appearances` / `colors` filter to the per-component mixins from [Installation](/docs/getting-started/installation) for the smallest possible payload.

## Skip HTML element styles

If you do not want to apply styles to the underlying HTML elements, you can set the `skip-html-element-styles` option to `true`.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

To understand the effects of skipping HTML element styles for a specific component, refer to that component's **Styling** section.
