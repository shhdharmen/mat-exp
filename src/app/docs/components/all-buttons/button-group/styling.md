---
title: Styling
route: styling
keyword: ButtonGroupStylingPage
---

This document outlines API for `mat-expressive-button-group-styles` mixin.

## Usage

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-group-styles($options);
}
```

## Options

### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles from the `properties` map (layout, gaps, connected layout helpers). Prefer leaving this `false` for button groups.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-group-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

### mat-expressive-button-group-class

Type: `string`

Default: `mat-expressive-button-group`

The class used in generated selectors for the host.

**Usage example:**

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-group-styles(
    (
      mat-expressive-button-group-class: 'my-custom-button-group',
    )
  );
}
```

If you change this, set `matExpressiveButtonGroupClass` in `provideMatExpressiveButtonGroupOptions` to the same value.

```angular-ts
import { provideMatExpressiveButtonGroupOptions } from '@ngm-dev/mat-expressive';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpressiveButtonGroupOptions({
      matExpressiveButtonGroupClass: 'my-custom-button-group',
    }),
  ],
};
```
