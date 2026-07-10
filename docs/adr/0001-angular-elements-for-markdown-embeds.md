# Angular Elements for interactive embeds in markdown

Markdown is rendered via `[innerHTML]` in Angular, which means Angular's template engine never processes the rendered HTML — dynamic components cannot be instantiated via template syntax. We considered querying the DOM after render and using `ViewContainerRef.createComponent()` to inject Angular components at placeholder `<div>` elements. Instead we use `@angular/elements` (`createCustomElement`) to register the Playground and API card components as browser custom elements (`<component-preview>`, `<api-reference>`). When `[innerHTML]` inserts these tags, the browser holds them in the DOM tree. Once the custom element is defined at bootstrap, the browser retroactively upgrades all existing instances — no post-render scanning, no timing issues, no coupling between the markdown renderer and the component registry.

## Considered Options

- **ViewContainerRef injection**: query DOM for placeholder `<div data-playground="...">` elements after `[innerHTML]` renders, then call `createComponent()`. Works, but requires careful timing (AfterViewInit), a scanning loop, and tight coupling between MarkdownComponent and PlaygroundComponent.
- **Route-level composition**: no embeds in markdown at all — each page's Angular template explicitly places `<docs-playground>` alongside `<docs-markdown>`. Avoids the problem entirely but forces every page with a playground to have a companion `.ts` file — the same authoring friction ng-doc imposed.

## Consequences

Custom elements do not render server-side during SSG prerendering — the prerendered HTML will contain bare `<component-preview>` tags until JavaScript hydrates. This is acceptable because the Playground is inherently interactive and requires JS regardless. A CSS loading skeleton on the custom element prevents layout shift before hydration.

## Update: reverted

No markdown content ever adopted `<component-preview>` or `<api-reference>` embeds — the Playground is only ever reached via its dedicated tab on a Component Page (`PLAYGROUND_PAGE_REGISTRY` + `NgComponentOutlet`), and API cross-links use inline-code auto-linking instead. `CustomElementsService`, `ApiReferenceCardComponent`, and the `@angular/elements` dependency were removed as unused. `PlaygroundComponent` (`app-playground`) itself is untouched — it's still used directly via Angular component composition in each component's `*-playground.component.ts` wrapper.
