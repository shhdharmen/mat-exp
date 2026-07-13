---
title: API
order: 2
description: API reference for MatExpLoadingIndicator — host attributes, inputs, animation callbacks, provider options, and advanced exports.
---

## `MatExpLoadingIndicator`

Standalone component, **`OnPush`**, selector **`mat-exp-loading-indicator`**.

You can view the generated API for `MatExpLoadingIndicator` [here](/docs/api/mat-exp/components/MatExpLoadingIndicator).

### Host

| Attribute / binding | Value |
| --- | --- |
| `role` | `progressbar` |
| `aria-busy` | `true` |
| `aria-valuemin` / `aria-valuemax` | `0` / `100` |
| `aria-label` | From **`ariaLabel()`** input |
| `class` | `mat-exp-loading-indicator` |
| `data-speed` | Current **`speed`** preset |

### Inputs

| Input | Type | Default (from options) | Description |
| --- | --- | --- | --- |
| **`config`** | `MatExpLoadingIndicatorConfig` | `'default'` | `'default'` – shape only. `'contained'` – shape on tonal circular background. |
| **`ariaLabel`** | `string` | `'Loading'` | Accessible name while the indicator is shown. Override per instance for context (e.g. "Uploading file"). |
| **`speed`** | `MatExpLoadingIndicatorSpeed` | `'default'` | `'fast'` \| `'default'` \| `'slow'` – maps to M3 Expressive spatial spring presets and step timing. Updates at runtime rebuild GSAP timelines. |

Types:

- **`MatExpLoadingIndicatorConfig`** – `'default' | 'contained'`
- **`MatExpLoadingIndicatorSpeed`** – `'fast' | 'default' | 'slow'`

### Animation callbacks

The component listens to **`(animate.enter)`** and **`(animate.leave)`** on the host and drives GSAP on the inner container, then calls **`event.animationComplete()`** when each tween finishes (or immediately when not in the browser or when reduced motion applies).

---

## Options and provider

### `MatExpLoadingIndicatorOptions`

```ts
interface MatExpLoadingIndicatorOptions {
  readonly config?: MatExpLoadingIndicatorConfig;
  readonly ariaLabel?: string;
  readonly speed?: MatExpLoadingIndicatorSpeed;
}
```

### `MAT_EXP_LOADING_INDICATOR_DEFAULT_OPTIONS`

Default object used when no provider overrides values:

- `config: 'default'`
- `ariaLabel: 'Loading'`
- `speed: 'default'`

### `MAT_EXP_LOADING_INDICATOR_OPTIONS`

`InjectionToken` for the resolved options object; used internally by the component.

### `provideMatExpLoadingIndicatorOptions`

```angular-ts
import { provideMatExpLoadingIndicatorOptions } from '@ngm-dev/mat-exp';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatExpLoadingIndicatorOptions({
      speed: 'slow',
      ariaLabel: 'Please wait',
    }),
  ],
};
```

You may pass a **partial static object** or a **factory** `() => Partial<MatExpLoadingIndicatorOptions>` (see `matExpCreateOptions` in the library).

---

## Advanced exports

The package also exports **`MAT_EXP_LOADING_INDICATOR_SHAPES`** (readonly path `d` strings) and **`MAT_EXP_LOADING_INDICATOR_VIEW_BOX`** for tooling or documentation; the component already uses these for the morph loop.
