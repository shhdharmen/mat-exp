import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  host: { class: 'header' },
  template: `
    <div class="flex items-center h-14 px-4 gap-4 border-b border-outline-variant">
      <!-- Hamburger for mobile sidebar -->
      <button
        mat-icon-button
        class="lg:hidden"
        aria-label="Open navigation"
        (click)="menuToggled.emit()"
      >
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Logo / wordmark -->
      <a href="/" class="flex items-center gap-2 font-semibold text-on-surface no-underline">
        <!-- Logo placeholder -->
        <span
          class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold"
          aria-hidden="true"
          >M</span
        >
        <span class="hidden sm:inline">Mat Expressive</span>
      </a>

      <div class="flex-1"></div>

      <!-- Version switcher placeholder -->
      <span
        class="hidden md:inline-flex items-center rounded-full border border-outline-variant px-2.5 py-0.5 text-xs text-on-surface-variant"
        aria-label="Version"
      >
        v0.0.0
      </span>

      <!-- Theme toggle -->
      <button
        mat-icon-button
        [matTooltip]="
          themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        "
        [attr.aria-label]="
          themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        "
        (click)="themeService.toggle()"
      >
        <mat-icon>{{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <!-- GitHub link -->
      <a
        href="https://github.com/Angular-Material-Dev/mat-expressive"
        mat-icon-button
        target="_blank"
        rel="noopener noreferrer"
        matTooltip="View on GitHub"
        aria-label="View on GitHub"
      >
        <mat-icon>code</mat-icon>
      </a>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--mat-sys-surface);
    }
  `,
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);

  menuToggled = output<void>();
}
