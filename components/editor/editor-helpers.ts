import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

export type JsxNode = {
  tag: string;
  children: JsxNode[];
};

// ----- Layer tree parser (regex, unchanged) -----
function regexParseJsxToTree(jsxCode: string): JsxNode[] {
  // First, try to extract JSX if the code contains a function that returns JSX
  let jsxString = jsxCode;
  const returnMatch = jsxString.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;/);
  if (returnMatch) {
    jsxString = returnMatch[1];
  } else {
    // Also handle case where return is not wrapped in parentheses
    const simpleReturn = jsxString.match(/return\s+([\s\S]*?);/);
    if (simpleReturn) jsxString = simpleReturn[1];
  }

  // Now parse the JSX string (same as before)
  const lines = jsxString.split("\n");
  const stack: { node: JsxNode; indent: number }[] = [];
  const roots: JsxNode[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const indent = line.search(/\S/);
    if (indent === -1) continue;
    const openMatch = trimmed.match(/^<([\w-]+)(?:\s|>)/);
    const closeMatch = trimmed.match(/^<\/([\w-]+)>/);
    if (closeMatch) {
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      continue;
    }
    if (openMatch) {
      const tag = openMatch[1];
      const node: JsxNode = { tag, children: [] };
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      if (stack.length === 0) roots.push(node);
      else stack[stack.length - 1].node.children.push(node);
      stack.push({ node, indent });
    }
  }
  return roots;
}

export function parseJsxToTree(jsxCode: string): JsxNode[] {
  return regexParseJsxToTree(jsxCode);
}

