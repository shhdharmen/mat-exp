import * as ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';
import prettier from 'prettier';
import type { ApiManifest, PlaygroundSchemas } from './types.js';
import { PUBLIC_API_PATH, PLAYGROUND_SCHEMAS_OUT, API_MANIFEST_OUT } from './paths.js';
import { createLibProgram } from './program.js';
import { getDirectiveMeta } from './playground.js';
import { isInternalJsDoc } from './jsdoc.js';
import { collectPlaygroundPreviewSchemas } from './preview-schemas.js';
import {
  processClass,
  processTypeAlias,
  processInterface,
  processVariable,
  processPlainClass,
  processFunction,
} from './processors.js';

export * from './types.js';
export { PLAYGROUND_SCHEMAS_OUT, API_MANIFEST_OUT } from './paths.js';

function collectExports(
  publicApiFile: ts.SourceFile,
  checker: ts.TypeChecker,
): Map<string, ts.Symbol> {
  const result = new Map<string, ts.Symbol>();
  const moduleSymbol = checker.getSymbolAtLocation(publicApiFile);
  if (!moduleSymbol) return result;
  for (const sym of checker.getExportsOfModule(moduleSymbol)) {
    result.set(sym.name, sym);
  }
  return result;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  const raw = JSON.stringify(data, null, 2) + '\n';
  const prettierConfig = await prettier.resolveConfig(filePath);
  const formatted = await prettier.format(raw, { ...prettierConfig, parser: 'json' });
  fs.writeFileSync(filePath, formatted, 'utf-8');
}

export async function runMetadataExtraction(): Promise<void> {
  console.log('\nExtracting library metadata…');

  const program = createLibProgram();
  const checker = program.getTypeChecker();

  const publicApiFile = program
    .getSourceFiles()
    .find((f) => path.normalize(f.fileName) === PUBLIC_API_PATH);

  if (!publicApiFile) {
    console.warn(`Warning: could not locate public-api.ts at ${PUBLIC_API_PATH}`);
    console.warn('Skipping metadata extraction.');
    return;
  }

  const exportedSymbols = collectExports(publicApiFile, checker);
  console.log(`  Found ${exportedSymbols.size} exported symbols in public-api.ts`);

  const playgroundSchemas: PlaygroundSchemas = {};
  const apiManifest: ApiManifest = {};
  // Real directive/component selectors by class name, for the playground
  // schema's `selector` field (the preview-based pass below doesn't see
  // library source, only the docs app).
  const selectorsByClassName = new Map<string, string>();

  for (const [name, symbol] of exportedSymbols) {
    const resolved =
      symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const declarations = resolved.getDeclarations();
    if (!declarations || declarations.length === 0) continue;

    const decl = declarations[0];

    // A `@internal`-tagged export is excluded from the manifest entirely —
    // not just hidden from the API index, but genuinely absent, so its
    // detail-page route resolves to "Symbol not found" like any unknown symbol.
    // JSDoc on a `const`/`let` sits on the enclosing VariableStatement, not
    // the inner VariableDeclaration node.
    const jsDocNode = ts.isVariableDeclaration(decl) ? (decl.parent?.parent ?? decl) : decl;
    if (isInternalJsDoc(jsDocNode)) continue;

    if (ts.isClassDeclaration(decl)) {
      const hasDirMeta = getDirectiveMeta(decl);
      if (hasDirMeta) {
        selectorsByClassName.set(name, hasDirMeta.selector);
        processClass(name, decl, checker, apiManifest);
      } else {
        processPlainClass(name, decl, checker, apiManifest);
      }
    } else if (ts.isTypeAliasDeclaration(decl)) {
      processTypeAlias(name, decl, checker, apiManifest);
    } else if (ts.isInterfaceDeclaration(decl)) {
      processInterface(name, decl, checker, apiManifest);
    } else if (ts.isVariableDeclaration(decl)) {
      processVariable(name, decl, checker, apiManifest);
    } else if (ts.isFunctionDeclaration(decl)) {
      processFunction(name, decl, checker, apiManifest);
    }
  }

  collectPlaygroundPreviewSchemas(playgroundSchemas, selectorsByClassName);

  await writeJson(PLAYGROUND_SCHEMAS_OUT, playgroundSchemas);
  console.log(`✓ Written ${PLAYGROUND_SCHEMAS_OUT}`);
  console.log(`  Schemas: ${Object.keys(playgroundSchemas).length} components / directives`);

  await writeJson(API_MANIFEST_OUT, apiManifest);
  console.log(`✓ Written ${API_MANIFEST_OUT}`);
  console.log(`  API entries: ${Object.keys(apiManifest).length} symbols`);
}
