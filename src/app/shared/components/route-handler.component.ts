import { Component, ElementRef, inject, OnDestroy, input, afterNextRender } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route-handler',
  template: `<ng-content />`,
})
export class RouteHandlerComponent implements OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly _route = inject(ActivatedRoute);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _document = inject(DOCUMENT);
  private _urlFragment = '';
  /**
   * Fragment still waiting to be scrolled to, or `''` once consumed. Content projected into
   * `<ng-content>` (e.g. the doc page's markdown) renders asynchronously, so the target heading
   * often doesn't exist yet when the fragment subscription below first fires — most visibly on
   * browser back/forward, where the URL already carries the old fragment but the page's content
   * hasn't re-rendered yet. The `MutationObserver` below retries the scroll as content is
   * appended; this flag stops it from re-triggering on every later, unrelated mutation (e.g.
   * async code-block syntax highlighting) once we've actually landed on the target.
   *
   * Re-armed on every fragment emission (not just when the string differs from before) — e.g.
   * navigating from `button#toggle-behavior` to `button-group` and back sends the fragment
   * through `'toggle-behavior' -> '' -> 'toggle-behavior'`; comparing against "last successfully
   * scrolled fragment" would wrongly treat that return trip as already handled.
   */
  private _pendingScrollFragment = '';
  private _mutationObserver?: MutationObserver;
  readonly container = input<string>();
  constructor() {
    this.subscriptions.add(
      this._route.fragment.subscribe((fragment) => {
        this._urlFragment = fragment ?? '';
        this._pendingScrollFragment = this._urlFragment;
        this.updateScrollPosition();
      }),
    );

    afterNextRender(() => {
      this.updateScrollPosition();

      this._mutationObserver = new MutationObserver(() => this.updateScrollPosition());
      this._mutationObserver.observe(this._elementRef.nativeElement, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        this.subscriptions.add(
          this._route.params.subscribe((_) => {
            if (this.container()) {
              const target = this._document.querySelector(this.container()!);
              if (target) {
                target.scrollTo({ top: 0 });
              }
            }
          }),
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this._mutationObserver?.disconnect();
  }

  updateScrollPosition(): void {
    if (!this._pendingScrollFragment) return;

    const target = this._document.getElementById(this._pendingScrollFragment);
    if (target) {
      target.scrollIntoView();
      this._pendingScrollFragment = '';
    }
  }
}
