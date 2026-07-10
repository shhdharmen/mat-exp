import * as ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PlaygroundSchemas, PlaygroundSourceFile } from './types.js';
import { getPlaygroundForTag } from './jsdoc.js';
import { getDirectiveMeta } from './playground.js';
import { processPlaygroundPreview } from './processors.js';
import { createAppProgram } from './program.js';
import { PREVIEWS_ROOT } from './paths.js';

/** Sibling extensions checked alongside a preview's `.ts` file, in tab display order. */
const SIBLING_EXTENSIONS: { ext: string; lang: string }[] = [
  { ext: '.ts', lang: 'angular-ts' },
  { ext: '.html', lang: 'html' },
  { ext: '.scss', lang: 'scss' },
];

/** Reads a preview's own `.ts`/`.html`/`.scss` files, skipping any that don't exist. */
function collectSourceFiles(tsFilePath: string): PlaygroundSourceFile[] {
  const dir = path.dirname(tsFilePath);
  const base = path.basename(tsFilePath, '.ts');

  const sourceFiles: PlaygroundSourceFile[] = [];
  for (const { ext, lang } of SIBLING_EXTENSIONS) {
    const filePath = path.join(dir, `${base}${ext}`);
    if (!fs.existsSync(filePath)) continue;
    sourceFiles.push({
      filename: path.basename(filePath),
      content: fs.readFileSync(filePath, 'utf-8'),
      lang,
    });
  }
  return sourceFiles;
}

/**
 * Scans `src/app/shared/components/playground/previews/` for `@Component`
 * classes tagged `@playgroundFor <LibraryClassName>` and builds their
 * playground schema from the preview's own inputs. `selectorsByClassName`
 * (collected from the library program) supplies the real directive selector
 * for the schema's `selector` field.
 */
export function collectPlaygroundPreviewSchemas(
  playgroundSchemas: PlaygroundSchemas,
  selectorsByClassName: Map<string, string>,
): void {
  const program = createAppProgram();
  const checker = program.getTypeChecker();

  const previewFiles = program
    .getSourceFiles()
    .filter((f) => !f.isDeclarationFile && path.normalize(f.fileName).startsWith(PREVIEWS_ROOT));

  for (const sourceFile of previewFiles) {
    for (const stmt of sourceFile.statements) {
      if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
      if (!getDirectiveMeta(stmt)) continue;

      const schemaKey = getPlaygroundForTag(stmt);
      if (!schemaKey) continue;

      const selector = selectorsByClassName.get(schemaKey) ?? '';
      const sourceFiles = collectSourceFiles(sourceFile.fileName);
      processPlaygroundPreview(schemaKey, stmt, checker, selector, sourceFiles, playgroundSchemas);
    }
  }
}
