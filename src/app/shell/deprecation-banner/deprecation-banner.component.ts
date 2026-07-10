import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-deprecation-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'deprecation-banner' },
  templateUrl: './deprecation-banner.component.html',
})
export class DeprecationBannerComponent {
  protected readonly version = environment.version;
  private readonly router = inject(Router);

  protected get latestDocsUrl(): string {
    return `https://expressive.angular-material.dev${this.router.url}`;
  }
}