// ----- AST helpers -----
function parseJSXToAST(jsxCode: string) {
  return parser.parse(jsxCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

function findFirstElementByTag(ast: any, tagName: string) {
  let foundNode: any = null;
  traverse(ast, {
    JSXElement(path) {
      if (!foundNode && path.node.openingElement.name.name === tagName) {
        foundNode = path.node;
        path.stop();
      }
    },
  });
  return foundNode;
}

// Helper to detect value type and create appropriate JSX attribute value
function createJSXAttributeValue(value: string): t.JSXAttribute["value"] {
  const trimmed = value.trim();
  // Boolean true
  if (trimmed === "true") {
    return null; // attribute with no value -> e.g., <button disabled>
  }
  // Boolean false: omit attribute entirely (handled by caller)
  if (trimmed === "false") {
    return undefined; // special marker to omit attribute
  }
  // Object (style or any {...})
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || trimmed.startsWith("{{")) {
    // It's already an object expression, parse as expression
    try {
      // Remove outer braces if they are double braces
      let exprStr = trimmed;
      if (exprStr.startsWith("{{") && exprStr.endsWith("}}")) {
        exprStr = exprStr.slice(1, -1); // {{ ... }} -> { ... }
      }
      const expr = parser.parseExpression(exprStr);
      return t.jsxExpressionContainer(expr);
    } catch {
      // fallback: treat as string literal
      return t.stringLiteral(trimmed);
    }
  }
  // Function (contains => or starts with ( ... ) => )
  if (trimmed.includes("=>") || (trimmed.startsWith("(") && trimmed.includes(")"))) {
    try {
      // Wrap in parentheses to parse as expression
      const expr = parser.parseExpression(`(${trimmed})`);
      return t.jsxExpressionContainer(expr);
    } catch {
      return t.stringLiteral(trimmed);
    }
  }
  // Default: string literal
  return t.stringLiteral(trimmed);
}

export function getAttributeForTag(jsxCode: string, tag: string, attr: string): string {
  const ast = parseJSXToAST(jsxCode);
  const element = findFirstElementByTag(ast, tag);
  if (!element) return "";
  const attrNode = element.openingElement.attributes.find(
    (a: any) => t.isJSXAttribute(a) && a.name.name === attr
  );
  if (!attrNode) return "";
  // For boolean attribute with no value, return "true"
  if (attrNode.value === null) return "true";
  if (t.isStringLiteral(attrNode.value)) return attrNode.value.value;
  if (t.isJSXExpressionContainer(attrNode.value)) {
    // Generate string representation of the expression
    return generate(attrNode.value.expression).code;
  }
  return "";
}

export function setAttributeForTag(jsxCode: string, tag: string, attr: string, value: string): string {
  const ast = parseJSXToAST(jsxCode);
  const element = findFirstElementByTag(ast, tag);
  if (!element) return jsxCode;

  const valueNode = createJSXAttributeValue(value);
  // If valueNode is undefined, it means we should omit the attribute (boolean false)
  if (valueNode === undefined) {
    // Remove attribute if exists
    const attrIndex = element.openingElement.attributes.findIndex(
      (a: any) => t.isJSXAttribute(a) && a.name.name === attr
    );
    if (attrIndex !== -1) {
      element.openingElement.attributes.splice(attrIndex, 1);
    }
  } else {
    // Create or update attribute
    const newAttr = t.jsxAttribute(t.jsxIdentifier(attr), valueNode);
    const attrIndex = element.openingElement.attributes.findIndex(
      (a: any) => t.isJSXAttribute(a) && a.name.name === attr
    );
    if (attrIndex !== -1) {
      element.openingElement.attributes[attrIndex] = newAttr;
    } else {
      element.openingElement.attributes.push(newAttr);
    }
  }
  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}

export function getClassNameForTag(jsxCode: string, tag: string): string {
  return getAttributeForTag(jsxCode, tag, "className");
}

export function setClassNameForTag(jsxCode: string, tag: string, value: string): string {
  return setAttributeForTag(jsxCode, tag, "className", value);
}

export function getTextForTag(jsxCode: string, tag: string): string {
  const ast = parseJSXToAST(jsxCode);
  const element = findFirstElementByTag(ast, tag);
  if (!element) return "";
  let text = "";
  for (const child of element.children) {
    if (t.isJSXText(child)) {
      text += child.value;
    }
  }
  return text.trim();
}

export function setTextForTag(jsxCode: string, tag: string, text: string): string {
  const ast = parseJSXToAST(jsxCode);
  const element = findFirstElementByTag(ast, tag);
  if (!element) return jsxCode;
  // Replace all children with a single JSXText node
  element.children = [t.jsxText(text)];
  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}

/** Drag payload MIME types, shared between the palette (insert) and canvas (move). */
export const WESBYTE_INSERT_MIME = "application/x-wesbyte-insert";
export const WESBYTE_MOVE_MIME = "application/x-wesbyte-move";

function findNthElementPathByTag(ast: any, tagName: string, occurrence: number) {
  let count = -1;
  let foundPath: any = null;
  traverse(ast, {
    JSXElement(path) {
      if (foundPath) return;
      if (path.node.openingElement.name.name === tagName) {
        count++;
        if (count === occurrence) foundPath = path;
      }
    },
  });
  return foundPath;
}

/**
 * Inserts `newElementJsx` (a JSX snippet, e.g. "<button>Click</button>") before or after
 * the nth element matching `targetTag` (0-indexed, in document order — matching how the
 * browser DOM enumerates elements, so the client can count preceding same-tag siblings to
 * find the right instance even when a tag appears more than once on the page).
 *
 * If the target is the component's root returned element (no sibling array to insert
 * into), the new element is nested inside it instead.
 */
export function insertElementNearTag(
  jsxCode: string,
  targetTag: string,
  newElementJsx: string,
  occurrence = 0,
  placement: "before" | "after" = "after"
): string {
  const ast = parseJSXToAST(jsxCode);
  const targetPath = findNthElementPathByTag(ast, targetTag, occurrence);
  if (!targetPath) return jsxCode;

  let newNode: t.Node;
  try {
    newNode = parser.parseExpression(newElementJsx, { plugins: ["jsx"] } as any);
  } catch {
    return jsxCode;
  }
  if (!t.isJSXElement(newNode) && !t.isJSXFragment(newNode)) return jsxCode;

  const parent = targetPath.parent;
  const parentIsJsxContainer = t.isJSXElement(parent) || t.isJSXFragment(parent);

  if (parentIsJsxContainer) {
    if (placement === "before") targetPath.insertBefore(newNode);
    else targetPath.insertAfter(newNode);
  } else {
    // Target is the component's root JSX node (e.g. the outer <div> returned by App).
    // There's no sibling list to insert into, so nest the new element inside it.
    if (placement === "before") targetPath.node.children.unshift(t.jsxText("\n  "), newNode as t.JSXElement);
    else targetPath.node.children.push(t.jsxText("\n  "), newNode as t.JSXElement);
  }

  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}

/**
 * Moves an existing element (identified by tag + nth-occurrence) to sit before/after
 * another element (also identified by tag + nth-occurrence). Both occurrence indices
 * should be computed by the caller against the *same* pre-move DOM snapshot — since this
 * runs as a single AST pass, removing the source node before locating the target (both
 * paths are found up front, in the original tree) keeps the indices consistent even when
 * source and target share a tag name.
 */
export function moveElementNearTag(
  jsxCode: string,
  source: { tag: string; occurrence: number },
  target: { tag: string; occurrence: number },
  placement: "before" | "after"
): string {
  const ast = parseJSXToAST(jsxCode);
  const sourcePath = findNthElementPathByTag(ast, source.tag, source.occurrence);
  const targetPath = findNthElementPathByTag(ast, target.tag, target.occurrence);
  if (!sourcePath || !targetPath || sourcePath.node === targetPath.node) return jsxCode;

  // Refuse to drop an element inside (or next to, via its own descendant) itself.
  let ancestor = targetPath.parentPath;
  while (ancestor) {
    if (ancestor.node === sourcePath.node) return jsxCode;
    ancestor = ancestor.parentPath;
  }

  const movedNode = t.cloneNode(sourcePath.node, true);
  sourcePath.remove();

  if (placement === "before") targetPath.insertBefore(movedNode);
  else targetPath.insertAfter(movedNode);

  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}