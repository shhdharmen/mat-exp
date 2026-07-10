import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { NavManifestService, NavPage } from '../nav-manifest.service';

@Component({
  selector: 'app-doc-prev-next',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  templateUrl: './doc-prev-next.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DocPrevNextComponent {
  private readonly navManifest = inject(NavManifestService);
  private readonly router = inject(Router);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split('?')[0]),
    ),
    { initialValue: this.router.url.split('?')[0] },
  );

  protected readonly prevNext = computed<{ prev: NavPage | null; next: NavPage | null }>(() => {
    const manifest = this.navManifest.manifest();
    const currentPath = this.currentPath();
    if (!manifest) return { prev: null, next: null };
    const pages = manifest.pages;
    const idx = pages.findIndex((p) => p.path === currentPath);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: idx > 0 ? pages[idx - 1] : null,
      next: idx < pages.length - 1 ? pages[idx + 1] : null,
    };
  });
}
