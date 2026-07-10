import { Directive, inject, input } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatExpressiveFabMenuTriggerColor } from '../../../types/appearance';
import { injectIsMenuOpenSignal } from '../../../utils/menu/inject-menu-open-signal';

@Directive({
  selector: '[matExpressiveFabMenuTrigger]',
  host: {
    '[attr.data-menu-open]': 'isMenuOpen()',
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

  /**
   * @internal
   */
  public readonly isMenuOpen = injectIsMenuOpenSignal(this.matMenuTrigger);
}
