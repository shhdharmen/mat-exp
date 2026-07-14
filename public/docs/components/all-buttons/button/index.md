---
title: Button
order: 1
description: Material Expressive Button with size, shape, and toggle variations. Supports both the `.mat-exp-button` CSS class approach and the `[matExpButton]` directive.
primarySymbol: MatExpButton
---

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-button-styles` in your global SCSS styles.

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-styles();
}
```

or

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-all-buttons-styles();
}
```

or

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles();
}
```

## Usage

The styles for Material Expressive Button can be applied in two ways:

1. Using the `.mat-exp-button` class with the `data-*` attributes
2. Using the `matExpButton` directive

### Using the .mat-exp-button class with the data-\* attributes

```angular-ts name="app.ts"
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-root',
  imports: [MatButton],
  template: `
    <button matButton="elevated" class="mat-exp-button" data-size="xs" data-shape="square">
      Elevated
    </button>
    <button matButton="tonal" class="mat-exp-button" data-size="s">Tonal</button>
  `,
})
export class App {}
```

### Using the matExpButton directive

If you do not want to use `data-*` attributes and the `.mat-exp-button` class and want full type safety, you can use `matExpButton` directive.

```angular-ts name="app.ts"
import { MatExpButton } from '@ngm-dev/mat-exp';
@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpButton],
  template: `
    <button matButton="elevated" size="xs" shape="square" matExpButton>Elevated</button>
    <button matButton="tonal" size="s" matExpButton>Tonal</button>
  `,
})
export class App {}
```

## Supported Variations

Mat Expressive Button supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Toggle: `selected`, `unselected`
- State: `pressed` (`:active` pseudo-selector)

## Toggle Behavior

Mat Expressive Button supports a `toggle` state (`selected` / `unselected`), but toggling on click
is only automatic **inside a `MatExpButtonGroup`** — the group owns selection state for every
button it manages.

**Standalone toggle buttons (outside a `MatExpButtonGroup`) do not flip `toggle` on click.** This
is intentional (see [issue #188](https://github.com/Angular-Material-Dev/mat-expressive-private/issues/188)):
a lone button's click handler only has one consumer to satisfy, so the library leaves the state
transition up to you rather than guessing what a click should mean. Two-way bind `toggle` and
flip it yourself in your own `(click)` handler:

```angular-ts name="app.ts"
import { signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatExpButton } from '@ngm-dev/mat-exp';

@Component({
  selector: 'app-root',
  imports: [MatButton, MatExpButton],
  template: `
    <button
      matButton="tonal"
      matExpButton
      [(toggle)]="favorited"
      (click)="favorited.set(favorited() === 'selected' ? 'unselected' : 'selected')"
    >
      Favorite
    </button>
  `,
})
export class App {
  protected readonly favorited = model<'selected' | 'unselected'>('unselected');
}
```

Inside a `MatExpButtonGroup`, don't do this — the group already manages `toggle` for its
projected buttons based on the group's single-/multi-select state, and a manual click handler
would fight the group's own state management.

## Shape Morph

Mat Expressive Button supports this shape morphing by default.

### Pressed State

[According to Material 3 Design System Expressive guidelines](https://m3.material.io/components/buttons/specs#cb36ae03-5539-497d-9777-06547a7d3f17), when pressed, buttons can morph to become more square. Both round and square buttons should have the same pressed shape.

### When selected

In addition to changing shape when pressed, toggle buttons also change the resting shape from round (unselected) to square (selected).

If the resting unselected shape is square, the selected shape should be round.

## Playground

<playground-preview preview="button"></playground-preview>

## API

### Data Attributes with .mat-exp-button class

You can use below `data-*` attributes with `.mat-exp-button` class to style the Angular Material Button component.

#### data-size

The size of the button.

##### Default Value

`s`

##### Possible Values

`xs`, `s`, `m`, `l`, `xl`

#### data-shape

The shape of the button.

##### Default Value

`round`

##### Possible Values

`round`, `square`

#### data-toggle

The toggle state of the button.

##### Default Value

`unselected`

##### Possible Values

`selected`, `unselected`

### matExpButton Directive

You can view the API for `matExpButton` directive [here](/docs/api/mat-exp/directives/MatExpButton).

## Styling

This document outlines API for `mat-exp-button-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles($options);
}
```

### Options

#### skip-html-element-styles

Type: `boolean`

Default: `false`

If `true`, the mixin will not apply styles to the underlying HTML elements.

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

##### Effects

If you set `skip-html-element-styles` to `true`, the mixin will not apply styles to the underlying HTML elements. And below are some styles which will not work as expected:

- Icon sizes
- Shape morphing

#### sizes

Type: `list` of `'xs' | 's' | 'm' | 'l' | 'xl'`

Default: `null` (all sizes emitted)

Restricts the emitted CSS to only the given sizes, dropping the rest of the size × shape × state × toggle combination matrix at compile time. Use this to cut the CSS payload when your app only uses a subset of sizes — see [Reducing the CSS payload](/docs/getting-started/installation#reducing-the-css-payload).

**Usage example:**

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```
