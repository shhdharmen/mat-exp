import { matExpCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpButtonShape,
  type MatExpButtonState,
  type MatExpButtonSize,
  MatExpButtonToggle,
  type MatExpIconButtonWidth,
  MatExpIconButtonAppearance,
} from '../../../types';

export interface MatExpIconButtonOptions {
  /**
   * The appearance of the icon button.
   *
   * Default: `text`
   *
   */
  readonly appearance?: MatExpIconButtonAppearance;
  /**
   * The size of the icon button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpButtonSize;
  /**
   * The shape of the icon button.
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
   * The width of the icon button.
   */
  readonly width?: MatExpIconButtonWidth;
  /**
   * @internal
   */
  readonly state?: MatExpButtonState;
  /**
   * The class to be applied to the icon button. Should be same as [`mat-exp-icon-button-class` style option](/components/all-buttons/icon-button/styling#mat-exp-icon-button-class)
   *
   * Default: `mat-exp-icon-button`
   *
   */
  // readonly matExpIconButtonClass?: string;
}

/**
 * @internal
 */
export const MAT_EXP_ICON_BUTTON_DEFAULT_OPTIONS: MatExpIconButtonOptions = {
  size: 's',
  shape: 'round',
  width: 'default',
  appearance: 'text',
  // matExpIconButtonClass: 'mat-exp-icon-button',
};

const _iconButtonOptions = matExpCreateOptions(MAT_EXP_ICON_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXP_ICON_BUTTON_OPTIONS = _iconButtonOptions.token;
export const provideMatExpIconButtonOptions = _iconButtonOptions.provide;
export const injectMatExpIconButtonOptions = _iconButtonOptions.inject;
