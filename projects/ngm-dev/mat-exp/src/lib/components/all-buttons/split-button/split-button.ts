import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  model,
} from '@angular/core';
import { injectMatExpSplitButtonOptions } from './split-button.options';
import { MatExpIconButton } from '../icon-button';
import { MatExpButton } from '../button';
import {
  bindButtonGroupChildren,
  toButtonGroupChild,
} from '../button-group-child/button-group-child';

/**
 * Component to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Component({
  selector: 'mat-exp-split-button',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-appearance]': 'appearance()',
    '[class]': 'matExpSplitButtonClass',
  },
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatExpSplitButton {
  private readonly _options = injectMatExpSplitButtonOptions();

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'tonal' */
  public readonly appearance = model(this._options.appearance);

  /**
   * @internal
   */
  public readonly matExpSplitButtonClass = 'mat-exp-split-button';

  readonly _matExpButtons = contentChildren<MatExpButton>(MatExpButton);
  readonly _matExpIconButtons = contentChildren<MatExpIconButton>(MatExpIconButton);
  readonly _allExpressiveButtons = computed(() => [
    ...this._matExpButtons(),
    ...this._matExpIconButtons(),
  ]);

  /**
   * `_allExpressiveButtons` adapted to the narrow `ButtonGroupChild` contract, used to
   * broadcast `size`/`appearance` without depending on the concrete button directive types.
   * @internal
   */
  readonly _allButtonGroupChildren = computed(() =>
    this._allExpressiveButtons().map(toButtonGroupChild),
  );

  constructor() {
    // Broadcast `size`/`appearance` down to the projected buttons via the narrow
    // `ButtonGroupChild` contract (shared with `MatExpButtonGroup`).
    bindButtonGroupChildren({
      children: this._allButtonGroupChildren,
      size: this.size,
      appearance: this.appearance,
    });
  }
}
