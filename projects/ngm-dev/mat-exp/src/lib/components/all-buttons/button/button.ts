import { Directive, computed, inject, input, model } from '@angular/core';
import { injectMatExpButtonOptions } from './button.options';
import { MatButton, MatButtonAppearance } from '@angular/material/button';
import { MatExpButtonGroup } from '../button-group';
import { MatExpSelectableButton } from '../selectable-button/selectable-button';
import { MatExpButtonToggle } from '../../../types';
import { MatMenuTrigger } from '@angular/material/menu';

/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Directive({
  selector: '[matExpButton]',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-state]': 'state()',
    '[attr.data-toggle]': 'toggle()',
    '[attr.data-menu-open]': 'isMenuOpen',
    '[attr.aria-pressed]': 'ariaPressed()',
    '[class]': 'matExpButtonClass',
    '(click)': '_onButtonClick()',
  },
  exportAs: 'matExpButton',
})
export class MatExpButton implements MatExpSelectableButton {
  private readonly _options = injectMatExpButtonOptions();

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'round' */
  public readonly shape = model(this._options.shape);
  public readonly toggle = model<MatExpButtonToggle | undefined>(this._options.toggle);
  public readonly value = model<unknown>();

  /**
   * `aria-pressed`, derived from `toggle()`. `null` when the button does not
   * participate in toggle behavior, so the attribute is omitted entirely
   * rather than rendered as `aria-pressed="false"` (its mere presence changes
   * how assistive technology announces the control).
   * @internal
   */
  public readonly ariaPressed = computed(() => {
    const toggle = this.toggle();
    return toggle === undefined ? null : toggle === 'selected' ? 'true' : 'false';
  });

  /**
   * @internal
   */
  public readonly matExpButtonClass = 'mat-exp-button';

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
  private readonly buttonGroup = inject(MatExpButtonGroup, { optional: true });

  _onButtonClick(): void {
    this.buttonGroup?._onButtonClick(this);
  }
  private readonly matMenu = inject(MatMenuTrigger, { optional: true });

  get isMenuOpen(): boolean {
    return this.matMenu?.menuOpen ?? false;
  }
}
