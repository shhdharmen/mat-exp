/** The `@use` line that must precede any other Sass rule in the global stylesheet. */
export const USE_STATEMENT = `@use '@ngm-dev/mat-expressive' as mat-expressive;`;

/** The prebuilt CSS entry point added to `angular.json`'s `styles` array for CSS projects. */
export const CSS_STYLES_ENTRY = '@ngm-dev/mat-expressive/styles.css';

export const GETTING_STARTED_URL =
  'https://expressive.angular-material.dev/docs/getting-started/installation';

/**
 * Maps the `components` option / picker keys to their Sass style mixin, in the order they're
 * offered in the component picker prompt. Verified against
 * `projects/ngm-dev/mat-expressive/src/lib/styles/components/all-buttons/**\/_index.scss`.
 */
export const COMPONENT_STYLE_MIXINS: Record<string, string> = {
  button: 'mat-expressive-button-styles',
  'icon-button': 'mat-expressive-icon-button-styles',
  'button-group': 'mat-expressive-button-group-styles',
  'split-button': 'mat-expressive-split-button-styles',
  'fab-menu': 'mat-expressive-fab-menu-styles',
  'fab-menu-trigger': 'mat-expressive-fab-menu-trigger-styles',
};

/** Human-readable labels for the component picker prompt, keyed the same as `COMPONENT_STYLE_MIXINS`. */
export const COMPONENT_LABELS: Record<string, string> = {
  button: 'Button',
  'icon-button': 'Icon Button',
  'button-group': 'Button Group',
  'split-button': 'Split Button',
  'fab-menu': 'FAB Menu',
  'fab-menu-trigger': 'FAB Menu Trigger',
};

/**
 * Matches the leading run of `@use`/`@forward` statements (plus any interleaved blank lines or
 * comments) at the very start of a Sass file. Sass requires all `@use`/`@forward` rules to
 * precede every other rule in the stylesheet, so this is used to find the exact position where
 * it's safe to insert another `@use` statement (and the first rule that depends on it) without
 * pushing any pre-existing `@use` rule below a non-`@use` rule.
 */
export const LEADING_USE_FORWARD_BLOCK =
  /^(?:[ \t]*\r?\n|[ \t]*\/\/[^\n]*\r?\n|[ \t]*\/\*[\s\S]*?\*\/[ \t]*\r?\n|[ \t]*@(?:use|forward)\b[^;]*;[ \t]*\r?\n?)+/;
