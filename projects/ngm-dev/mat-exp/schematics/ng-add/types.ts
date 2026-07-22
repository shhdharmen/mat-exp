/**
 * Options accepted by the `ng-add` schematic. Mirrors `schema.json`.
 */
export interface NgAddOptions {
  /** Name of the workspace project to configure. Defaults to the active/default project. */
  project?: string;
  /**
   * Component keys to include styles for (SCSS projects only), or `['all']`. When omitted, the
   * schematic asks (interactive, SCSS only) or defaults to `'all'` (non-interactive).
   */
  components?: string[];
}

/** The set of component keys the SCSS component picker (prompt or `--components`) accepts. */
export type ComponentSelection = string[] | 'all';
