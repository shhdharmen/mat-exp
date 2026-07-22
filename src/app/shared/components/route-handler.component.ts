import { Component, inject, OnDestroy, input, afterNextRender } from '@angular/core';
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
  private _urlFragment = '';
  private readonly _document = inject(DOCUMENT);
  readonly container = input<string>();
  constructor() {
    this.subscriptions.add(
      this._route.fragment.subscribe((fragment) => {
        if (fragment != null) {
          this._urlFragment = fragment;

          const target = this._document.getElementById(this._urlFragment);
          if (target) {
            target.scrollIntoView();
          }
        }
      }),
    );

    afterNextRender(() => {
      setTimeout(() => {
        this.updateScrollPosition();
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
  }

  updateScrollPosition(): void {
    this._document.getElementById(this._urlFragment)?.scrollIntoView();
  }
}
