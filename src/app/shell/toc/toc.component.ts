import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TocService } from '../../shared/services/toc.service';

export type { TocItem } from '../../shared/services/toc.service';

@Component({
  selector: 'app-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toc' },
  templateUrl: './toc.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TocComponent {
  private readonly router = inject(Router);
  protected readonly tocService = inject(TocService);
  protected readonly items = this.tocService.items;

  protected fragmentHref(fragment: string): string {
    const tree = this.router.parseUrl(this.router.url);
    tree.fragment = fragment;
    return this.router.serializeUrl(tree);
  }

  protected scrollToFragment(event: Event, fragment: string): void {
    event.preventDefault();
    document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    void this.router.navigate([], { fragment, replaceUrl: true });
  }
}
