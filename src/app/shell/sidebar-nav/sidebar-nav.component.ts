import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NavManifestService, NavPage } from '../nav-manifest.service';

export type { NavPage as NavItem };

@Component({
  selector: 'app-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatExpansionModule],
  host: { class: 'sidebar-nav' },
  templateUrl: './sidebar-nav.component.html',
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    mat-expansion-panel {
      box-shadow: none !important;
      background: transparent !important;
    }
  `,
})
export class SidebarNavComponent {
  private readonly navManifestService = inject(NavManifestService);

  readonly linkClicked = output<void>();

  protected readonly nav = this.navManifestService.manifest;
}
