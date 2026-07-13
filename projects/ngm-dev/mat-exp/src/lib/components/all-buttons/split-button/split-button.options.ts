import { matExpCreateOptions } from '../../../utils/di/create-options';
import { type MatExpButtonSize, type MatExpSplitButtonAppearance } from '../../../types';

// export interface MatExpButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpSplitButtonOptions {
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpButtonSize;
  /**
   * The label of the split button.
   *
   * Default: `tonal`
   *
   */
  readonly appearance?: MatExpSplitButtonAppearance;
}

/**
 * @internal
 */
export const MAT_EXP_SPLIT_BUTTON_DEFAULT_OPTIONS: MatExpSplitButtonOptions = {
  size: 's',
  appearance: 'tonal',
};

const _splitButtonOptions = matExpCreateOptions(MAT_EXP_SPLIT_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXP_SPLIT_BUTTON_OPTIONS = _splitButtonOptions.token;
export const provideMatExpSplitButtonOptions = _splitButtonOptions.provide;
export const injectMatExpSplitButtonOptions = _splitButtonOptions.inject;
