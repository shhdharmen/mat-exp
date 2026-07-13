import * as ts from 'typescript';
import type {
  ApiManifest,
  PlaygroundSchemas,
  PlaygroundSourceFile,
  ApiInput,
  ApiOutput,
  ApiDirectiveEntry,
  ApiTypeEntry,
  ApiConstEntry,
  ApiClassEntry,
  ApiFunctionEntry,
  ApiParam,
} from './types.js';
import {
  getJsDocDescription,
  getJsDocTags,
  getJsDocParamDescriptions,
  getJsDocReturnsDescription,
  extractTypeParams,
  isInternalJsDoc,
  getJsDocDefaultTag,
  getJsDocNameTag,
} from './jsdoc.js';
import { extractClassMembers } from './members.js';
import {
  resolveType,
  extractDefault,
  getDirectiveMeta,
  getSignalMembers,
  getLegacyInputName,
  type InputInfo,
} from './playground.js';

/**
 * Converts a raw `@default` JSDoc comment (e.g. `'s'`, `true`, `42`) into the
 * primitive type the matching playground control expects. `extractDefault`
 * only resolves literal initializers; DI-derived values like
 * `model(inject(TOKEN).size)` need the JSDoc tag as a fallback, but that tag
 * is free-form text and must be coerced to line up with `ctrl.options` /
 * `[checked]` / numeric inputs.
 */
