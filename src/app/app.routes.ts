import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'getting-started',
    pathMatch: 'full',
  },
  {
    path: 'getting-started',
    loadComponent: () =>
      import('./docs/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./docs/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  },
];
