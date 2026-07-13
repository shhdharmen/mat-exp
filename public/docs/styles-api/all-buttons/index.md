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

### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

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

Side effects of setting `skip-html-element-styles` to `true` are outlined in each components **Styling** tab

### sizes / appearances / colors

`mat-exp-all-buttons-styles($options)` forwards `$options` unchanged to every underlying button-family mixin, so any of the size/appearance/color filter options documented on the individual component **Styling** tabs (e.g. `sizes` on `mat-exp-button-styles`, `colors` on `mat-exp-fab-menu-styles`) work here too — they just apply across every button-family component at once. See [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload) for measured numbers.

**Usage example:**

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
