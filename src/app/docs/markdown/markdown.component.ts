import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-markdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'markdown-body',
    '(click)': 'onHostClick($event)',
  },
  templateUrl: './markdown.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MarkdownComponent {
  private readonly sanitizer = inject(DomSanitizer);

  html = input.required<string>();

  /**
   * Memoized so `[innerHTML]` only gets a new value when `html()` actually
   * changes. An unmemoized method call here would return a fresh `SafeHtml`
   * wrapper on every change-detection pass — including passes triggered by
   * `onHostClick` bubbling up from a click deep inside embedded interactive
   * content like `<playground-preview>` — making Angular re-assign
   * `innerHTML` and the browser destroy and recreate the whole subtree,
   * wiping out that content's live state (e.g. an open mat-select panel).
   */
  protected readonly safeHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.html()),
  );

  protected onHostClick(event: Event): void {
    const target = event.target as Element;
    const copyBtn = target.closest('.code-block-copy') as HTMLButtonElement | null;
    if (!copyBtn) return;

    const codeBlock = copyBtn.closest('.code-block');
    const codeEl = codeBlock?.querySelector('code');
    if (!codeEl) return;

    const text = codeEl.textContent ?? '';
    this.showCopiedFeedback(copyBtn);
    void navigator.clipboard.writeText(text).catch(() => {
      copyBtn.removeAttribute('data-copied');
    });
  }

  private showCopiedFeedback(btn: HTMLButtonElement): void {
    btn.setAttribute('data-copied', 'true');
    setTimeout(() => btn.removeAttribute('data-copied'), 2000);
  }
}
