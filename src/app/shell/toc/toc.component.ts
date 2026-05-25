import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TocItem {
  id: string;
  label: string;
  level: number;
}

@Component({
  selector: 'app-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'toc' },
  template: `
    <nav aria-label="On this page">
      <p class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
        On this page
      </p>
      <ul class="space-y-1 list-none p-0 m-0">
        @for (item of items(); track item.id) {
          <li [style.padding-left.rem]="(item.level - 1) * 0.75">
            <a
              [href]="'#' + item.id"
              class="block text-sm leading-6 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {{ item.label }}
            </a>
          </li>
        } @empty {
          <li class="text-sm text-on-surface-variant opacity-60">No headings found.</li>
        }
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TocComponent {
  items = input<TocItem[]>([]);
}
