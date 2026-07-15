---
title: All Styles API
order: 1
description: API reference for the mat-exp-all-styles SCSS mixin that applies all Mat Expressive component styles at once.
---

This document outlines API for `mat-exp-all-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles($options);
}
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. Side effects are outlined in each component's **Styling** section. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Forwarded unchanged to every underlying mixin that accepts a `sizes` filter (e.g. `mat-exp-button-styles`), applied across every component at once. |
| `appearances` | list of `'text' \| 'filled' \| 'outlined' \| 'tonal'` | `null` (all appearances emitted) | Forwarded unchanged to every underlying mixin that accepts an `appearances` filter (e.g. `mat-exp-icon-button-styles`), applied across every component at once. |
| `colors` | list of `'primary' \| 'secondary' \| 'tertiary'` | `null` (all colors emitted) | Forwarded unchanged to every underlying mixin that accepts a `colors` filter (e.g. `mat-exp-fab-menu-styles`), applied across every component at once. |

> [!NOTE]
> `mat-exp-all-styles()` emits ~177 KB of raw, uncompressed CSS (every component × every combination). See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload) for measured numbers and the recommended per-component alternative.

### `skip-html-element-styles`

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

### `sizes` / `appearances` / `colors`

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
