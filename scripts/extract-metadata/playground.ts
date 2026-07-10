import * as ts from 'typescript';
// ---------------------------------------------------------------------------
// Type resolution → playground control type
// ---------------------------------------------------------------------------

type ControlType = 'text' | 'number' | 'slide-toggle' | 'select' | null;

export interface ResolvedControl {
  controlType: ControlType;
  options?: string[];
  /** True when the original type included `| undefined` or `| null`. */
  nullable?: boolean;
}

export function resolveType(type: ts.Type, checker: ts.TypeChecker): ResolvedControl {
  if (type.flags & ts.TypeFlags.Union) {
    const allMembers = (type as ts.UnionType).types;
    const nullable = allMembers.some(
      (t) => t.flags & ts.TypeFlags.Undefined || t.flags & ts.TypeFlags.Null,
    );
    const members = allMembers.filter(
      (t) => !(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Null),
    );
    if (members.length === 0) return { controlType: null };
    if (members.length === 1) {
      const resolved = resolveActual(members[0], checker);
      return nullable ? { ...resolved, nullable: true } : resolved;
    }

    if (members.every((t) => t.flags & ts.TypeFlags.StringLiteral)) {
      return {
        controlType: 'select',
        options: members.map((t) => (t as ts.StringLiteralType).value),
        ...(nullable && { nullable: true }),
      };
    }
    if (members.every((t) => t.flags & (ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Boolean))) {
      return { controlType: 'slide-toggle', ...(nullable && { nullable: true }) };
    }
    return { controlType: null };
  }

  if (type.flags & ts.TypeFlags.Undefined) return { controlType: null };
  return resolveActual(type, checker);
}

function resolveActual(type: ts.Type, checker: ts.TypeChecker): ResolvedControl {
  const f = type.flags;

  if (f & ts.TypeFlags.Unknown || f & ts.TypeFlags.Any) return { controlType: null };
  if (f & ts.TypeFlags.String) return { controlType: 'text' };
  if (f & ts.TypeFlags.Number) return { controlType: 'number' };
  if (f & ts.TypeFlags.Boolean) return { controlType: 'slide-toggle' };
  if (f & ts.TypeFlags.BooleanLiteral) return { controlType: 'slide-toggle' };

  if (f & ts.TypeFlags.StringLiteral) {
    return { controlType: 'select', options: [(type as ts.StringLiteralType).value] };
  }

  if (type.aliasSymbol) {
    const expanded = checker.getBaseConstraintOfType(type) ?? type;
    if (expanded !== type) return resolveType(expanded, checker);
  }

  return { controlType: null };
}

// ---------------------------------------------------------------------------
// Default value extraction
// ---------------------------------------------------------------------------

export function extractDefault(callExpr: ts.CallExpression): string | number | boolean | undefined {
  if (callExpr.arguments.length === 0) return undefined;
  const arg = callExpr.arguments[0];
  if (ts.isStringLiteral(arg)) return arg.text;
  if (ts.isNumericLiteral(arg)) return Number(arg.text);
  if (arg.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (arg.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (
    ts.isPrefixUnaryExpression(arg) &&
    arg.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(arg.operand)
  ) {
    return -Number(arg.operand.text);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Decorator extraction
// ---------------------------------------------------------------------------

export interface DirectiveMeta {
  kind: 'directive' | 'component';
  selector: string;
}

export function getDirectiveMeta(classDecl: ts.ClassDeclaration): DirectiveMeta | null {
  const decorators = ts.getDecorators(classDecl);
  if (!decorators) return null;

  for (const dec of decorators) {
    if (!ts.isCallExpression(dec.expression)) continue;
    const expr = dec.expression;
    if (!ts.isIdentifier(expr.expression)) continue;

    const decName = expr.expression.text;
    if (decName !== 'Directive' && decName !== 'Component') continue;
    if (expr.arguments.length === 0) continue;

    const options = expr.arguments[0];
    if (!ts.isObjectLiteralExpression(options)) continue;

    for (const prop of options.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const propName = ts.isIdentifier(prop.name)
        ? prop.name.text
        : ts.isStringLiteral(prop.name)
          ? prop.name.text
          : null;
      if (propName !== 'selector') continue;
      if (!ts.isStringLiteral(prop.initializer)) continue;
      return {
        kind: decName === 'Component' ? 'component' : 'directive',
        selector: prop.initializer.text,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Signal helpers
// ---------------------------------------------------------------------------

/**
 * Given the type of a property declared as `input<T>(…)` or `model<T>(…)`,
 * return the inner type `T`.
 */
function getSignalTypeArg(propType: ts.Type, checker: ts.TypeChecker): ts.Type | null {
  try {
    const args = checker.getTypeArguments(propType as ts.TypeReference);
    if (args.length > 0) return args[0];
  } catch {
    // Not a type reference
  }
  return null;
}

function getSignalCallKind(callExpr: ts.CallExpression): 'input' | 'model' | 'output' | null {
  const callee = callExpr.expression;
  if (ts.isIdentifier(callee)) {
    if (callee.text === 'input' || callee.text === 'model' || callee.text === 'output')
      return callee.text;
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'input'
  ) {
    return 'input';
  }
  return null;
}

export interface InputInfo {
  name: string;
  type: ts.Type;
  callExpr: ts.CallExpression;
  node: ts.PropertyDeclaration;
  isModel: boolean;
}

export interface OutputInfo {
  name: string;
  type: ts.Type;
  node: ts.PropertyDeclaration;
}

export function getSignalMembers(
  classDecl: ts.ClassDeclaration,
  checker: ts.TypeChecker,
): { inputs: InputInfo[]; outputs: OutputInfo[] } {
  const inputs: InputInfo[] = [];
  const outputs: OutputInfo[] = [];

  for (const member of classDecl.members) {
    if (!ts.isPropertyDeclaration(member)) continue;
    if (!member.name || !ts.isIdentifier(member.name)) continue;
    if (!member.initializer || !ts.isCallExpression(member.initializer)) continue;

    const callKind = getSignalCallKind(member.initializer);
    if (!callKind) continue;

    const propType = checker.getTypeAtLocation(member);
    const innerType = getSignalTypeArg(propType, checker);
    if (!innerType) continue;

    const name = member.name.text;

    if (callKind === 'output') {
      outputs.push({ name, type: innerType, node: member });
    } else {
      inputs.push({
        name,
        type: innerType,
        callExpr: member.initializer,
        node: member,
        isModel: callKind === 'model',
      });
    }
  }

  return { inputs, outputs };
}

export function getLegacyInputName(
  member: ts.PropertyDeclaration | ts.GetAccessorDeclaration,
): string | null {
  const decorators = ts.getDecorators(member);
  if (!decorators) return null;
  const hasInput = decorators.some(
    (d) =>
      ts.isCallExpression(d.expression) &&
      ts.isIdentifier(d.expression.expression) &&
      d.expression.expression.text === 'Input',
  );
  if (!hasInput) return null;
  return ts.isIdentifier(member.name) ? member.name.text : null;
}
