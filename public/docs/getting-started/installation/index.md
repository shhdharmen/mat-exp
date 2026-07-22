---
title: Installation
order: 2
description: Step-by-step guide to installing and configuring Mat Expressive in your Angular project, including style setup and HTML element style options.
---

## Supported Angular versions

| Mat Expressive version | Angular version |
| --- | --- |
| Latest | 21 |

## Pre-requisites

Make sure you have installed Angular Material first using the following command:

```bash
ng add @angular/material
```

## Install with `ng add` (recommended)

```bash
ng add @ngm-dev/mat-exp
```

This installs the package and configures its styles for you:

- It first verifies `@angular/material` is installed (Mat Expressive builds on top of it), and
  aborts with instructions to run `ng add @angular/material` first if it isn't.
- It then looks at your project's global stylesheet (the `styles` array in `angular.json`):
  - **CSS project** — it adds `"@ngm-dev/mat-exp/styles.css"` as the first entry of the
    `styles` array in `angular.json` for you (see [Not using Sass?](#not-using-sass) below for
    what that ships).
  - **SCSS/Sass project** — it asks **which components you'd like to include styles for**,
    offering each Button Family member individually (Button, Icon Button, Button Group, Split
    Button, FAB Menu, FAB Menu Trigger) plus an "All components" option (the default), then
    inserts the matching `@use`/`@include` block into your global stylesheet — positioned
    correctly relative to any existing `@use` statements (e.g. the one `ng add @angular/material`
    already wrote).
- Re-running `ng add @ngm-dev/mat-exp` is safe — every step is idempotent.

For non-interactive or scripted use (e.g. CI), skip the components prompt with an explicit flag:

```bash
# Configure styles for only the Button and Icon Button components
ng add @ngm-dev/mat-exp --components=button,icon-button
```

Valid `--components` keys are `button`, `icon-button`, `button-group`, `split-button`,
`fab-menu`, and `fab-menu-trigger`, or the literal `all` (default). `--components` is ignored for
CSS projects, which always receive the full prebuilt stylesheet.

## Manual installation

If `ng add` doesn't fit your setup, install the package via npm and wire up styles yourself:

```bash
npm install @ngm-dev/mat-exp
```

You can then either include only the styles for a specific component, a group of components, or
the entire Mat Expressive styles. **We recommend including only the components you actually
use** — the styles are generated as a flat combinatorial matrix (size × shape × state ×
appearance × …) per component, so pulling in the whole library costs more CSS than most apps
need. See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload) in the Styles API
section for measured numbers and filtering options.

### Include the styles for a specific component (recommended)

Include the styles for only the components you use in your global SCSS styles. This keeps your compiled CSS as small as possible.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles();
  @include mat-exp.mat-exp-icon-button-styles();
  @include mat-exp.mat-exp-button-group-styles();
  @include mat-exp.mat-exp-split-button-styles();
}
```

Each component's **Styling** tab documents the mixin's options, including the `sizes` / `appearances` / `colors` filters described below.

### Include the styles for a group of components

Include the styles for a group of components in your global SCSS styles. This will include the styles for all buttons (icon buttons, button groups, split buttons, etc.) — reach for this only if your app genuinely uses most of the button family.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-buttons-styles();
}
```

### Include the entire Mat Expressive styles ("kitchen sink")

Include the entire Mat Expressive styles in your global SCSS styles. This is the simplest option, but it also emits the most CSS — every component, every size, every shape, every state, every appearance, all at once. Use it for prototyping or when you genuinely need the whole library; prefer the per-component or per-group mixins above for production apps that care about bundle size.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles();
}
```

### Not using Sass?

If your project doesn't compile Sass, you can import the prebuilt CSS instead. It bundles the full `mat-exp-all-styles()` output (HTML element styles included, `skip-html-element-styles` is not configurable this way). This is the escape hatch for teams without a Sass build step — if you *do* compile Sass, prefer the mixins above (or the filtering options below) since the prebuilt CSS can't be trimmed at compile time.

```css
@import '@ngm-dev/mat-exp/styles.css';
```

Or add it directly to the `styles` array in `angular.json`:

```json
"styles": ["@ngm-dev/mat-exp/styles.css"]
```

## Reducing the CSS payload

By default, each mixin emits its full combination matrix, which can add up. See
[Reducing the CSS Payload](/docs/styles-api/reducing-css-payload) in the Styles API section for
measured numbers, the `sizes` / `appearances` / `colors` filtering options, and how to skip
styles on underlying HTML elements with `skip-html-element-styles`.
