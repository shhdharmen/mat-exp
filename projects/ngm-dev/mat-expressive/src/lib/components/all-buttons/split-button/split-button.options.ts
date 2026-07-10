import { matExpressiveCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpressiveButtonSize,
  type MatExpressiveSplitButtonAppearance,
} from '../../../types';

// export interface MatExpressiveButtonOptions extends MatExpressinveAppearanceOptions {
export interface MatExpressiveSplitButtonOptions {
  /**
   * The size of the button.
   *
   * Default: `s`
   *
   */
  readonly size?: MatExpressiveButtonSize;
  /**
   * The label of the split button.
   *
   * Default: `tonal`
   *
   */
  readonly appearance?: MatExpressiveSplitButtonAppearance;
}

/**
 * @internal
 */
export const MAT_EXPRESSIVE_SPLIT_BUTTON_DEFAULT_OPTIONS: MatExpressiveSplitButtonOptions = {
  size: 's',
  appearance: 'tonal',
};

const _splitButtonOptions = matExpressiveCreateOptions(MAT_EXPRESSIVE_SPLIT_BUTTON_DEFAULT_OPTIONS);

export const MAT_EXPRESSIVE_SPLIT_BUTTON_OPTIONS = _splitButtonOptions.token;
export const provideMatExpressiveSplitButtonOptions = _splitButtonOptions.provide;
export const injectMatExpressiveSplitButtonOptions = _splitButtonOptions.inject;
