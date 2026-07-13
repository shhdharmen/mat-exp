import { matExpCreateOptions } from '../../../utils/di/create-options';
import {
  MatExpButtonGroupSelection,
  MatExpButtonGroupShape,
  MatExpButtonGroupVariant,
  type MatExpButtonGroupSize,
  type MatExpButtonGroupAppearance,
} from '../../../types';

// export interface MatExpButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpButtonGroupOptions {
  /**
   * The appearance of the buttons.
   *
   */
  readonly appearance?: MatExpButtonGroupAppearance;
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpButtonGroupSize;
  /**
   * The shape of the buttons.
   *
   * Default: `round`
   *
   */
  readonly shape?: MatExpButtonGroupShape;
  /**
   * The selection of the button group.
   */
  readonly selection?: MatExpButtonGroupSelection;
  /**
   * The variant of the button group.
   *
   * Default: `standard`
   *
   */
  readonly variant?: MatExpButtonGroupVariant;
  /**
   * The disabled state of the button group.
   *
   * Default: `false`
   *
   */
  readonly disabled?: boolean;
  /**
   * The class to be applied to the button group. Should be same as [`mat-exp-button-group-class` style option](/components/all-buttons/button-group/styling#mat-exp-button-group-class)
   *
   * Default: `mat-exp-button-group`
   *
   */
  // readonly matExpButtonGroupClass?: string;
}

/**
 * @internal
 */
export const MAT_EXP_BUTTON_GROUP_DEFAULT_OPTIONS: MatExpButtonGroupOptions = {
  size: 's',
  shape: 'round',
  variant: 'standard',
  selection: 'single-select',
  // matExpButtonGroupClass: 'mat-exp-button-group',
};

const _buttonGroupOptions = matExpCreateOptions(MAT_EXP_BUTTON_GROUP_DEFAULT_OPTIONS);

export const MAT_EXP_BUTTON_GROUP_OPTIONS = _buttonGroupOptions.token;
export const provideMatExpButtonGroupOptions = _buttonGroupOptions.provide;
export const injectMatExpButtonGroupOptions = _buttonGroupOptions.inject;
