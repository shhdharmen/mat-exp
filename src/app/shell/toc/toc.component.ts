import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TocService } from '../../shared/services/toc.service';
import { RouterLink } from '@angular/router';

export type { TocItem } from '../../shared/services/toc.service';

@Component({
  selector: 'app-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toc.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  imports: [RouterLink],
})
export class TocComponent {
  protected readonly tocService = inject(TocService);
  protected readonly items = this.tocService.items;
}
