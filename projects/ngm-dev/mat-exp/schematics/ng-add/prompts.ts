import type { SchematicContext } from '@angular-devkit/schematics';
import { COMPONENT_LABELS, COMPONENT_STYLE_MIXINS } from './constants';
import type { ComponentSelection, NgAddOptions } from './types';

/**
 * `@inquirer/prompts` is ESM-only. Loaded via a dynamic `import()` (never a static top-level
 * import) so it: (a) is only pulled in when a prompt is actually about to run — every
 * explicit-option / non-interactive path in this schematic never touches it — and (b) is
 * resolved as a genuine ES module import rather than downleveled to a synchronous `require()`,
 * which would throw `ERR_REQUIRE_ESM`. This only works correctly because
 * `schematics/tsconfig.schematics.json` targets `"module": "node16"` — under the classic
 * `"module": "commonjs"` setting, TypeScript rewrites dynamic `import()` into a `require()`-based
 * helper for old-bundler compatibility, which would reintroduce the same crash.
 */
// No explicit return type: annotating this as `Promise<typeof import('@inquirer/prompts')>`
// hits TS1542 ("type import of an ECMAScript module from a CommonJS module must have a
// resolution-mode attribute") under `"module": "node16"`, since that syntax is a type-only
// import. Leaving it inferred from the `import()` value expression avoids the issue entirely.
function loadInquirerPrompts() {
  return import('@inquirer/prompts');
}

/**
 * Resolves whether to configure styles at all. Precedence: an explicit `configureStyles` option
 * always wins (this is how non-interactive/CI usage and unit tests drive the "declined" path
 * without needing to fake stdin) — checked before `context.interactive`, so it short-circuits
 * prompting even when the context happens to report itself as interactive (as
 * `SchematicTestRunner` does by default). Falls back to prompting when interactive, otherwise
 * defaults to `true`.
 */
export async function resolveConfigureStyles(
  options: NgAddOptions,
  context: SchematicContext,
): Promise<boolean> {
  if (options.configureStyles !== undefined) {
    return options.configureStyles;
  }
  if (!context.interactive) {
    return true;
  }

  const { confirm } = await loadInquirerPrompts();
  return confirm({
    message: CONFIGURE_STYLES_MESSAGE,
    default: true,
  });
}

/** The exact message shown by the configure-styles confirm prompt — shared with its test. */
export const CONFIGURE_STYLES_MESSAGE =
  "mat-exp: would you like ng-add to configure Mat Expressive's styles automatically?";

/**
 * Resolves which components to include styles for (SCSS projects only). Same explicit-option
 * short-circuit precedence as {@link resolveConfigureStyles}.
 */
export async function resolveComponents(
  options: NgAddOptions,
  context: SchematicContext,
): Promise<ComponentSelection> {
  if (options.components !== undefined) {
    return parseComponentsOption(options.components, context);
  }
  if (!context.interactive) {
    return 'all';
  }

  return promptComponents();
}

/**
 * Parses the `components` option (a string array; each entry may itself be a comma-separated
 * group, since the CLI's array-option parsing collapses `--components=a,b` into a single
 * `['a,b']` entry rather than always splitting per-flag) into a validated component-key list, or
 * `'all'`.
 */
function parseComponentsOption(value: string[], context: SchematicContext): ComponentSelection {
  const requested = value
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (requested.length === 0 || requested.some((entry) => entry.toLowerCase() === 'all')) {
    return 'all';
  }

  const valid = requested.filter((key) => key in COMPONENT_STYLE_MIXINS);
  const invalid = requested.filter((key) => !(key in COMPONENT_STYLE_MIXINS));

  if (invalid.length > 0) {
    context.logger.warn(
      `mat-exp: ignoring unknown component key(s) in "components" option: ` +
        `${invalid.join(', ')}. Valid keys: ${Object.keys(COMPONENT_STYLE_MIXINS).join(', ')}, or "all".`,
    );
  }

  return valid.length > 0 ? valid : 'all';
}

/**
 * Interactive component picker: a real checkbox list (arrow keys to move, space to toggle, "a"
 * to toggle all, enter to confirm) via `@inquirer/prompts`' `checkbox`, not a "type numbers"
 * text prompt. Every component starts checked, so pressing enter immediately is equivalent to
 * "all" — matching the schematic's non-interactive default. Unchecking everything falls back to
 * "all" too, since there's no way to express "no styles" through this picker (declining style
 * setup entirely is a separate, earlier question).
 */
async function promptComponents(): Promise<ComponentSelection> {
  const { checkbox } = await loadInquirerPrompts();
  const choices = buildComponentChoices();

  const selected = await checkbox({
    message: COMPONENT_PICKER_MESSAGE,
    choices,
  });

  return selected.length === 0 || selected.length === choices.length ? 'all' : selected;
}

/** The exact message shown by the component checkbox prompt — shared with its test. */
export const COMPONENT_PICKER_MESSAGE =
  'mat-exp: which components would you like to include styles for?';

/**
 * Builds the `checkbox` prompt's `choices` array — every Button Family component, pre-checked.
 * Exported (in addition to being used by {@link promptComponents}) so tests can drive the exact
 * same choices through `@inquirer/testing`'s `render()` without duplicating/drifting from the
 * real config.
 */
export function buildComponentChoices() {
  return Object.keys(COMPONENT_STYLE_MIXINS).map((key) => ({
    name: COMPONENT_LABELS[key],
    value: key,
    checked: true,
  }));
}
