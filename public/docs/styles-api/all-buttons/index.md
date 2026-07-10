---
title: All Buttons Styles API
order: 2
description: API reference for the mat-expressive-all-buttons-styles SCSS mixin that applies all button-related Mat Expressive styles at once.
---

This document outlines API for `mat-expressive-all-buttons-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-buttons-styles($options);
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
  @include mat-expressive.mat-expressive-all-buttons-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

Side effects of setting `skip-html-element-styles` to `true` are outlined in each components **Styling** tab
