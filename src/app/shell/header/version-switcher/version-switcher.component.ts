import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { VersionsService } from '../../../shared/services/versions.service';

@Component({
  selector: 'app-version-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './version-switcher.component.html',
  styleUrl: './version-switcher.component.scss',
})
export class VersionSwitcherComponent {
  private readonly versionsService = inject(VersionsService);

  /** Available versions sourced from VersionsService. */
  protected readonly versions = computed(() => this.versionsService.versions());

  /** Active version prefix, or null for Latest. Derived from build-time environment variable. */
  protected readonly activeVersion = computed<string | null>(() =>
    environment.version !== '' ? environment.version : null,
  );

  protected readonly activeVersionLabel = computed(() => this.activeVersion() ?? 'Latest');

  protected selectVersion(version: string | null): void {
    const path = window.location.pathname;
    const targetUrl =
      version != null
        ? `https://${version}.expressive.angular-material.dev${path}`
        : `https://expressive.angular-material.dev${path}`;
    window.location.href = targetUrl;
  }
}
