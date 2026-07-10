export type MatExpressiveButtonGroupSelectionSingleSelect = 'single-select';
export type MatExpressiveButtonGroupSelectionMultiSelect = 'multi-select';
// Reserved for a not-yet-implemented "at least one option must stay selected"
// mode. `select-required` is already whitelisted in `$known-attributes`
// (styles/utils/_constants.scss) so the style tokens exist ahead of the
// button-group selection input + CVA behavior that would use them.
// export type MatExpressiveButtonGroupSelectionRequired = 'select-required';
export type MatExpressiveButtonGroupSelection =
  | MatExpressiveButtonGroupSelectionSingleSelect
  | MatExpressiveButtonGroupSelectionMultiSelect;
// | MatExpressiveButtonGroupSelectionRequired;
