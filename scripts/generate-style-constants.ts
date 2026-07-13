/**
 * Build script: generates the SCSS attribute-value map consumed by
 * `_constants.scss` from the TypeScript unions that define each button
 * attribute's allowed values.
 *
 * Usage: tsx scripts/generate-style-constants.ts
 *
 * Why this exists (see issue #102):
 * The same set of string literals (size, shape, state, toggle, width,
 * appearance) used to be enumerated independently in TypeScript unions
 * (`projects/ngm-dev/mat-exp/src/lib/types/*.ts`) AND hand-copied
 * into `$known-attributes` / `$state-pseudo-map` in
 * `projects/ngm-dev/mat-exp/src/lib/styles/utils/_constants.scss`.
 * Nothing checked these stayed in sync, so renaming a TS union member
 * compiled cleanly while silently breaking the SCSS validation whitelist.
 *
 * This script makes the TypeScript unions the single source of truth: it
 * parses each attribute's union type with the TypeScript compiler API and
 * writes the resulting value lists into a generated SCSS partial
 * (`_generated-attributes.scss`), which `_constants.scss` then consumes.
 *
 * Two safety nets fall out of this:
 *  1. Any config value in the SCSS layer that no longer matches the current
 *     TS union fails the existing `validate-*-config` SCSS checks at build
 *     time (a real Sass `@error`, not a silent mismatch).
 *  2. The `state -> CSS pseudo-class` mapping is presentation detail that
 *     cannot be derived from the TS union alone, so it is hand-authored in
 *     this script but checked against the live `MatExpButtonState`
 *     union below — an un-mirrored rename throws here and fails the build
 *     immediately, instead of drifting quietly.
 *
 * Output:
 *   projects/ngm-dev/mat-exp/src/lib/styles/utils/_generated-attributes.scss
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

const LIB_ROOT = path.resolve(process.cwd(), 'projects/ngm-dev/mat-exp');
const TYPES_ROOT = path.join(LIB_ROOT, 'src/lib/types');
const OUTPUT_PATH = path.join(LIB_ROOT, 'src/lib/styles/utils/_generated-attributes.scss');

/** One SCSS `$known-attributes` entry and the TS union it is generated from. */
interface AttributeSource {
  /** Key under `$known-attributes` / `$generated-known-attributes`. */
  scssKey: string;
  /** File under `src/lib/types/`, relative to `TYPES_ROOT`. */
  file: string;
  /**
   * Exported union type alias(es) in that file that are the source of
   * truth. `$known-attributes` validates every button-family variant's
   * SCSS config against the same shared whitelist per key (see
   * `_validate-config.scss`), so when a key's allowed values differ across
   * variants (e.g. `appearance`), list every variant's type here — the
   * generated whitelist is the union of all of them, not just one variant.
   */
  typeName: string | string[];
}

const ATTRIBUTE_SOURCES: AttributeSource[] = [
  { scssKey: 'size', file: 'size.ts', typeName: 'MatExpButtonSize' },
  { scssKey: 'shape', file: 'shape.ts', typeName: 'MatExpButtonShape' },
  { scssKey: 'state', file: 'state.ts', typeName: 'MatExpButtonState' },
  { scssKey: 'toggle', file: 'toggle.ts', typeName: 'MatExpButtonToggle' },
  { scssKey: 'width', file: 'width.ts', typeName: 'MatExpIconButtonWidth' },
  {
    // Union of every button-family appearance type: icon-button
    // (text/filled/outlined/tonal) and split-button
    // (filled/elevated/outlined/tonal) between them cover all 5 values of
    // button-group's `MatExpButtonGroupAppearance` (= Angular
    // Material's `MatButtonAppearance`), so both are listed explicitly
    // rather than resolving the external `MatButtonAppearance` re-export.
    scssKey: 'appearance',
    file: 'appearance.ts',
    typeName: ['MatExpIconButtonAppearance', 'MatExpSplitButtonAppearance'],
  },
];

/**
 * Hand-authored `state -> CSS pseudo-class` mapping. Keys are validated
 * against the live `MatExpButtonState` union at generation time (see
 * `assertStatePseudoMapInSync` below), so a state renamed in `state.ts`
 * without updating this map fails the build instead of drifting silently.
 */
const STATE_PSEUDO_MAP: Record<string, string> = {
  hovered: ':hover',
  focused: ':focus',
  active: ':active',
  disabled: ':disabled',
  pressed: ':active',
};

