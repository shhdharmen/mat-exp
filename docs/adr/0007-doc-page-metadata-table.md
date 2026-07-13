# Doc Page metadata table replaces the flat action-button row

Every Doc Page previously showed a flat row of three buttons above its rendered content: "Edit this page", "View markdown", "Copy markdown". This is replaced with an ant-design-style metadata table: every markdown-backed Doc Page gets a **Docs Row** ("Edit this page" + an optional "Design" link, shown only when the page sets a new `designUrl` frontmatter field, + "LLMs.md", the latter linking to that page's own raw markdown — effectively "View markdown" renamed to match the llms.txt convention). Component Pages additionally get an **Import Row** (a copyable `import { ... } from '@ngm-dev/mat-exp';` statement, sourced from a new `primarySymbol` frontmatter field) and a **GitHub Row** (link to the component's source folder + a pre-filled "Report an issue" link).

"Copy markdown" is dropped outright, not folded into the new table — the LLMs.md link already covers "get this page's raw content."

## Considered Options

- **Live open-issues count in the GitHub Row** (mirroring ant-design's component pages, via `api.github.com/search/issues?q=repo:...+in:title+(Label)`): rejected. GitHub's search API caps unauthenticated requests at 10/min; Doc Pages are prerendered/SSG'd (see `ng build`'s `prerender` config), so this would be a client-side fetch on every page view, and a visitor browsing a few Component Pages back-to-back would exhaust the budget. A `sessionStorage`-cached version was considered as a mitigation but the count was dropped entirely instead.
- **A "Changelog" row**: rejected for now — out of scope.
- **A "Template" row** showing a ready-to-use usage snippet alongside the Import Row: rejected as too much for the actions area. Reusing the Playground tab's existing "View source" panel (#96) as the snippet source was discussed but not pursued since the row itself was cut.

## Consequences

- Every Component Page's `index.md` needs a `primarySymbol` frontmatter field (string or array, e.g. `primarySymbol: [MatExpFabMenu, MatExpFabMenuTrigger]` for FAB Menu) before the Import Row can render for it.
- `designUrl` is optional and starts unset on every page; the Design link simply won't appear until a page's frontmatter adds it.
- "Copy markdown" as a feature is gone site-wide; if it's needed again, re-adding it means deciding whether it lives in the Docs Row or elsewhere, not just restoring the old flat button.
