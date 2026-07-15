---
title: What is Mat Expressive?
order: 1
description: An introduction to Mat Expressive — a collection of components, directives, and styles for Angular Material aligned with the Material Design 3 Expressive Design System.
---

Mat Expressive is a library of components and styles for Angular Material, built on the latest Material Design 3 Expressive Design System.

It is **not** a replacement for Angular Material and **not** a fork of it. Instead, it's a collection of:

| Kind | What it does |
| --- | --- |
| **Styles** | Applied to existing Angular Material components to make them expressive and consistent with M3 Expressive. |
| **Directives** | Same goal as styles, but used when styles need to reach the underlying HTML elements or add specific behavior. |
| **Components** | New components for cases Angular Material doesn't cover. |

## How does it work?

Mat Expressive styles components using Angular Material's [`overrides` APIs](https://material.angular.dev/guide/theming#component-tokens) and [CSS variables](https://material.angular.dev/guide/theming-your-components). When a change isn't possible through those APIs, Mat Expressive applies styles directly to the underlying HTML elements instead — for example, Angular Material's `.mdc-button` class.

> [!NOTE]
> Applying styles directly to underlying HTML elements means Mat Expressive could break if Angular Material changes those classes in a future release. We track Angular Material releases and update accordingly when that happens.

## Can I skip styling the underlying HTML elements?

Yes. Set the `skip-html-element-styles` option on any styles mixin to `true`. Just note that you'll lose some visual results Mat Expressive provides — see [Skip HTML element styles](/docs/styles-api/reducing-css-payload#skip-html-element-styles) in the Styles API section.
