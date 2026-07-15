---
title: Button Group
order: 3
description: Material Expressive Button Group for grouping buttons with single/multi-select behavior, compatible with Angular reactive and template-driven forms.
primarySymbol: MatExpButtonGroup
---

## Overview

`MatExpButtonGroup` is a component that groups buttons and provides single/multi-select behavior compatible with Angular reactive and template-driven forms in [Material 3 Design System Expressive styles](https://m3.material.io/components/button-groups/overview).

## Pre-requisites

Make sure either you have included `mat-exp-all-styles`, `mat-exp-all-buttons-styles` or `mat-exp-button-group-styles` in your global SCSS styles.

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
  @include mat-exp.mat-exp-button-group-styles();
}
```

## Usage

```angular-ts name="app.ts"
import {
  MatExpButtonGroup,
  MatExpIconButton,
  MatExpButton,
} from '@ngm-dev/mat-exp';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  imports: [
    MatExpButtonGroup,
    MatExpIconButton,
    MatExpButton,
    MatIconButton,
    MatButton,
    MatIcon,
  ],
  template: `
    <mat-exp-button-group>
      <button matIconButton matExpIconButton>
        <mat-icon>delete</mat-icon>
      </button>
      <button matButton matExpButton>Label</button>
      <button matButton matExpButton>
        <mat-icon>edit</mat-icon>
        Label
      </button>
      <button matIconButton matExpIconButton>
        <mat-icon>favorite</mat-icon>
      </button>
    </mat-exp-button-group>
  `,
})
export class App {}
```

## Supported Variations

Mat Expressive Button Group supports the following variations:

- Size: `xs`, `s`, `m`, `l`, `xl`
- Shape: `round`, `square`
- Selection: `single-select`, `multi-select`
- Appearance: `text`, `outlined`, `filled`, `tonal`
- Variant: `standard`, `connected`

## Use with @angular/forms

`<mat-exp-button-group>` is compatible with `@angular/forms` and supports both `FormsModule` and `ReactiveFormsModule`.

## Playground

<playground-preview preview="button-group"></playground-preview>

## API

### `MatExpButtonGroup`

Standalone component, **`OnPush`**, selector **`mat-exp-button-group`**.

You can view the generated API for `MatExpButtonGroup` [here](/docs/api/mat-exp/components/MatExpButtonGroup).

#### Host

| Attribute / binding | Value |
| --- | --- |
| `role` | `group` |
| `class` | `mat-exp-button-group` |
| `data-variant` | From **`variant()`** input |
| `data-selection` | From **`selection()`** input |
| `data-size` | From **`size()`** input |
| `data-shape` | From **`shape()`** input |
| `data-appearance` | From **`appearance()`** input |
| `data-disabled` / `aria-disabled` | From **`disabled()`** input |

#### Inputs

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| **`size`** | `MatExpButtonGroupSize` | `'s'` | Size broadcast to every projected button. |
| **`shape`** | `MatExpButtonGroupShape` | `'round'` | Shape broadcast to every projected button. |
| **`selection`** | `MatExpButtonGroupSelection` | `'single-select'` | Single- or multi-select behavior. |
| **`variant`** | `MatExpButtonGroupVariant` | `'standard'` | `'standard'` or `'connected'` layout. |
| **`appearance`** | `MatExpButtonGroupAppearance \| undefined` | `undefined` | Appearance broadcast to every projected button. |
| **`disabled`** | `boolean` | `undefined` (falsy) | Disables the group and every projected button. |
| **`value`** | `unknown` | `undefined` | The currently selected value — a single value for `single-select`, an array for `multi-select`. |

`disabled` is declared with `model()` (two-way bindable). `size`, `shape`, `selection`, `variant`, and `appearance` use `input()`. `value` is a plain `@Input()` accessor implementing `ControlValueAccessor`, so it's compatible with `@angular/forms` (`FormsModule` / `ReactiveFormsModule`) via `[(ngModel)]` or a `FormControl`.

#### Outputs

| Output | Type | Description |
| --- | --- | --- |
| **`selectionChange`** | `MatExpSelectableButtonChange` | Emits when the selected value changes, via user interaction or a programmatic `value` / form update. |

Types:

- **`MatExpButtonGroupSize`** – `'xs' | 's' | 'm' | 'l' | 'xl'`
- **`MatExpButtonGroupShape`** – `'round' | 'square'`
- **`MatExpButtonGroupSelection`** – `'single-select' | 'multi-select'`
- **`MatExpButtonGroupVariant`** – `'standard' | 'connected'`
- **`MatExpButtonGroupAppearance`** – `'filled' | 'outlined' | 'tonal' | 'elevated'`

---

### Options and provider

#### `MatExpButtonGroupOptions`

```ts
interface MatExpButtonGroupOptions {
  readonly appearance?: MatExpButtonGroupAppearance;
  readonly size?: MatExpButtonGroupSize;
  readonly shape?: MatExpButtonGroupShape;
  readonly selection?: MatExpButtonGroupSelection;
  readonly variant?: MatExpButtonGroupVariant;
  readonly disabled?: boolean;
}
```

#### `MAT_EXP_BUTTON_GROUP_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `size: 's'`
- `shape: 'round'`
- `variant: 'standard'`
- `selection: 'single-select'`

#### `MAT_EXP_BUTTON_GROUP_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the component.

#### `provideMatExpButtonGroupOptions`

```angular-ts
import { provideMatExpButtonGroupOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpButtonGroupOptions({
      variant: 'connected',
      selection: 'multi-select',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpButtonGroupOptions>`.

## Styling

This document outlines the API for the `mat-exp-button-group-styles` mixin.

### Usage

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-group-styles($options);
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skip-html-element-styles` | `boolean` | `false` | If `true`, the mixin won't apply styles to the underlying HTML elements. |
| `sizes` | list of `'xs' \| 's' \| 'm' \| 'l' \| 'xl'` | `null` (all sizes emitted) | Restricts the emitted CSS to only the given sizes, including the per-size connected-variant inner-corner overrides. See [Reducing the CSS Payload](/docs/styles-api/reducing-css-payload). |

#### `skip-html-element-styles`

Setting this to `true` means the following styles won't be applied:

- Button group container layout (`display: inline-flex`, `flex-direction`, `white-space`, `position`)
- Size-based container height and column gap
- Connected variant column gap and compact icon button sizing
- Connected variant inner-corner shape morphing for each size

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-group-styles(
    (
      skip-html-element-styles: true,
    )
  );
}
```

#### `sizes`

```scss
@use '@ngm-dev/mat-exp' as mat-exp;

html {
  @include mat-exp.mat-exp-button-group-styles(
    (
      sizes: ('s', 'm'),
    )
  );
}
```