/** Resolves a TS type node to its flattened list of string-literal members. */
function resolveLiterals(
  node: ts.TypeNode,
  aliases: ReadonlyMap<string, ts.TypeNode>,
  seen: ReadonlySet<string>,
  sourceLabel: string,
): string[] {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return [node.literal.text];
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.flatMap((member) => resolveLiterals(member, aliases, seen, sourceLabel));
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return resolveLiterals(node.type, aliases, seen, sourceLabel);
  }

  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    const name = node.typeName.text;
    if (seen.has(name)) {
      throw new Error(`${sourceLabel}: circular type reference detected at "${name}"`);
    }
    const aliased = aliases.get(name);
    if (!aliased) {
      throw new Error(
        `${sourceLabel}: could not resolve type "${name}" — expected a local string-literal ` +
          'type alias declared in the same file.',
      );
    }
    return resolveLiterals(aliased, aliases, new Set(seen).add(name), sourceLabel);
  }

  throw new Error(
    `${sourceLabel}: unsupported type node (${ts.SyntaxKind[node.kind]}) while resolving a ` +
      'string-literal union. Only string literals, unions of string literals, and local ' +
      'aliases thereof are supported.',
  );
}

/** Extracts the deduplicated, ordered list of string-literal values for `typeName`. */
function extractUnionValues(filePath: string, typeName: string): string[] {
  const sourceText = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const sourceLabel = path.relative(process.cwd(), filePath);

  const aliases = new Map<string, ts.TypeNode>();
  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      aliases.set(node.name.text, node.type);
    }
  });

  const target = aliases.get(typeName);
  if (!target) {
    throw new Error(`${sourceLabel}: exported type alias "${typeName}" not found`);
  }

  const values = resolveLiterals(target, aliases, new Set(), sourceLabel);
  if (values.length === 0) {
    throw new Error(`${sourceLabel}: "${typeName}" resolved to zero string-literal values`);
  }

  return Array.from(new Set(values));
}

/** Fails the build if `STATE_PSEUDO_MAP` and the live state union disagree. */
function assertStatePseudoMapInSync(stateValues: readonly string[]): void {
  const stateValueSet = new Set(stateValues);
  const pseudoKeys = Object.keys(STATE_PSEUDO_MAP);

  const missingFromPseudoMap = stateValues.filter((value) => !pseudoKeys.includes(value));
  const staleInPseudoMap = pseudoKeys.filter((key) => !stateValueSet.has(key));

  if (missingFromPseudoMap.length === 0 && staleInPseudoMap.length === 0) {
    return;
  }

  const problems = [
    ...missingFromPseudoMap.map(
      (value) => `  - "${value}" exists in MatExpButtonState but has no STATE_PSEUDO_MAP entry`,
    ),
    ...staleInPseudoMap.map(
      (key) => `  - "${key}" exists in STATE_PSEUDO_MAP but no longer exists in MatExpButtonState`,
    ),
  ];

  throw new Error(
    'scripts/generate-style-constants.ts: state.ts and STATE_PSEUDO_MAP have drifted out of ' +
      `sync.\n${problems.join('\n')}\n` +
      'Update STATE_PSEUDO_MAP in scripts/generate-style-constants.ts to match state.ts.',
  );
}

function toScssValueList(values: readonly string[]): string {
  const items = values.map((value) => `    ${value},`).join('\n');
  return `(\n${items}\n  )`;
}

function toStatePseudoScssMap(stateValues: readonly string[]): string {
  const items = stateValues.map((state) => `  ${state}: '${STATE_PSEUDO_MAP[state]}',`).join('\n');
  return `(\n${items}\n)`;
}

function generate(): string {
  const attributeEntries = ATTRIBUTE_SOURCES.map((source) => {
    const filePath = path.join(TYPES_ROOT, source.file);
    const typeNames = Array.isArray(source.typeName) ? source.typeName : [source.typeName];
    const values = Array.from(
      new Set(typeNames.flatMap((typeName) => extractUnionValues(filePath, typeName))),
    );
    return { scssKey: source.scssKey, values };
  });

  const stateEntry = attributeEntries.find((entry) => entry.scssKey === 'state');
  if (!stateEntry) {
    throw new Error('Internal error: no "state" entry among ATTRIBUTE_SOURCES');
  }
  assertStatePseudoMapInSync(stateEntry.values);

  const knownAttributesBody = attributeEntries
    .map((entry) => `  ${entry.scssKey}: ${toScssValueList(entry.values)},`)
    .join('\n');

  return `// =============================================================================
// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Generated by \`scripts/generate-style-constants.ts\` from the TypeScript
// attribute unions in \`projects/ngm-dev/mat-exp/src/lib/types/\`.
// Regenerate with \`npm run generate:style-constants\` (this also runs
// automatically before \`npm run build:lib\` via the "prebuild:lib" hook).
// =============================================================================

// Subset of $known-attributes sourced from TypeScript unions. Merged into
// $known-attributes alongside the hand-maintained attributes (variant,
// selection, color, open) in utils/_constants.scss.
$generated-known-attributes: (
${knownAttributesBody}
);

// state -> CSS pseudo-class mapping, keyed by the live MatExpButtonState
// union (see STATE_PSEUDO_MAP in scripts/generate-style-constants.ts).
$generated-state-pseudo-map: ${toStatePseudoScssMap(stateEntry.values)};
`;
}

function main(): void {
  const output = generate();
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`Generated ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
