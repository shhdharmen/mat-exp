import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

export interface NavItem {
  label: string;
  path?: string;
  icon?: string;
  children?: NavItem[];
}

const PLACEHOLDER_NAV: NavItem[] = [
  {
    label: 'Getting Started',
    icon: 'rocket_launch',
    children: [
      { label: 'What is Mat Expressive?', path: '/getting-started/what-is-mat-expressive' },
      { label: 'Installation', path: '/getting-started/installation' },
    ],
  },
  {
    label: 'Components',
    icon: 'widgets',
    children: [
      {
        label: 'Buttons',
        children: [
          { label: 'Button', path: '/components/button' },
          { label: 'Icon Button', path: '/components/icon-button' },
          { label: 'Button Group', path: '/components/button-group' },
          { label: 'Split Button', path: '/components/split-button' },
          { label: 'FAB Menu', path: '/components/fab-menu' },
        ],
      },
      {
        label: 'Loading & Progress',
        children: [{ label: 'Loading Indicator', path: '/components/loading-indicator' }],
      },
    ],
  },
  {
    label: 'Styles API',
    icon: 'palette',
    children: [
      { label: 'All Buttons', path: '/styles-api/all-buttons' },
      { label: 'All Styles', path: '/styles-api/all-styles' },
    ],
  },
];

@Component({
  selector: 'app-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatExpansionModule],
  host: { class: 'sidebar-nav' },
  template: `
    <nav aria-label="Documentation navigation" class="py-4 overflow-y-auto">
      <mat-accordion [multi]="true" class="block">
        @for (section of navItems(); track section.label) {
          @if (section.children) {
            <mat-expansion-panel [expanded]="true" class="shadow-none bg-transparent">
              <mat-expansion-panel-header>
                <mat-panel-title class="flex items-center gap-2">
                  @if (section.icon) {
                    <mat-icon class="text-sm opacity-70">{{ section.icon }}</mat-icon>
                  }
                  <span class="text-xs font-semibold uppercase tracking-wider">
                    {{ section.label }}
                  </span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="pl-2">
                @for (item of section.children; track item.label) {
                  @if (item.children) {
                    <p class="text-xs font-medium text-on-surface-variant mt-3 mb-1 px-3">
                      {{ item.label }}
                    </p>
                    @for (child of item.children; track child.label) {
                      @if (child.path) {
                        <a
                          [routerLink]="child.path"
                          routerLinkActive="bg-secondary-container text-on-secondary-container"
                          class="flex items-center rounded-full px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-variant transition-colors no-underline"
                          (click)="linkClicked.emit()"
                        >
                          {{ child.label }}
                        </a>
                      }
                    }
                  } @else if (item.path) {
                    <a
                      [routerLink]="item.path"
                      routerLinkActive="bg-secondary-container text-on-secondary-container"
                      class="flex items-center rounded-full px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-variant transition-colors no-underline"
                      (click)="linkClicked.emit()"
                    >
                      {{ item.label }}
                    </a>
                  }
                }
              </div>
            </mat-expansion-panel>
          } @else if (section.path) {
            <a
              [routerLink]="section.path"
              routerLinkActive="bg-secondary-container text-on-secondary-container"
              class="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors no-underline mx-2"
              (click)="linkClicked.emit()"
            >
              @if (section.icon) {
                <mat-icon class="text-sm">{{ section.icon }}</mat-icon>
              }
              {{ section.label }}
            </a>
          }
        }
      </mat-accordion>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    mat-expansion-panel {
      box-shadow: none !important;
      background: transparent !important;
    }
  `,
})
export class SidebarNavComponent {
  navItems = input<NavItem[]>(PLACEHOLDER_NAV);

  linkClicked = output<void>();
}
