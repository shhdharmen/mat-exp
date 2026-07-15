---
title: All Buttons Styles API
order: 2
description: API reference for the mat-exp-all-buttons-styles SCSS mixin that applies all button-related Mat Expressive styles at once.
---

This document outlines API for `mat-exp-all-buttons-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-buttons-styles($options);
}
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. Side effects are outlined in each component's **Styling** section. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Forwarded unchanged to every underlying button-family mixin that accepts a `sizes` filter (e.g. `mat-exp-button-styles`), applied across every button-family component at once. See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload) for measured numbers. |
| `appearances` | list of `'text' \| 'filled' \| 'outlined' \| 'tonal'` | `null` (all appearances emitted) | Forwarded unchanged to every underlying button-family mixin that accepts an `appearances` filter (e.g. `mat-exp-icon-button-styles`), applied across every button-family component at once. |
| `colors` | list of `'primary' \| 'secondary' \| 'tertiary'` | `null` (all colors emitted) | Forwarded unchanged to every underlying button-family mixin that accepts a `colors` filter (e.g. `mat-exp-fab-menu-styles`), applied across every button-family component at once. |

### `skip-html-element-styles`

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-buttons-styles(
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
  @include mat-exp.mat-exp-all-buttons-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```
