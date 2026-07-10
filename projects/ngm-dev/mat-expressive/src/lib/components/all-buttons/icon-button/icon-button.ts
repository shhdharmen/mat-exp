import { Directive, inject, Input, input, model } from '@angular/core';
import { injectMatExpressiveIconButtonOptions } from './icon-button.options';
import { MatIconButton } from '@angular/material/button';
import { MatExpressiveSelectableButton } from '../selectable-button/selectable-button';
import { MatExpressiveButtonGroup } from '../button-group';
import { MatExpressiveButtonToggle, MatExpressiveIconButtonAppearance } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';
/**
 * Directive to style the Angular Material Icon Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpressiveIconButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-width]': 'width()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[class]': 'matExpressiveIconButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpressiveIconButton',
})
export class MatExpressiveIconButton implements MatExpressiveSelectableButton {
  private readonly _options = injectMatExpressiveIconButtonOptions();

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'round' */
  public readonly shape = model(this._options.shape);
  public readonly width = input(this._options.width);
  public readonly toggle = model<MatExpressiveButtonToggle | undefined>(this._options.toggle);
  public readonly value = model<unknown>();

  private _appearance = this._options.appearance;
  @Input()
  get appearance(): MatExpressiveIconButtonAppearance | undefined {
    return this._appearance;
  }
  set appearance(appearance: MatExpressiveIconButtonAppearance | undefined) {
    this._appearance = appearance;
  }
  /**
   * @internal
   */
  public readonly matExpressiveIconButtonClass = 'mat-expressive-icon-button';

  /**
   * @internal
   */
  public readonly state = input(this._options.state);

  get disabled(): boolean {
    return this.matIconButton.disabled;
  }
  set disabled(disabled: boolean | undefined) {
    this.matIconButton.disabled = disabled;
  }

  private readonly matIconButton = inject(MatIconButton);
  private readonly buttonGroup = inject(MatExpressiveButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }

  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
