import { matExpCreateOptions } from '../../../utils/di/create-options';
import {
  type MatExpLoadingIndicatorConfig,
  type MatExpLoadingIndicatorSpeed,
} from '../../../types';

export interface MatExpLoadingIndicatorOptions {
  /**
   * The config of the loading indicator.
   *
   * Default: `default`
   *
   */
  readonly config?: MatExpLoadingIndicatorConfig;

  /**
   * The accessible label announced to assistive technologies when the loading
   * indicator is displayed.
   *
   * Default: `Loading`
   */
  readonly ariaLabel?: string;

  /**
   * Speed preset for the shape morph and rotation animation. Each preset maps
   * to one of the M3 Expressive spatial spring tokens:
   *
   * - `fast`    – Expressive fast spatial    – `cubic-bezier(0.42, 1.67, 0.21, 0.90)`, 350ms per morph step.
   * - `default` – Expressive default spatial – `cubic-bezier(0.38, 1.21, 0.22, 1.00)`, 500ms per morph step.
   * - `slow`    – Expressive slow spatial    – `cubic-bezier(0.39, 1.29, 0.35, 0.98)`, 650ms per morph step.
   *
   * Default: `fast` – matches the original M3 spec for the loading indicator.
   */
  readonly speed?: MatExpLoadingIndicatorSpeed;
}

/**
 * @internal
 */
export const MAT_EXP_LOADING_INDICATOR_DEFAULT_OPTIONS: MatExpLoadingIndicatorOptions = {
  config: 'default',
  ariaLabel: 'Loading',
  speed: 'default',
};

const _loadingIndicatorOptions = matExpCreateOptions(MAT_EXP_LOADING_INDICATOR_DEFAULT_OPTIONS);

export const MAT_EXP_LOADING_INDICATOR_OPTIONS = _loadingIndicatorOptions.token;
export const provideMatExpLoadingIndicatorOptions = _loadingIndicatorOptions.provide;
export const injectMatExpLoadingIndicatorOptions = _loadingIndicatorOptions.inject;
