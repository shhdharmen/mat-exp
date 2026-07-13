import { Directive, inject, input, effect } from '@angular/core';
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
   * The consumer's original `panelClass`, captured once before any mutation, so it can be
   * preserved every time `panelClass` is recomputed from scratch on `color()` changes.
   */
  private readonly originalPanelClass = this.matMenu?.panelClass;

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
