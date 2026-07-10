import { Directive, inject, input } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveFabMenuTriggerColor } from '../../../types/appearance';

@Directive({
  selector: '[matExpressiveFabMenuTrigger]',
  host: {
    '[attr.data-menu-open]': 'isMenuOpen',
    '[class]': 'matExpressiveFabMenuTriggerClass',
    '[attr.data-color]': 'color()',
  },
})
export class MatExpressiveFabMenuTrigger {
  /**
   * @internal
   */
  public readonly matExpressiveFabMenuTriggerClass = 'mat-expressive-fab-menu-trigger';

  /** @default 'primary' */
  public readonly color = input<MatExpressiveFabMenuTriggerColor>('primary');

  private readonly matMenuTrigger = inject(MatMenuTrigger);

  get isMenuOpen(): boolean {
    return this.matMenuTrigger?.menuOpen ?? false;
  }
}
