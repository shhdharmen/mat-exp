---
title: All Styles API
order: 1
description: API reference for the mat-expressive-all-styles SCSS mixin that applies all Mat Expressive component styles at once.
---

This document outlines API for `mat-expressive-all-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles($options);
}
```

## Options

### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

Side effects of setting `skip-html-element-styles` to `true` are outlined in each components **Styling** tab
