export type MatExpButtonGroupSelectionSingleSelect = 'single-select';
export type MatExpButtonGroupSelectionMultiSelect = 'multi-select';
// Reserved for a not-yet-implemented "at least one option must stay selected"
// mode. `select-required` is already whitelisted in `$known-attributes`
// (styles/utils/_constants.scss) so the style tokens exist ahead of the
// button-group selection input + CVA behavior that would use them.
// export type MatExpButtonGroupSelectionRequired = 'select-required';
export type MatExpButtonGroupSelection =
  | MatExpButtonGroupSelectionSingleSelect
  | MatExpButtonGroupSelectionMultiSelect;
// | MatExpButtonGroupSelectionRequired;
