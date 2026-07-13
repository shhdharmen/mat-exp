import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// ── Pagefind loader ──────────────────────────────────────────────────────────

type Pagefind = typeof import('/_pagefind/pagefind.js');
let cachedPagefind: Pagefind | null = null;
// Caches the in-flight load, not just the resolved module — without this,
// every keystroke before the first load settles (the normal case: users
// type a query character by character) starts its own concurrent
// import()+init() call. Pagefind's init() is not safe to call concurrently
// more than once; racing it corrupts internal state so every later search
// on that cachedPagefind instance silently returns zero results for the
// rest of the page session.
let pagefindPromise: Promise<Pagefind> | null = null;

// new Function keeps this import opaque to esbuild/Vite so they do not bundle
// pagefind.types.ts in place of the real runtime URL fetch.
const _dynamicImport = new Function('url', 'return import(url)') as (
  url: string,
) => Promise<Pagefind>;

async function loadPagefind(): Promise<Pagefind> {
  if (cachedPagefind) return cachedPagefind;
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      const mod = await _dynamicImport('/_pagefind/pagefind.js');
      await mod.init();
      cachedPagefind = mod;
      return mod;
    })();
  }
  return pagefindPromise;
}

// ── Result metadata ──────────────────────────────────────────────────────────

export interface ResolvedResult {
  url: string;
  title: string;
  excerpt: string;
  section: string;
  tag: string;
  icon: string;
  /** Full Tailwind class string for the tag pill — listed here so the scanner includes them. */
  tagClasses: string;
}

export interface ResultGroup {
  section: string;
  results: ResolvedResult[];
}

// Full class strings live here so Tailwind's content scanner finds them all.
const TAG_META: Record<string, { icon: string; section: string; tagClasses: string }> = {
  Guide: {
    icon: 'menu_book',
    section: 'Getting Started',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  Component: {
    icon: 'widgets',
    section: 'Components',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  API: {
    icon: 'code',
    section: 'Components',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  Styling: {
    icon: 'palette',
    section: 'Components',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  Playground: {
    icon: 'play_circle',
    section: 'Components',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  Styles: {
    icon: 'style',
    section: 'Styles API',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  Page: {
    icon: 'article',
    section: 'Docs',
    tagClasses:
      'text-xs px-1.5 py-0.5 rounded-full font-medium bg-surface-variant text-on-surface-variant',
  },
};

function getResultMeta(
  url: string,
): Pick<ResolvedResult, 'section' | 'tag' | 'icon' | 'tagClasses'> {
  let tag = 'Page';
  if (url.includes('/getting-started/')) {
    tag = 'Guide';
  } else if (url.includes('/components/')) {
    if (url.endsWith('/api')) tag = 'API';
    else if (url.endsWith('/styling')) tag = 'Styling';
    else if (url.endsWith('/playground')) tag = 'Playground';
    else tag = 'Component';
  } else if (url.includes('/styles-api/')) {
    tag = 'Styles';
  }
  const meta = TAG_META[tag] ?? TAG_META['Page'];
  return { tag, ...meta };
}

// ── Recent searches ──────────────────────────────────────────────────────────

const RECENT_KEY = 'docs-recent-searches';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-search-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, CdkListbox, CdkOption],
  host: {
    class: 'search-modal',
    '(keydown)': 'onKeydown($event)',
  },
  templateUrl: './search-modal.component.html',
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: min(640px, 90vw);
      background: var(--mat-sys-surface-container-high);
      border-radius: 28px;
      overflow: hidden;
      outline: none;
    }
    .search-body {
      height: 384px;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
  `,
})
export class SearchModalComponent {
  protected readonly dialogRef = inject(DialogRef<void>);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly results = signal<ResolvedResult[]>([]);
  protected readonly loading = signal(false);
  protected readonly recentSearches = signal<string[]>([]);

  protected readonly groupedResults = computed<ResultGroup[]>(() => {
    const allResults = this.results();
    const groups = new Map<string, ResolvedResult[]>();
    for (const r of allResults) {
      const list = groups.get(r.section) ?? [];
      list.push(r);
      groups.set(r.section, list);
    }
    return Array.from(groups.entries()).map(([section, items]) => ({ section, results: items }));
  });

  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  // Template refs use exportAs="cdkListbox" / "cdkOption" so viewChild resolves the directive.
  private readonly resultsListboxRef = viewChild<CdkListbox<ResolvedResult>>('resultsListbox');
  private readonly recentListboxRef = viewChild<CdkListbox<string>>('recentListbox');

  constructor() {
    this.recentSearches.set(loadRecent());
    afterNextRender(() => {
      this.searchInputRef()?.nativeElement.focus();
    });
  }

  protected async onInput(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    await this.performSearch(value);
  }

  protected searchRecent(q: string): void {
    this.query.set(q);
    this.searchInputRef()?.nativeElement.focus();
    void this.performSearch(q);
  }

  protected removeRecentSearch(q: string, event: Event): void {
    event.stopPropagation();
    this.recentSearches.update((prev) => prev.filter((s) => s !== q));
    this.saveRecent();
  }

  protected clearRecentSearches(): void {
    this.recentSearches.set([]);
    this.saveRecent();
  }

  protected onResultSelect(result: ResolvedResult): void {
    this.navigate(result.url);
  }

  protected onRecentSelect(q: string): void {
    this.searchRecent(q);
  }

  /** Prevent CdkListbox from handling keys that originate from the remove button. */
  protected stopSearchKeys(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      event.stopPropagation();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const isInput = (event.target as HTMLElement).tagName === 'INPUT';
    if (event.key === 'ArrowDown' && isInput) {
      event.preventDefault();
      // Delegate focus into whichever list is currently visible.
      const lb =
        this.results().length > 0
          ? this.resultsListboxRef()
          : this.recentSearches().length > 0
            ? this.recentListboxRef()
            : null;
      lb?.focus();
    } else if (event.key === 'Escape') {
      this.dialogRef.close();
    }
  }

  private async performSearch(value: string): Promise<void> {
    if (!value.trim()) {
      this.results.set([]);
      return;
    }
    this.loading.set(true);
    try {
      const pf = await loadPagefind();
      const response = await pf.debouncedSearch(value);
      if (!response) return;
      const limited = response.results.slice(0, 8);
      const raw = await Promise.all(limited.map((item) => item.data()));
      this.results.set(
        raw.map((r) => ({
          url: r.url,
          title: r.meta.title ?? r.url,
          excerpt: r.excerpt,
          ...getResultMeta(r.url),
        })),
      );
    } catch {
      // Pagefind unavailable (dev server, pre-build) — silently clear results
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private navigate(url: string): void {
    const q = this.query().trim();
    if (q) {
      this.recentSearches.update((prev) => {
        const filtered = prev.filter((s) => s !== q);
        return [q, ...filtered].slice(0, MAX_RECENT);
      });
      this.saveRecent();
    }
    this.dialogRef.close();
    const cleanUrl = url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
    void this.router.navigateByUrl(cleanUrl);
  }

  private saveRecent(): void {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentSearches()));
    } catch {
      // Ignore (e.g. private browsing storage quota)
    }
  }
}
