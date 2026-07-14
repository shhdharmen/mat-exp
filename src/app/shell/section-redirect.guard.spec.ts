import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { of } from 'rxjs';
import { normalizeDocPath, sectionRedirectGuard } from './section-redirect.guard';
import { NavManifest, NavManifestService } from './nav-manifest.service';

const routeSnapshot = {} as ActivatedRouteSnapshot;
const stateSnapshot = {} as RouterStateSnapshot;

describe('normalizeDocPath', () => {
  it('strips query and hash and trailing slash', () => {
    expect(normalizeDocPath('/components/?foo=1#bar')).toBe('/components');
  });

  it('preserves root path', () => {
    expect(normalizeDocPath('/')).toBe('/');
  });
});

describe('sectionRedirectGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: NavManifestService,
          useValue: {
            manifest$: of<NavManifest>({
              nav: [],
              pages: [],
              sectionRedirects: {
                '/no-index-section': '/no-index-section/first-page',
              },
            }),
          },
        },
      ],
    });
  });

  it('redirects when manifest maps the current path', async () => {
    Object.defineProperty(stateSnapshot, 'url', {
      value: '/no-index-section',
      configurable: true,
    });

    const result = await TestBed.runInInjectionContext(() =>
      sectionRedirectGuard(routeSnapshot, stateSnapshot),
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/no-index-section/first-page');
  });

  it('allows navigation when no redirect is configured', async () => {
    Object.defineProperty(stateSnapshot, 'url', {
      value: '/getting-started/what-is-mat-exp',
      configurable: true,
    });

    const result = await TestBed.runInInjectionContext(() =>
      sectionRedirectGuard(routeSnapshot, stateSnapshot),
    );

    expect(result).toBe(true);
  });
});
