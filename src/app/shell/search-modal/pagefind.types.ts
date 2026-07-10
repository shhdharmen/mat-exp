export interface PagefindSearchFragment {
  url: string;
  excerpt: string;
  meta: { title?: string };
}

export interface PagefindSearchResultItem {
  id: string;
  data(): Promise<PagefindSearchFragment>;
}

export interface PagefindInstance {
  init(): Promise<void>;
  debouncedSearch(query: string): Promise<{ results: PagefindSearchResultItem[] } | null>;
}

// These declarations match what Pagefind's pagefind.js ES module exports at runtime.
// The tsconfig.json paths entry maps '/_pagefind/pagefind.js' to this file.
export declare function init(): Promise<void>;
export declare function debouncedSearch(
  query: string,
): Promise<{ results: PagefindSearchResultItem[] } | null>;
