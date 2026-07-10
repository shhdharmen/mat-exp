import { Directive, inject, input, effect } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { MatExpressiveFabMenuColor } from '../../../types/appearance';

@Directive({
  selector: '[matExpressiveFabMenu]',
})
export class MatExpressiveFabMenu {
  /** @default 'primary' */
  readonly color = input<MatExpressiveFabMenuColor>('primary');
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuClass = 'mat-expressive-fab-menu';

  private readonly matMenu = inject(MatMenu, { optional: true });

  /**
   * The consumer's original `panelClass`, captured once before any mutation, so it can be
   * preserved every time `panelClass` is recomputed from scratch on `color()` changes.
   */
  private readonly originalPanelClass = this.matMenu?.panelClass;

  constructor() {
    effect(() => {
      if (this.matMenu) {
        this.matMenu.panelClass = [
          this.originalPanelClass,
          this.matExpressiveFabMenuClass,
          `mat-expressive-fab-menu-${this.color()}`,
        ]
          .filter(Boolean)
          .join(' ');
      }
    });
  }
}
