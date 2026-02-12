---
keyword: InstallationPage
---

> **Note**
> Mat Expressive doesn't serve as a standalone library. it is mainly a styles extension for Angular Material.
> To use Mat Expressive, you need to install Angular Material first using `ng add @angular/material`.

## Install the Mat Expressive via npm

```bash
npm install @ngm-dev/mat-expressive
```

## Setup the Mat Expressive styles

You can either include the entire Mat Expressive styles or only the styles for a specific component.

### Include the entire Mat Expressive styles

Include the entire Mat Expressive styles in your global SCSS styles.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-all-styles();
}
```

### Include the styles for a specific component

Include the styles for a specific component in your global SCSS styles.

```scss
@use '@ngm-dev/mat-expressive' as mat-expressive;

html {
  @include mat-expressive.mat-expressive-button-styles();
}
```

### Skip HTML element styles

If you do not want to apply styles to the underlying HTML elements, you can set the `skip-html-element-styles` option to `true`.

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

To understand the effects of skipping HTML element styles, please refer to the **Styling** tab for each component.
