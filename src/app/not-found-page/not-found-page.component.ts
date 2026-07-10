import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatExpressiveButton } from '@ngm-dev/mat-expressive';
import {
  GlobalMetadata,
  NgxMetaElementsService,
  NgxMetaService,
  withContentAttribute,
  withNameAttribute,
} from '@davidlj95/ngx-meta/core';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButton, MatExpressiveButton],
  template: `
    <section class="px-6 py-24 sm:py-32 text-center">
      <div class="max-w-2xl mx-auto">
        <p class="text-lg font-semibold text-primary mb-3">404</p>
        <h1 class="text-4xl sm:text-5xl tracking-tight text-on-surface mb-6 font-bold">
          Page not found
        </h1>
        <p class="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" mat-flat-button matExpressiveButton class="text-base px-6 py-3">
            Go Home
          </a>
          <a
            routerLink="/docs/components"
            mat-stroked-button
            matExpressiveButton
            class="text-base px-6 py-3"
          >
            View Components
          </a>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundPageComponent {
  constructor() {
    inject(NgxMetaService).set({
      title: 'Page not found',
      description: "The page you're looking for doesn't exist or may have moved.",
    } satisfies GlobalMetadata);
    inject(NgxMetaElementsService).set(
      withNameAttribute('robots'),
      withContentAttribute('noindex, nofollow'),
    );
  }
}
