import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Signal,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { pendingUntilEvent, toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, from, map, of, switchMap } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatExpressiveButton } from '@ngm-dev/mat-expressive';
import { GlobalMetadata, NgxMetaService } from '@davidlj95/ngx-meta/core';
import { JsonLdMetadata } from '@davidlj95/ngx-meta/json-ld';
import { MarkdownComponent } from '../docs/markdown/markdown.component';
import { MarkdownService, parseFrontmatter } from '../shared/services/markdown.service';
import { breadcrumbListJsonLd, webPageJsonLd, withBaseJsonLd } from '../shared/utils/json-ld';

@Component({
  selector: 'app-static-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarkdownComponent, MatButton, MatExpressiveButton],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-12">
      @if (content(); as c) {
        @if (c.title) {
          <h1 class="doc-page-title">{{ c.title }}</h1>
        }
        <div class="markdown-actions">
          <a
            matButton="outlined"
            matExpressiveButton
            shape="square"
            size="xs"
            [href]="rawMarkdownUrl"
            target="_blank"
            rel="noopener"
            >View markdown</a
          >
          <button
            matButton="outlined"
            matExpressiveButton
            size="xs"
            shape="square"
            (click)="copyMarkdown()"
          >
            {{ copied() ? 'Copied!' : 'Copy markdown' }}
          </button>
        </div>
        <app-markdown [html]="c.html" />
      }
    </div>
  `,
  styles: `
    .doc-page-title {
      font: var(--mat-sys-headline-large);
      margin-bottom: 1.5rem;
    }
    .markdown-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
  `,
})
export class StaticPageComponent {
  private readonly http = inject(HttpClient);
  private readonly markdownService = inject(MarkdownService);
  private readonly injector = inject(Injector);
  private readonly ngxMetaService = inject(NgxMetaService);

  protected readonly rawMarkdownUrl: string;
  protected readonly copied = signal(false);
  protected readonly content: Signal<{
    title: string;
    description: string | null;
    html: string;
  } | null>;

  constructor() {
    const routePath = inject(Router).url.split('?')[0].split('#')[0];
    this.rawMarkdownUrl = `${routePath}/index.md`;
    this.content = toSignal(
      this.http.get(this.rawMarkdownUrl, { responseType: 'text' }).pipe(
        switchMap((raw) => {
          const { frontmatter, body } = parseFrontmatter(raw);
          const title = (frontmatter['title'] as string | undefined) ?? '';
          const description = (frontmatter['description'] as string | undefined) ?? null;
          return from(this.markdownService.renderMarkdown(body)).pipe(
            map((html) => ({ title, description, html })),
          );
        }),
        catchError(() => of({ title: '', description: null, html: '' })),
        pendingUntilEvent(this.injector),
      ),
      { initialValue: null },
    );

    effect(() => {
      const c = this.content();
      if (!c || !c.title) return;
      this.ngxMetaService.set({
        title: c.title,
        description: c.description,
        jsonLd: withBaseJsonLd(
          breadcrumbListJsonLd([
            { name: 'Mat Expressive', path: '/' },
            { name: c.title, path: routePath },
          ]),
          webPageJsonLd({
            name: c.title,
            description: c.description,
            path: routePath,
          }),
        ),
      } satisfies GlobalMetadata & JsonLdMetadata);
    });
  }

  protected copyMarkdown(): void {
    void firstValueFrom(this.http.get(this.rawMarkdownUrl, { responseType: 'text' })).then(
      async (text) => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // clipboard write unavailable in some browser/permission contexts
        }
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      },
    );
  }
}
