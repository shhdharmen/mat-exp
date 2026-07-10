import { Injectable, signal, effect, inject, DOCUMENT, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.theme() === 'dark';
      this.document.documentElement.classList.toggle(DARK_CLASS, isDark);
      if (isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(STORAGE_KEY, this.theme());
        } catch {
          // localStorage may be unavailable in some environments
        }
      }
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private resolveInitialTheme(): Theme {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
