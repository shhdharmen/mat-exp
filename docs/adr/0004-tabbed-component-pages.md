# Component doc pages use four tabs as separate child routes

Each Component Page is split across four child routes — Overview (`/component`), API (`/component/api`), Styling (`/component/styling`), and Playground (`/component/playground`) — each backed by a separate markdown file. The alternative was a single scrollable page with all four sections, navigated via the right-side TOC (the Mintlify default).

The tab model was chosen because the four concerns (narrative overview, API reference, styling tokens, interactive demo) are written and consumed independently. An API reference reader does not need to scroll past a long overview; a playground user does not need the full styling guide loaded. Each tab is also a stable deep-linkable URL, making it easy to share "see the API tab" or "open the playground" in issues and PRs.

The tradeoff is routing complexity (child routes per component, routes.txt must enumerate all four variants) and Pagefind indexing four smaller pages instead of one large one.
