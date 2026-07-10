---
title: Styling
order: 3
description: Styling API for the mat-expressive-button-styles SCSS mixin, including the skip-html-element-styles option and its effects.
---

This document outlines API for `mat-expressive-button-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles($options);
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
  @include mat-expressive.mat-expressive-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### Effects

If you set `skip-html-element-styles` to `true`, the mixin will not apply styles to the underlying HTML elements. And below are some styles which will not work as expected:

- Icon sizes
- Shape morphing
