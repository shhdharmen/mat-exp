import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, from, map } from 'rxjs';
import { MarkdownService } from '../services/markdown.service';

/** Renders a markdown string to sanitized HTML. Use as `text | markdown | async`. */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  private readonly markdownService = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);

  transform(text: string | null | undefined): Observable<SafeHtml> | null {
    if (!text) return null;
    return from(this.markdownService.renderMarkdown(text)).pipe(
      map((html) => this.sanitizer.bypassSecurityTrustHtml(html)),
    );
  }
}
