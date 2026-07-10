import { Directive, inject, input, model } from '@angular/core';
import { injectMatExpressiveButtonOptions } from './button.options';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatExpressiveButtonGroup } from '../button-group';
import { MatExpressiveSelectableButton } from '../selectable-button/selectable-button';
import { MatExpressiveButtonToggle } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';

/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpressiveButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[class]': 'matExpressiveButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpressiveButton',
})
export class MatExpressiveButton implements MatExpressiveSelectableButton {
  private readonly _options = injectMatExpressiveButtonOptions();

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'round' */
  public readonly shape = model(this._options.shape);
  public readonly toggle = model<MatExpressiveButtonToggle | undefined>(this._options.toggle);
  public readonly value = model<unknown>();

  /**
   * @internal
   */
  public readonly matExpressiveButtonClass = 'mat-expressive-button';

  /**
   * @internal
   */
  public readonly state = input(this._options.state);

  get appearance(): MatButtonAppearance | null {
    return this.matButton.appearance;
  }
  set appearance(appearance: MatButtonAppearance) {
    this.matButton.appearance = appearance;
  }

  get disabled(): boolean {
    return this.matButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matButton.disabled = disabled;
  }

  private readonly matButton = inject(MatButton);
  private readonly buttonGroup = inject(MatExpressiveButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }
  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
