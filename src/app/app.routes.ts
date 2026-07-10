import { Routes } from '@angular/router';
import { sectionRedirectGuard } from './shell/section-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/standalone-shell/standalone-shell.component').then(
        (m) => m.StandaloneShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./landing-page/landing-page.component').then((m) => m.LandingPageComponent),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./docs/pricing-page/pricing-page.component').then((m) => m.PricingPageComponent),
      },
      {
        path: 'license',
        loadComponent: () =>
          import('./license-page/license-page.component').then((m) => m.LicensePageComponent),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
      {
        path: 'contact-us',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
      {
        path: 'changelog',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
      {
        path: 'refund-policy',
        loadComponent: () =>
          import('./static-page/static-page.component').then((m) => m.StaticPageComponent),
      },
    ],
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./shell/docs-shell/docs-shell.component').then((m) => m.DocsShellComponent),
    children: [
      {
        path: 'api',
        loadComponent: () =>
          import('./docs/api-index-page/api-index-page.component').then(
            (m) => m.ApiIndexPageComponent,
          ),
      },
      {
        path: 'api/:package/:kind/:symbol',
        loadComponent: () =>
          import('./docs/api-detail-page/api-detail-page.component').then(
            (m) => m.ApiDetailPageComponent,
          ),
      },
      {
        path: '**',
        canActivate: [sectionRedirectGuard],
        loadComponent: () =>
          import('./docs/doc-page/doc-page.component').then((m) => m.DocPageComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shell/standalone-shell/standalone-shell.component').then(
        (m) => m.StandaloneShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./not-found-page/not-found-page.component').then((m) => m.NotFoundPageComponent),
      },
    ],
  },
];
