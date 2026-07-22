import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TocService, type TocItem } from '../../shared/services/toc.service';

export type { TocItem } from '../../shared/services/toc.service';

/**
 * Pixels below the viewport top a heading must cross before it counts as
 * "read". Headings have `scroll-margin-top: 5rem` (80px, see
 * `_markdown-body.scss`), which `RouteHandlerComponent`'s `scrollIntoView`
 * respects when a TOC link is clicked — but the settled position ends up
 * further down than that in practice (measured ~135px, likely from layout
 * shifting under async content mid-scroll), so this needs real headroom
 * above 80px or a clicked link's own heading fails to register as active
 * once the scroll settles.
 */
const ACTIVE_OFFSET_PX = 176;

/** How long to ignore scroll-driven recalculation after a TOC link click, so the smooth-scroll animation it triggers can't fight the just-clicked link's highlight. */
const CLICK_SUPPRESS_MS = 1000;

@Component({
  selector: 'app-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toc.component.html',
  styles: `
    :host {
      display: block;
    }

    .toc-indicator {
      transition:
        transform 250ms cubic-bezier(0.2, 0, 0, 1),
        height 250ms cubic-bezier(0.2, 0, 0, 1);
    }

    @media (prefers-reduced-motion: reduce) {
      .toc-indicator {
        transition: none;
      }
    }
  `,
  imports: [RouterLink],
})
export class TocComponent {
  protected readonly tocService = inject(TocService);
  protected readonly items = this.tocService.items;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly hostEl = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly itemEls = viewChildren<ElementRef<HTMLLIElement>>('tocItem');

  protected readonly activeId = signal<string | null>(null);
  protected readonly indicator = signal<{ top: number; height: number } | null>(null);

  private tickScheduled = false;
  private suppressScrollSpyUntil = 0;

  constructor() {
    // (Re)wires the scroll/resize listeners whenever the page's headings
    // change (i.e. on navigation to a different doc page).
    effect((onCleanup) => {
      const currentItems = this.items();
      if (!this.isBrowser || currentItems.length === 0) {
        this.activeId.set(null);
        return;
      }

      const scrollContainer = this.findScrollContainer();
      const handler = () => this.scheduleActiveIdUpdate(currentItems);
      handler();

      scrollContainer.addEventListener('scroll', handler, { passive: true });
      window.addEventListener('resize', handler);

      onCleanup(() => {
        scrollContainer.removeEventListener('scroll', handler);
        window.removeEventListener('resize', handler);
      });
    });

    // Repositions the sliding indicator whenever the active link (or the
    // rendered <li> elements backing it) changes.
    effect(() => {
      const id = this.activeId();
      const els = this.itemEls();
      const currentItems = this.items();
      const index = currentItems.findIndex((item) => item.id === id);
      const el = index >= 0 ? els[index]?.nativeElement : undefined;

      this.indicator.set(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
    });
  }

  /**
   * Walks up from the TOC's own host element to find the nearest scrollable
   * ancestor. The doc page layout scrolls a `mat-drawer-content` panel
   * rather than `window`, and this stays agnostic of that so it doesn't
   * hardcode a selector for the shell's layout.
   */
  private findScrollContainer(): Element | Window {
    let el: HTMLElement | null = this.hostEl.parentElement;

    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
      if (isScrollable && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }

    return window;
  }

  /** Highlights a link the instant it's clicked, instead of waiting for the resulting smooth-scroll to land within `ACTIVE_OFFSET_PX`. */
  protected onLinkClick(id: string): void {
    this.activeId.set(id);
    this.suppressScrollSpyUntil = Date.now() + CLICK_SUPPRESS_MS;

    // A real scroll event landing right at the edge of the suppression
    // window gets ignored by `scheduleActiveIdUpdate` below, and if no
    // further scroll event happens afterwards, nothing re-checks the final
    // position — this guarantees one authoritative recompute once
    // suppression lifts, regardless of scroll event timing.
    const currentItems = this.items();
    setTimeout(() => {
      // Bail if the page (and thus its headings) changed in the meantime.
      if (this.items() === currentItems) this.updateActiveId(currentItems);
    }, CLICK_SUPPRESS_MS + 20);
  }

  private scheduleActiveIdUpdate(currentItems: TocItem[]): void {
    if (this.tickScheduled) return;
    this.tickScheduled = true;
    requestAnimationFrame(() => {
      this.tickScheduled = false;
      if (Date.now() < this.suppressScrollSpyUntil) return;
      this.updateActiveId(currentItems);
    });
  }

  /**
   * Walks headings top-to-bottom and keeps the last one whose top edge has
   * scrolled past `ACTIVE_OFFSET_PX`, so the active link always reflects the
   * section currently under the viewport's "reading line".
   */
  private updateActiveId(currentItems: TocItem[]): void {
    let active = currentItems[0]?.id ?? null;

    for (const item of currentItems) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - ACTIVE_OFFSET_PX <= 0) {
        active = item.id;
      } else {
        break;
      }
    }

    this.activeId.set(active);
  }
}
