import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChildren,
  effect,
  EventEmitter,
  forwardRef,
  inject,
  InjectionToken,
  Input,
  input,
  model,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS } from './button-group.options';
import { MatExpressiveButton } from '../button';
import { MatExpressiveIconButton } from '../icon-button';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatExpressiveSelectableButton,
  MatExpressiveSelectableButtonChange,
} from '../selectable-button/selectable-button';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Injection token that can be used to reference instances of `MatExpressiveButtonGroup`.
 * It serves as alternative token to the actual `MatExpressiveButtonGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const MAT_EXPRESSIVE_BUTTON_GROUP = new InjectionToken<MatExpressiveButtonGroup>(
  'MatExpressiveButtonGroup',
);

/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_EXPRESSIVE_BUTTON_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatExpressiveButtonGroup),
  multi: true,
};

/**
 * Directive to style the Angular Material Button component with latest Material 3 Design System Expressive styles.
 */
@Component({
  selector: 'mat-expressive-button-group',
  providers: [
    MAT_EXPRESSIVE_BUTTON_GROUP_VALUE_ACCESSOR,
    { provide: MAT_EXPRESSIVE_BUTTON_GROUP, useExisting: MatExpressiveButtonGroup },
  ],
  templateUrl: './button-group.html',
  styleUrls: ['./button-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'matExpressiveButtonGroupClass',
    '[attr.data-variant]': 'variant()',
    '[attr.data-selection]': 'selection()',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class MatExpressiveButtonGroup {
  public readonly size = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).size);
  public readonly shape = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).shape);
  public readonly selection = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).selection);
  public readonly variant = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).variant);
  public readonly appearance = input(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).appearance);
  public readonly disabled = model(inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS).disabled);
  /**
   * @internal
   */
  public readonly matExpressiveButtonGroupClass = inject(MAT_EXPRESSIVE_BUTTON_GROUP_OPTIONS)
    .matExpressiveButtonGroupClass;

  readonly _matExpressiveButtons = contentChildren<MatExpressiveButton>(MatExpressiveButton);
  readonly _matExpressiveIconButtons =
    contentChildren<MatExpressiveIconButton>(MatExpressiveIconButton);
  private _selectionModel!: SelectionModel<MatExpressiveSelectableButton>;

  constructor() {
    afterNextRender(() => {
      this._selectionModel = new SelectionModel<MatExpressiveSelectableButton>(
        this.selection() === 'multi-select',
        undefined,
        false,
      );
    });
    effect(() => {
      const size = this.size();

      if (size) {
        this._matExpressiveButtons().forEach((button) => {
          button.size.set(size);
        });
        this._matExpressiveIconButtons().forEach((iconButton) => {
          iconButton.size.set(size);
        });
      }
    });
    effect(() => {
      const shape = this.shape();

      if (shape) {
        this._matExpressiveButtons().forEach((button) => {
          button.shape.set(shape);
        });
      }
      this._matExpressiveIconButtons().forEach((iconButton) => {
        iconButton.shape.set(shape);
      });
    });
    effect(() => {
      const appearance = this.appearance();

      if (appearance) {
        this._matExpressiveButtons().forEach((button) => {
          button.appearance = appearance;
        });
      }
      this._matExpressiveIconButtons().forEach((iconButton) => {
        iconButton.appearance.set(appearance === 'elevated' ? 'filled' : appearance);
      });
    });
    effect(() => {
      const disabled = this.disabled();

      this._matExpressiveButtons().forEach((button) => {
        button.disabled = disabled;
      });
      this._matExpressiveIconButtons().forEach((iconButton) => {
        iconButton.disabled = disabled;
      });
    });
  }
}
