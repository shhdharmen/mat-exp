import * as ts from 'typescript';
import type { ApiProperty, ApiMethod, ApiParam } from './types.js';
import {
  isInternalJsDoc,
  getJsDocDescription,
  getJsDocTags,
  getJsDocParamDescriptions,
  getJsDocReturnsDescription,
  extractTypeParams,
} from './jsdoc.js';

export function extractClassMembers(
  classDecl: ts.ClassDeclaration | ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
): { properties: ApiProperty[]; methods: ApiMethod[] } {
  const properties: ApiProperty[] = [];
  const methods: ApiMethod[] = [];

  const members = classDecl.members as ts.NodeArray<ts.TypeElement | ts.ClassElement>;
  for (const member of members) {
    if (isInternalJsDoc(member)) continue;

    // ConstructorDeclaration has no name — handle before the name-required guard
    if (ts.isConstructorDeclaration(member)) {
      for (const param of member.parameters) {
        const mods = ts.getCombinedModifierFlags(param);
        const isParamProp =
          mods &
          (ts.ModifierFlags.Public |
            ts.ModifierFlags.Protected |
            ts.ModifierFlags.Private |
            ts.ModifierFlags.Readonly);
        if (!isParamProp) continue;
        const paramName = ts.isIdentifier(param.name) ? param.name.text : null;
        if (!paramName) continue;
        const paramType = checker.getTypeAtLocation(param);
        const prop: ApiProperty = {
          name: paramName,
          type: checker.typeToString(paramType),
        };
        if (mods & ts.ModifierFlags.Readonly) prop.isReadonly = true;
        if (param.questionToken) prop.isOptional = true;
        const paramDescs = getJsDocParamDescriptions(member);
        const desc = paramDescs.get(paramName) ?? getJsDocDescription(param);
        if (desc) prop.description = desc;
        properties.push(prop);
      }
      continue;
    }

    const name = member.name && ts.isIdentifier(member.name) ? member.name.text : null;
    if (!name) continue;

    const jsdocTags = getJsDocTags(member);
    const deprecated = jsdocTags.deprecated;

    if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
      const type = checker.getTypeAtLocation(member);
      const prop: ApiProperty = {
        name,
        type: checker.typeToString(type),
      };
      if (ts.isPropertyDeclaration(member)) {
        const mods = ts.getCombinedModifierFlags(member);
        if (mods & ts.ModifierFlags.Readonly) prop.isReadonly = true;
      }
      if (member.questionToken) prop.isOptional = true;
      const desc = getJsDocDescription(member);
      if (desc) prop.description = desc;
      if (deprecated !== undefined) prop.deprecated = deprecated;
      properties.push(prop);
    } else if (
      ts.isMethodDeclaration(member) ||
      ts.isMethodSignature(member) ||
      ts.isConstructSignatureDeclaration(member)
    ) {
      const type = checker.getTypeAtLocation(member);
      const sig = checker.typeToString(type);
      const method: ApiMethod = { name, signature: sig };
      const desc = getJsDocDescription(member);
      if (desc) method.description = desc;
      if (deprecated !== undefined) method.deprecated = deprecated;

      const paramDescs = getJsDocParamDescriptions(member);
      const paramList =
        ts.isMethodDeclaration(member) || ts.isMethodSignature(member)
          ? member.parameters
          : (member as ts.ConstructSignatureDeclaration).parameters;

      if (paramList.length > 0) {
        method.params = paramList.map((p) => {
          const pName = ts.isIdentifier(p.name) ? p.name.text : '';
          const pType = checker.typeToString(checker.getTypeAtLocation(p));
          const apiParam: ApiParam = { name: pName, type: pType };
          const pDesc = paramDescs.get(pName);
          if (pDesc) apiParam.description = pDesc;
          return apiParam;
        });
      }

      const returnType =
        ts.isMethodDeclaration(member) || ts.isMethodSignature(member) ? member.type : undefined;
      if (returnType) {
        method.returnType = checker.typeToString(checker.getTypeAtLocation(returnType));
      }
      const retDesc = getJsDocReturnsDescription(member);
      if (retDesc) method.returnDescription = retDesc;

      const tps = extractTypeParams(
        (member as ts.MethodDeclaration | ts.MethodSignature).typeParameters,
        checker,
      );
      if (tps) method.typeParams = tps;

      methods.push(method);
    }
  }
  return { properties, methods };
}
