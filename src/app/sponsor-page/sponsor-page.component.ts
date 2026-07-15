import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatExpButton } from '@ngm-dev/mat-exp';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { environment } from '../../environments/environment';
import { breadcrumbListJsonLd, webPageJsonLd, withBaseJsonLd } from '../shared/utils/json-ld';

interface SponsorReason {
  icon: string;
  title: string;
  description: string;
}

const SPONSOR_REASONS: SponsorReason[] = [
  {
    icon: 'construction',
    title: 'Sustained maintenance',
    description: 'Keeps the library current as Angular and Angular Material ship new releases.',
  },
  {
    icon: 'auto_awesome',
    title: 'New components',
    description: 'Funds time spent building the M3 Expressive components Angular Material lacks.',
  },
  {
    icon: 'bolt',
    title: 'Faster releases',
    description: 'More time to review issues and pull requests, and ship fixes sooner.',
  },
];

@Component({
  selector: 'app-sponsor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatExpButton, MatIcon],
  template: `
    <section class="px-6 py-24 sm:py-32 text-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl sm:text-5xl tracking-tight text-on-surface mb-6 font-bold">
          Support Mat Expressive
        </h1>
        <p class="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
          Mat Expressive is free and open source under the MIT license. If it saves you time
          building Material 3 Expressive UI, consider sponsoring its development.
        </p>
        <a
          [href]="sponsorUrl"
          target="_blank"
          rel="noopener noreferrer"
          mat-flat-button
          matExpButton
          class="text-base px-6 py-3"
        >
          Sponsor on GitHub
        </a>
      </div>
    </section>

    <section class="px-6 pb-24 sm:pb-32">
      <div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        @for (reason of reasons; track reason.title) {
          <div class="rounded-2xl border border-outline-variant p-6 flex flex-col gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <mat-icon class="text-on-primary-container">{{ reason.icon }}</mat-icon>
            </div>
            <h3 class="font-semibold text-on-surface">{{ reason.title }}</h3>
            <p class="text-sm text-on-surface-variant leading-relaxed flex-1">
              {{ reason.description }}
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class SponsorPageComponent {
  protected readonly sponsorUrl = environment.sponsorUrl;
  protected readonly reasons = SPONSOR_REASONS;

  constructor() {
    inject(NgxMetaService).set({
      title: 'Sponsor Mat Expressive',
      description:
        'Support the ongoing development of Mat Expressive, a free and open source Material 3 Expressive library for Angular Material.',
      jsonLd: withBaseJsonLd(
        breadcrumbListJsonLd([
          { name: 'Mat Expressive', path: '/' },
          { name: 'Sponsor', path: '/sponsor' },
        ]),
        webPageJsonLd({
          name: 'Sponsor Mat Expressive',
          description:
            'Support the ongoing development of Mat Expressive, a free and open source Material 3 Expressive library for Angular Material.',
          path: '/sponsor',
        }),
      ),
    } satisfies GlobalMetadata & JsonLdMetadata);
  }
}
