import { Directive, inject, input } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatExpFabMenuTriggerColor } from '../../../types/appearance';
import { injectIsMenuOpenSignal } from '../../../utils/menu/inject-menu-open-signal';

@Directive({
  selector: '[matExpFabMenuTrigger]',
  host: {
    '[attr.data-menu-open]': 'isMenuOpen()',
    '[class]': 'matExpFabMenuTriggerClass',
    '[attr.data-color]': 'color()',
  },
})
export class MatExpFabMenuTrigger {
  /**
   * @internal
   */
  public readonly matExpFabMenuTriggerClass = 'mat-exp-fab-menu-trigger';

  /** @default 'primary' */
  public readonly color = input<MatExpFabMenuTriggerColor>('primary');

  private readonly matMenuTrigger = inject(MatMenuTrigger);

  /**
   * @internal
   */
  public readonly isMenuOpen = injectIsMenuOpenSignal(this.matMenuTrigger);
}
