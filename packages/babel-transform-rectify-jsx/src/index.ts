import type { PluginObj, PluginPass } from "@babel/core";
import type {
  Expression,
  Identifier,
  MemberExpression,
  ObjectProperty,
  SpreadElement,
  ImportDeclaration,
  ImportSpecifier,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
} from "@babel/types";

type BabelTypes = typeof import("@babel/types");
type Babel = { types: BabelTypes };
type State = PluginPass & { usedJsx: boolean; usedFragment: boolean };

// ─── JSX name → JS expression ────────────────────────────────────────────────

/**
 * Convert a JSXMemberExpression (e.g. `Ctx.Provider`) to a MemberExpression.
 * All parts of a member chain are treated as identifiers, not string literals.
 */
function jsxMemberToMemberExpr(
  name: JSXMemberExpression,
  t: BabelTypes,
): MemberExpression {
  const obj: Identifier | MemberExpression = t.isJSXMemberExpression(name.object)
    ? jsxMemberToMemberExpr(name.object, t)
    : t.identifier(name.object.name);
  return t.memberExpression(obj, t.identifier(name.property.name));
}

/**
 * Convert a JSX element name to a JS expression:
 * - Lowercase first char  →  string literal  (intrinsic element, e.g. "div")
 * - Uppercase first char  →  identifier      (component, e.g. MyComponent)
 * - Member expression     →  member expr     (e.g. Ctx.Provider)
 * - Namespaced            →  string literal  (e.g. "svg:circle")
 */
function jsxNameToExpression(
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName,
  t: BabelTypes,
): Expression {
  if (t.isJSXIdentifier(name)) {
    return /^[a-z]/.test(name.name)
      ? t.stringLiteral(name.name)
      : t.identifier(name.name);
  }
  if (t.isJSXMemberExpression(name)) {
    return jsxMemberToMemberExpr(name, t);
  }
  // JSXNamespacedName → "ns:name"
  return t.stringLiteral(`${name.namespace.name}:${name.name.name}`);
}

// ─── JSX text whitespace trimming ────────────────────────────────────────────

/**
 * Mirrors Babel's JSX text trimming:
 *  - Split by newline
 *  - Trim trailing spaces on the first line, leading spaces on the last
 *  - Trim both sides of every middle line
 *  - Discard empty lines; join survivors with a trailing space except the last
 */
function cleanJSXText(raw: string): string | null {
  const lines = raw.split(/\r\n|\n|\r/);
  let lastNonEmpty = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/[^ \t]/.test(lines[i])) lastNonEmpty = i;
  }

  let result = "";
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\t/g, " ");
    if (i !== 0) line = line.replace(/^[ ]+/, "");
    if (i !== lines.length - 1) line = line.replace(/[ ]+$/, "");
    if (line) {
      if (i !== lastNonEmpty) line += " ";
      result += line;
    }
  }
  return result || null;
}

// ─── Props builder ────────────────────────────────────────────────────────────

function buildProps(
  attributes: JSXElement["openingElement"]["attributes"],
  children: Expression[],
  t: BabelTypes,
): Expression {
  const properties: Array<ObjectProperty | SpreadElement> = [];

  for (const attr of attributes) {
    if (t.isJSXSpreadAttribute(attr)) {
      properties.push(t.spreadElement(attr.argument));
      continue;
    }

    const keyName = t.isJSXIdentifier(attr.name)
      ? attr.name.name
      : `${attr.name.namespace.name}:${attr.name.name.name}`;
    const key = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(keyName)
      ? t.identifier(keyName)
      : t.stringLiteral(keyName);

    let value: Expression;
    if (attr.value == null) {
      value = t.booleanLiteral(true);
    } else if (t.isJSXExpressionContainer(attr.value)) {
      value = attr.value.expression as Expression;
    } else {
      // StringLiteral (most common) or rare JSXElement/JSXFragment attr value
      value = attr.value as Expression;
    }
    properties.push(t.objectProperty(key, value));
  }

  if (children.length === 1) {
    properties.push(t.objectProperty(t.identifier("children"), children[0]));
  } else if (children.length > 1) {
    properties.push(
      t.objectProperty(t.identifier("children"), t.arrayExpression(children)),
    );
  }

  if (properties.length === 0) return t.nullLiteral();
  return t.objectExpression(properties);
}

