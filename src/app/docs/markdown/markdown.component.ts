import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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

  protected safeHtml() {
    return this.sanitizer.bypassSecurityTrustHtml(this.html());
  }

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
