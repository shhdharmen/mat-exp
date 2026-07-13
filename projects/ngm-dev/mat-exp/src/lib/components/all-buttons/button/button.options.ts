import { matExpCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpButtonShape,
  type MatExpButtonState,
  type MatExpButtonSize,
  MatExpButtonToggle,
} from '../../../types';

// export interface MatExpButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpButtonOptions {
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpButtonSize;
  /**
   * The shape of the button.
   *
   * Default: `round`
   *
   */
  readonly shape?: MatExpButtonShape;
  /**
   * The toggle state of the button.
   */
  readonly toggle?: MatExpButtonToggle;
  /**
   * @internal
   */
  readonly state?: MatExpButtonState;
  /**
   * The class to be applied to the button. Should be same as [`mat-exp-button-class` style option](/components/all-buttons/button/styling#mat-exp-button-class)
   *
   * Default: `mat-exp-button`
   *
   */
  // readonly matExpButtonClass?: string;
}

/**
 * @internal
 */
export const MAT_EXP_BUTTON_DEFAULT_OPTIONS: MatExpButtonOptions = {
  size: 's',
  shape: 'round',
  // matExpButtonClass: 'mat-exp-button',
};

const _buttonOptions = matExpCreateOptions(MAT_EXP_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXP_BUTTON_OPTIONS = _buttonOptions.token;
export const provideMatExpButtonOptions = _buttonOptions.provide;
export const injectMatExpButtonOptions = _buttonOptions.inject;