// ─── Children builder ─────────────────────────────────────────────────────────

/**
 * Because we use the `exit` visitor, child JSXElement / JSXFragment nodes have
 * already been replaced with CallExpressions by the time the parent runs.
 * The `else` branch handles those already-replaced expressions.
 */
function buildChildren(
  children: JSXElement["children"],
  t: BabelTypes,
): Expression[] {
  const result: Expression[] = [];
  for (const child of children) {
    if (t.isJSXText(child)) {
      const clean = cleanJSXText(child.value);
      if (clean !== null) result.push(t.stringLiteral(clean));
    } else if (t.isJSXExpressionContainer(child)) {
      if (!t.isJSXEmptyExpression(child.expression)) {
        result.push(child.expression as Expression);
      }
    } else if (t.isJSXSpreadChild(child)) {
      result.push(child.expression);
    } else {
      // Already-transformed CallExpression (was JSXElement/JSXFragment)
      result.push(child as unknown as Expression);
    }
  }
  return result;
}

// ─── Auto-import helper ───────────────────────────────────────────────────────

const RECTIFY_CORE = "@rectify-dev/core/jsx-runtime";

function ensureImports(
  path: import("@babel/core").NodePath<import("@babel/types").Program>,
  state: State,
  t: BabelTypes,
): void {
  if (!state.usedJsx) return;

  // Collect every local name already bound by any import in this file.
  const alreadyBound = new Set<string>();
  let runtimeDecl: ImportDeclaration | null = null;

  path.traverse({
    ImportDeclaration(p) {
      for (const spec of p.node.specifiers) {
        if (t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec) || t.isImportNamespaceSpecifier(spec)) {
          alreadyBound.add(spec.local.name);
        }
      }
      if (p.node.source.value === RECTIFY_CORE) {
        runtimeDecl = p.node;
      }
    },
  });

  const toAdd: ImportSpecifier[] = [];
  if (!alreadyBound.has("jsx")) {
    toAdd.push(t.importSpecifier(t.identifier("jsx"), t.identifier("jsx")));
  }
  if (state.usedFragment && !alreadyBound.has("Fragment")) {
    toAdd.push(
      t.importSpecifier(t.identifier("Fragment"), t.identifier("Fragment")),
    );
  }
  if (toAdd.length === 0) return;

  if (runtimeDecl) {
    (runtimeDecl as ImportDeclaration).specifiers.push(...toAdd);
  } else {
    path.unshiftContainer(
      "body",
      t.importDeclaration(toAdd, t.stringLiteral(RECTIFY_CORE)),
    );
  }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default function rectifyBabelPlugin({ types: t }: Babel): PluginObj<State> {
  return {
    name: "babel-plugin-rectify",

    manipulateOptions(_opts: any, parserOpts: any) {
      // Enable JSX and TypeScript parsing so Babel can parse .tsx/.jsx files.
      if (!parserOpts.plugins.includes("jsx")) parserOpts.plugins.push("jsx");
      if (!parserOpts.plugins.includes("typescript")) parserOpts.plugins.push("typescript");
    },

    visitor: {
      Program: {
        enter(_path, state) {
          state.usedJsx = false;
          state.usedFragment = false;
        },
        exit(path, state) {
          ensureImports(path, state, t);
        },
      },

      JSXElement: {
        exit(path, state) {
          state.usedJsx = true;

          const { openingElement, children } = path.node;
          const typeExpr = jsxNameToExpression(openingElement.name, t);

          // Detect explicit <Fragment> usage
          if (t.isIdentifier(typeExpr) && typeExpr.name === "Fragment") {
            state.usedFragment = true;
          }

          const childExprs = buildChildren(children, t);
          const propsArg = buildProps(openingElement.attributes, childExprs, t);

          path.replaceWith(
            t.callExpression(t.identifier("jsx"), [typeExpr, propsArg]),
          );
        },
      },

      JSXFragment: {
        exit(path, state) {
          state.usedJsx = true;
          state.usedFragment = true;

          const childExprs = buildChildren(path.node.children, t);
          const propsArg = buildProps([], childExprs, t);

          path.replaceWith(
            t.callExpression(t.identifier("jsx"), [
              t.identifier("Fragment"),
              propsArg,
            ]),
          );
        },
      },
    },
  };
}
