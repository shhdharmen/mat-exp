---
title: Styling
order: 3
description: CSS variables, internal structure, and motion token guidance for the Mat Expressive Loading Indicator.
---

The component uses **`ViewEncapsulation.None`**. The host element carries the class **`mat-exp-loading-indicator`** and reflects the current speed preset on **`data-speed`** (`fast`, `default`, or `slow`) for styling or tests.

## Public CSS variables

These variables are defined on **`.mat-exp-loading-indicator`**. Override them in your app (or on an ancestor) to resize or retheme the indicator without forking component SCSS.

| Variable | Default | Role |
| --- | --- | --- |
| `--mat-exp-loading-indicator-size` | `48px` | Width and height of the host. |
| `--mat-exp-loading-indicator-min-size` | `24px` | Minimum width/height. |
| `--mat-exp-loading-indicator-max-size` | `240px` | Maximum width/height. |
| `--mat-exp-loading-indicator-active-indicator-size` | `79.16%` | Size of the SVG relative to the host; matches the M3 ratio between the active indicator and its optional container. |
| `--mat-exp-loading-indicator-color` | `var(--mat-sys-on-primary-container)` | `color` on the inner container (inherited by the SVG via `currentColor` for the path fill). |
| `--mat-exp-loading-indicator-container-color` | `var(--mat-sys-primary-container)` | Background of the circular container when **`config`** is **`contained`**. |

## Internal structure (reference)

The template wraps content in **`mat-exp-loading-indicator-container`**, which gains **`mat-exp-loading-indicator-container-contained`** when `config` is `contained`. The SVG uses **`mat-exp-loading-indicator-svg`**; nested groups use **`mat-exp-loading-indicator-rotator`** and **`mat-exp-loading-indicator-spring-rotator`**. Those group classes mainly support `transform-box: view-box` so GSAP rotation stays centered in the `0 0 380 380` viewBox as the path morphs.

## Motion tokens

Spring curves, step durations, background rotation period, and entry/exit timings are defined in **TypeScript** (`loading-indicator.animation.ts`), not in CSS variables. To change motion globally, use **`provideMatExpLoadingIndicatorOptions`** and/or the **`speed`** input (see [API](./api)). Consumers typically should **not** try to override motion by fighting GSAP from CSS.

## Example: larger indicator on a dark surface

```scss
.my-surface .mat-exp-loading-indicator {
  --mat-exp-loading-indicator-size: 64px;
  --mat-exp-loading-indicator-color: var(--mat-sys-on-surface);
  --mat-exp-loading-indicator-container-color: var(--mat-sys-surface-container-highest);
}
```
