import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  ANGULAR_ROUTER_URL,
  provideNgxMetaCore,
  withNgxMetaBaseUrl,
  withNgxMetaDefaults,
  withNgxMetaTitleFormatter,
} from '@davidlj95/ngx-meta/core';
import { provideNgxMetaRouting } from '@davidlj95/ngx-meta/routing';
import { provideNgxMetaStandard } from '@davidlj95/ngx-meta/standard';
import { provideNgxMetaOpenGraph, OPEN_GRAPH_TYPE_WEBSITE } from '@davidlj95/ngx-meta/open-graph';
import {
  provideNgxMetaTwitterCard,
  TWITTER_CARD_TYPE_SUMMARY,
} from '@davidlj95/ngx-meta/twitter-card';
import { provideNgxMetaJsonLd } from '@davidlj95/ngx-meta/json-ld';

import { routes } from './app.routes';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { environment } from '../environments/environment';
import { SITE_NAME } from './shared/utils/json-ld';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideNgxMetaCore(
      withNgxMetaBaseUrl(environment.siteUrl),
      withNgxMetaDefaults({
        title: SITE_NAME,
        description:
          'Material 3 Expressive components for Angular Material — GSAP-powered spring motion, zero-config directives, SSR-safe.',
        applicationName: SITE_NAME,
        canonicalUrl: ANGULAR_ROUTER_URL,
        locale: 'en',
        standard: {
          generator: true,
          author: 'Angular Material Dev',
          keywords: [
            'Angular',
            'Angular Material',
            'Material Design 3',
            'Material Expressive',
            'Angular components',
            'GSAP animations',
          ],
        },
        openGraph: { type: OPEN_GRAPH_TYPE_WEBSITE },
        twitterCard: {
          card: TWITTER_CARD_TYPE_SUMMARY,
          site: '@ngMaterialDev',
          creator: '@ngMaterialDev',
        },
      }),
      // Every page sets a short, topic-only title (e.g. "Button", "Pricing");
      // this appends the site name once, in the single place titles are formatted.
      withNgxMetaTitleFormatter((title) =>
        title === SITE_NAME ? title : `${title} | ${SITE_NAME}`,
      ),
    ),
    provideNgxMetaRouting(),
    provideNgxMetaStandard(),
    provideNgxMetaOpenGraph(),
    provideNgxMetaTwitterCard(),
    provideNgxMetaJsonLd(),
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      },
    },
  ],
};
