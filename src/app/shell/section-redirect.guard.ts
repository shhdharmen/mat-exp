import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { NavManifest, NavManifestService } from './nav-manifest.service';

/** Normalize router URL to manifest path keys (no trailing slash). */
export function normalizeDocPath(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  if (path === '' || path === '/') {
    return '/';
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export const sectionRedirectGuard: CanActivateFn = async (_route, state) => {
  const navManifest = inject(NavManifestService);
  const router = inject(Router);

  const path = normalizeDocPath(state.url);
  const manifest = await firstValueFrom(
    navManifest.manifest$.pipe(filter((m): m is NavManifest => m !== null)),
  );

  const redirect = manifest.sectionRedirects?.[path];
  if (redirect) {
    return router.parseUrl(redirect);
  }

  return true;
};
