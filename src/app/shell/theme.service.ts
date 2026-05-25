import { Injectable, signal, effect, inject, DOCUMENT } from '@angular/core';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const isDark = this.theme() === 'dark';
      this.document.documentElement.classList.toggle(DARK_CLASS, isDark);
      try {
        localStorage.setItem(STORAGE_KEY, this.theme());
      } catch {
        // localStorage may be unavailable in some environments
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
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // localStorage unavailable
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
