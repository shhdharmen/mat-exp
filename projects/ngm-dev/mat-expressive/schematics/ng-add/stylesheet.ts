import type { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  COMPONENT_STYLE_MIXINS,
  CSS_STYLES_ENTRY,
  LEADING_USE_FORWARD_BLOCK,
  USE_STATEMENT,
} from './constants';
import type { ComponentSelection } from './types';

/**
 * Inserts the `@use`/`@include` block into the given stylesheet, right after any leading
 * `@use`/`@forward` statements (or at the very top if there are none). No-ops if the stylesheet
 * already references the package.
 */
export function insertStylesBlock(
  tree: Tree,
  stylesPath: string,
  context: SchematicContext,
  components: ComponentSelection,
): void {
  const raw = tree.read(stylesPath);
  if (!raw) {
    context.logger.warn(`mat-expressive: could not read "${stylesPath}".`);
    return;
  }

  const content = raw.toString('utf-8');
  if (content.includes('@ngm-dev/mat-expressive')) {
    context.logger.info(
      `mat-expressive: "${stylesPath}" already sets up Mat Expressive. Skipping.`,
    );
    return;
  }

  const leadingMatch = content.match(LEADING_USE_FORWARD_BLOCK);
  const insertAt = leadingMatch ? leadingMatch[0].length : 0;
  const block = `${USE_STATEMENT}\n\n${buildIncludeBlock(components)}\n`;
  const updated = content.slice(0, insertAt) + block + content.slice(insertAt);

  tree.overwrite(stylesPath, updated);
  context.logger.info(`mat-expressive: updated "${stylesPath}" with the Mat Expressive styles.`);
}

/** Builds the `html { @include ...; }` block for the given component selection. */
export function buildIncludeBlock(components: ComponentSelection): string {
  if (components === 'all') {
    return `html {\n  @include mat-expressive.mat-expressive-all-styles();\n}\n`;
  }

  const includes = components
    .map((key) => `  @include mat-expressive.${COMPONENT_STYLE_MIXINS[key]}();`)
    .join('\n');
  return `html {\n${includes}\n}\n`;
}

/** Manual setup instructions covering both the SCSS and CSS paths, for the no-stylesheet-found case. */
export function buildManualInstructions(): string {
  const includeBlock = buildIncludeBlock('all');
  return (
    'mat-expressive: could not automatically locate a global stylesheet for this project ' +
    '(checked the "styles" array in angular.json). Set up styles manually using whichever of ' +
    'the following matches your project:\n\n' +
    `If your project uses Sass, add this to your global styles, making sure the \`@use\` line ` +
    `precedes any other \`@use\` or rule:\n\n${USE_STATEMENT}\n\n${includeBlock}\n` +
    'If your project does not compile Sass, add the prebuilt CSS to the "styles" array in ' +
    `"angular.json" instead:\n\n"styles": ["${CSS_STYLES_ENTRY}"]\n`
  );
}
