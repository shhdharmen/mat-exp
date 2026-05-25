import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { HeaderComponent } from './header/header.component';
import { SidebarNavComponent } from './sidebar-nav/sidebar-nav.component';
import { TocComponent } from './toc/toc.component';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    HeaderComponent,
    SidebarNavComponent,
    TocComponent,
  ],
  host: { class: 'shell' },
  template: `
    <div class="flex flex-col h-screen">
      <!-- Top header bar -->
      <app-header (menuToggled)="drawerOpen.set(!drawerOpen())" />

      <!-- Body: sidebar + content + TOC -->
      <mat-drawer-container class="flex-1 overflow-hidden" autosize>
        <!-- Mobile drawer (md and below) -->
        <mat-drawer
          [opened]="drawerOpen()"
          mode="over"
          class="w-64 lg:hidden"
          (closedStart)="drawerOpen.set(false)"
        >
          <app-sidebar-nav (linkClicked)="drawerOpen.set(false)" />
        </mat-drawer>

        <mat-drawer-content class="flex overflow-hidden">
          <!-- Persistent sidebar (lg and above) -->
          <aside
            class="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 border-r border-outline-variant overflow-y-auto"
            aria-label="Documentation navigation"
          >
            <app-sidebar-nav />
          </aside>

          <!-- Main content area -->
          <main
            class="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full"
            id="main-content"
            tabindex="-1"
          >
            <router-outlet />
          </main>

          <!-- Right TOC (lg and above) -->
          <aside
            class="hidden lg:block w-52 xl:w-60 shrink-0 overflow-y-auto px-4 py-8 border-l border-outline-variant"
            aria-label="On this page"
          >
            <app-toc />
          </aside>
        </mat-drawer-content>
      </mat-drawer-container>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
})
export class ShellComponent {
  protected readonly drawerOpen = signal(false);
}
