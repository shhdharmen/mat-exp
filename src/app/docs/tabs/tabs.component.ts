import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { NavPage } from '../../shell/nav-manifest.service';

/**
 * Renders Angular Material tab navigation for Component Pages.
 * Uses mat-tab-nav-bar / mat-tab-link so each tab is a RouterLink with its own URL.
 * Content is projected into mat-tab-nav-panel for correct ARIA labelling.
 */
@Component({
  selector: 'app-doc-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatTabsModule],
  host: { class: 'doc-tabs' },
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  readonly tabs = input.required<NavPage[]>();
  /** The current router URL path — used to determine which tab is active. */
  readonly currentPath = input.required<string>();
}
