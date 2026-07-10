# Markdown source files served from public/ as static assets

Most documentation build pipelines pre-process markdown to HTML or JSON at build time (via a script) and bundle the output. We chose instead to place `.md` files directly in Angular's `public/` directory, where they are served verbatim at their URL path (e.g. `public/docs/getting-started/installation.md` → `/docs/getting-started/installation.md`). During SSG prerendering, Angular's local HTTP server serves these files and `MarkdownService` fetches them via `HttpClient`, processes them with `marked` + Shiki, and renders the result into prerendered HTML. In the browser, the same fetch path works identically.

This eliminates a content-processing step in the Build Script — the script only handles TypeScript extraction (Playground Schema, API Manifest, Routes File) and does not touch markdown content at all.

## Considered Options

- **Build Script pre-processes markdown to JSON**: the script reads `.md` files, runs `marked` + Shiki, and writes per-page JSON to `src/assets/`. Angular imports the JSON statically. Adds a content-processing step to the build pipeline and makes Shiki a Node.js build dependency rather than a browser/SSR dependency.
- **Markdown files in `src/docs/`**: co-located with Angular source. No functional difference from `public/`, but conflates authoring content with application source code.
