// Ambient module declaration for Pagefind's build-time static asset.
// This file is intentionally a global .d.ts (no imports) so the declare module
// acts as an ambient declaration, not a module augmentation.
declare module '/_pagefind/pagefind.js' {
  export function init(): Promise<void>;
  export function debouncedSearch(query: string): Promise<{
    results: {
      id: string;
      data(): Promise<{
        url: string;
        excerpt: string;
        meta: { title?: string };
      }>;
    }[];
  } | null>;
}
