import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  model,
} from '@angular/core';
import { injectMatExpressiveSplitButtonOptions } from './split-button.options';
import { MatExpressiveIconButton } from '../icon-button';
import { MatExpressiveButton } from '../button';
import {
  bindButtonGroupChildren,
  toButtonGroupChild,
} from '../button-group-child/button-group-child';

/**
 * Component to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Component({
  selector: 'mat-expressive-split-button',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-appearance]': 'appearance()',
    '[class]': 'matExpressiveSplitButtonClass',
  },
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatExpressiveSplitButton {
  private readonly _options = injectMatExpressiveSplitButtonOptions();

  /** @default 's' */
  public readonly size = model(this._options.size);
  /** @default 'tonal' */
  public readonly appearance = model(this._options.appearance);

  /**
   * @internal
   */
  public readonly matExpressiveSplitButtonClass = 'mat-expressive-split-button';

  readonly _matExpressiveButtons = contentChildren<MatExpressiveButton>(MatExpressiveButton);
  readonly _matExpressiveIconButtons =
    contentChildren<MatExpressiveIconButton>(MatExpressiveIconButton);
  readonly _allExpressiveButtons = computed(() => [
    ...this._matExpressiveButtons(),
    ...this._matExpressiveIconButtons(),
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
    // `ButtonGroupChild` contract (shared with `MatExpressiveButtonGroup`).
    bindButtonGroupChildren({
      children: this._allButtonGroupChildren,
      size: this.size,
      appearance: this.appearance,
    });
  }
}
