import { Directive, ElementRef, inject, input, effect } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { MatExpFabMenuColor } from '../../../types/appearance';

@Directive({
  selector: '[matExpFabMenu]',
})
export class MatExpFabMenu {
  /** @default 'primary' */
  readonly color = input<MatExpFabMenuColor>('primary');
  /**
   * @internal
   */
  public readonly matExpFabMenuClass = 'mat-exp-fab-menu';

  private readonly matMenu = inject(MatMenu, { optional: true });

  /**
   * The consumer's original panel class, captured once before any mutation, so it can be
   * preserved every time `panelClass` is recomputed from scratch on `color()` changes.
   *
   * `MatMenu.panelClass` is a setter-only accessor — it always reads back as `undefined` — and
   * `MatMenu.classList`'s getter just re-reads `panelClass` internally, so it is equally
   * unreadable. The host element's native `class` attribute is read instead: Angular applies the
   * `class` input (aliased to `panelClass` on `mat-menu`) during the "update" pass, which runs
   * only after every directive on this node has finished constructing, so this field initializer
   * always sees the pristine, consumer-authored value before `MatMenu` clears the host element's
   * `className` as a side effect of its own `panelClass` setter.
   */
  private readonly originalPanelClass = inject(ElementRef).nativeElement.getAttribute('class');

  constructor() {
    effect(() => {
      if (this.matMenu) {
        this.matMenu.panelClass = [
          this.originalPanelClass,
          this.matExpFabMenuClass,
          `mat-exp-fab-menu-${this.color()}`,
        ]
          .filter(Boolean)
          .join(' ');
      }
    });
  }
}