function coerceJsDocDefault(
  raw: string,
  controlType: 'text' | 'number' | 'slide-toggle' | 'select',
): string | number | boolean {
  const unquoted = raw.replace(/^['"]|['"]$/g, '');
  switch (controlType) {
    case 'number': {
      const n = Number(unquoted);
      return Number.isNaN(n) ? unquoted : n;
    }
    case 'slide-toggle':
      return unquoted === 'true';
    default:
      return unquoted;
  }
}

/** Turns `iconPosition` into `Icon position` for controls with no `@name` override. */
function humanizeControlName(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * Builds a playground control list from a preview component's own signal
 * inputs — sourced from `src/app/shared/components/playground/previews/`,
 * not the library directive. A preview may declare convenience inputs (e.g.
 * `appearance` on `ButtonPreviewComponent`) that don't exist on the library
 * class it stands in for.
 */
export function processPlaygroundPreview(
  schemaKey: string,
  classDecl: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  selector: string,
  sourceFiles: PlaygroundSourceFile[],
  playgroundSchemas: PlaygroundSchemas,
): void {
  const { inputs } = getSignalMembers(classDecl, checker);

  const playgroundInputs = inputs
    .filter((inp: InputInfo) => !isInternalJsDoc(inp.node))
    .filter((inp: InputInfo) => {
      const { controlType } = resolveType(inp.type, checker);
      return controlType !== null;
    })
    .map((inp: InputInfo) => {
      const resolved = resolveType(inp.type, checker);
      const control = {
        name: inp.name,
        label: getJsDocNameTag(inp.node) ?? humanizeControlName(inp.name),
        type: resolved.controlType!,
      } as {
        name: string;
        label: string;
        type: 'text' | 'number' | 'slide-toggle' | 'select';
        options?: string[];
        default?: string | number | boolean;
        nullable?: boolean;
        description?: string;
      };
      if (resolved.options) control.options = resolved.options;
      const literalDefault = extractDefault(inp.callExpr);
      const jsDocDefault = getJsDocDefaultTag(inp.node);
      const defVal =
        literalDefault !== undefined
          ? literalDefault
          : jsDocDefault !== undefined
            ? coerceJsDocDefault(jsDocDefault, resolved.controlType!)
            : undefined;
      if (defVal !== undefined) {
        control.default = defVal;
      } else if (resolved.nullable) {
        // No resolvable default (no literal, no @default tag) and the type
        // itself is `| undefined`/`| null` — genuinely unset, not just
        // undocumented. Surface "None" as a real choice instead of silently
        // falling back to the first option.
        control.nullable = true;
      }
      const desc = getJsDocDescription(inp.node);
      if (desc) control.description = desc;
      return control;
    });

  playgroundSchemas[schemaKey] = {
    selector,
    className: schemaKey,
    inputs: playgroundInputs,
    sourceFiles,
  };
}

export function processClass(
  className: string,
  classDecl: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const dirMeta = getDirectiveMeta(classDecl);
  if (!dirMeta) return;

  const description = getJsDocDescription(classDecl);
  const { inputs, outputs } = getSignalMembers(classDecl, checker);

  // ---- API manifest: signal inputs ----
  const apiInputs: ApiInput[] = inputs
    .filter((inp: InputInfo) => !isInternalJsDoc(inp.node))
    .map((inp: InputInfo) => {
      const innerTypeStr = checker.typeToString(inp.type);
      const apiInput: ApiInput = {
        name: inp.name,
        type: inp.isModel ? `ModelSignal<${innerTypeStr}>` : innerTypeStr,
      };
      if (inp.isModel) apiInput.isModel = true;
      const defVal = extractDefault(inp.callExpr) ?? getJsDocDefaultTag(inp.node);
      if (defVal !== undefined) apiInput.default = defVal;
      const desc = getJsDocDescription(inp.node);
      if (desc) apiInput.description = desc;
      const { deprecated } = getJsDocTags(inp.node);
      if (deprecated !== undefined) apiInput.deprecated = deprecated;
      return apiInput;
    });

  // ---- API manifest: @Input() decorated members ----
  for (const member of classDecl.members) {
    if (!ts.isPropertyDeclaration(member) && !ts.isGetAccessorDeclaration(member)) continue;
    const legacyName = getLegacyInputName(member);
    if (!legacyName) continue;
    if (isInternalJsDoc(member)) continue;
    const memberType = checker.getTypeAtLocation(member);
    const desc = getJsDocDescription(member);
    const apiInput: ApiInput = { name: legacyName, type: checker.typeToString(memberType) };
    if (desc) apiInput.description = desc;
    apiInputs.push(apiInput);
  }

  // ---- API manifest: signal outputs ----
  const apiOutputs: ApiOutput[] = outputs
    .filter((out) => !isInternalJsDoc(out.node))
    .map((out) => {
      const apiOut: ApiOutput = {
        name: out.name,
        eventType: checker.typeToString(out.type),
      };
      const desc = getJsDocDescription(out.node);
      if (desc) apiOut.description = desc;
      const { deprecated } = getJsDocTags(out.node);
      if (deprecated !== undefined) apiOut.deprecated = deprecated;
      return apiOut;
    });

  const jsDocTags = getJsDocTags(classDecl);
  const entry: ApiDirectiveEntry = {
    kind: dirMeta.kind,
    selector: dirMeta.selector,
    inputs: apiInputs,
    outputs: apiOutputs,
    ...jsDocTags,
  };
  if (description) entry.description = description;
  apiManifest[className] = entry;
}

export function processTypeAlias(
  name: string,
  decl: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const shape = decl.getText();
  const description = getJsDocDescription(decl);
  const jsDocTags = getJsDocTags(decl);
  const typeParams = extractTypeParams(decl.typeParameters, checker);
  const entry: ApiTypeEntry = { kind: 'type', shape, ...jsDocTags };
  if (description) entry.description = description;
  if (typeParams) entry.typeParams = typeParams;
  apiManifest[name] = entry;
}

export function processInterface(
  name: string,
  decl: ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const type = checker.getTypeAtLocation(decl);
  const shape = checker.typeToString(type);
  const description = getJsDocDescription(decl);
  const jsDocTags = getJsDocTags(decl);
  const typeParams = extractTypeParams(decl.typeParameters, checker);
  const { properties, methods } = extractClassMembers(decl, checker);
  const entry: ApiTypeEntry = { kind: 'interface', shape, ...jsDocTags };
  if (description) entry.description = description;
  if (typeParams) entry.typeParams = typeParams;
  if (properties.length > 0) entry.properties = properties;
  if (methods.length > 0) entry.methods = methods;
  apiManifest[name] = entry;
}

export function processVariable(
  name: string,
  decl: ts.VariableDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const statement = decl.parent?.parent;
  const jsDocNode = statement ?? decl;
  const description = getJsDocDescription(jsDocNode);
  const jsDocTags = getJsDocTags(jsDocNode);
  const type = checker.getTypeAtLocation(decl);
  const value = checker.typeToString(type);

  // `export const foo = someFactory.provide` resolves to a callable type even
  // though the declaration syntax is a const, not a `function` — classify by
  // resolved type, not declaration kind, so callers see kind: 'function' with
  // structured params[]/returnType instead of an opaque const value string.
  const callSignatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  if (callSignatures.length > 0) {
    const sig = callSignatures[0];
    const params: ApiParam[] = sig.parameters.map((paramSymbol) => ({
      name: paramSymbol.getName(),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(paramSymbol, decl)),
    }));
    const returnType = checker.typeToString(checker.getReturnTypeOfSignature(sig));
    const entry: ApiFunctionEntry = { kind: 'function', signature: value, ...jsDocTags };
    if (description) entry.description = description;
    if (params.length > 0) entry.params = params;
    if (returnType) entry.returnType = returnType;
    apiManifest[name] = entry;
    return;
  }

  const entry: ApiConstEntry = { kind: 'const', value, ...jsDocTags };
  if (description) entry.description = description;
  apiManifest[name] = entry;
}

export function processPlainClass(
  name: string,
  classDecl: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const type = checker.getTypeAtLocation(classDecl);
  const shape = checker.typeToString(type);
  const description = getJsDocDescription(classDecl);
  const jsDocTags = getJsDocTags(classDecl);
  const typeParams = extractTypeParams(classDecl.typeParameters, checker);
  const { properties, methods } = extractClassMembers(classDecl, checker);
  const entry: ApiClassEntry = { kind: 'class', shape, ...jsDocTags };
  if (description) entry.description = description;
  if (typeParams) entry.typeParams = typeParams;
  if (properties.length > 0) entry.properties = properties;
  if (methods.length > 0) entry.methods = methods;
  apiManifest[name] = entry;
}

export function processFunction(
  name: string,
  decl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  apiManifest: ApiManifest,
): void {
  const type = checker.getTypeAtLocation(decl);
  const signature = checker.typeToString(type);
  const description = getJsDocDescription(decl);
  const jsDocTags = getJsDocTags(decl);
  const typeParams = extractTypeParams(decl.typeParameters, checker);
  const paramDescs = getJsDocParamDescriptions(decl);
  const returnDescription = getJsDocReturnsDescription(decl);

  const params: ApiParam[] = decl.parameters.map((p) => {
    const pName = ts.isIdentifier(p.name) ? p.name.text : '';
    const pType = checker.typeToString(checker.getTypeAtLocation(p));
    const apiParam: ApiParam = { name: pName, type: pType };
    const pDesc = paramDescs.get(pName);
    if (pDesc) apiParam.description = pDesc;
    return apiParam;
  });

  let returnType: string | undefined;
  if (decl.type) {
    returnType = checker.typeToString(checker.getTypeAtLocation(decl.type));
  } else {
    const sigs = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
    if (sigs.length > 0) {
      returnType = checker.typeToString(checker.getReturnTypeOfSignature(sigs[0]));
    }
  }

  const entry: ApiFunctionEntry = { kind: 'function', signature, ...jsDocTags };
  if (description) entry.description = description;
  if (typeParams) entry.typeParams = typeParams;
  if (params.length > 0) entry.params = params;
  if (returnType) entry.returnType = returnType;
  if (returnDescription) entry.returnDescription = returnDescription;
  apiManifest[name] = entry;
}
