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
  const target = tagName.toLowerCase();
  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name.name;
      if (!foundNode && typeof name === "string" && name.toLowerCase() === target) {
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

function findNthElementPathByTag(ast: any, tagName: string, occurrence: number) {
  let count = -1;
  let foundPath: any = null;
  const target = tagName.toLowerCase();
  traverse(ast, {
    JSXElement(path) {
      if (foundPath) return;
      const name = path.node.openingElement.name.name;
      if (typeof name === "string" && name.toLowerCase() === target) {
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

/**
 * Finds the outermost JSXElement in the file — the root node returned by the component
 * (e.g. the top-level <div> in `return (<div>...</div>)`). Used as a fallback insertion
 * point when a drop lands on empty canvas space rather than directly over a rendered
 * element, since in that case there's no target tag/occurrence to anchor to.
 */
function findRootJSXElementPath(ast: any) {
  let rootPath: any = null;
  traverse(ast, {
    JSXElement(path) {
      if (rootPath) return;
      let ancestor = path.parentPath;
      let hasJsxAncestor = false;
      while (ancestor) {
        if (ancestor.isJSXElement() || ancestor.isJSXFragment()) {
          hasJsxAncestor = true;
          break;
        }
        ancestor = ancestor.parentPath;
      }
      if (!hasJsxAncestor) rootPath = path;
    },
  });
  return rootPath;
}

/** Appends a new JSX snippet as the last child of the component's root element. */
export function appendElementToRoot(jsxCode: string, newElementJsx: string): string {
  const ast = parseJSXToAST(jsxCode);
  const rootPath = findRootJSXElementPath(ast);
  if (!rootPath) return jsxCode;

  let newNode: t.Node;
  try {
    newNode = parser.parseExpression(newElementJsx, { plugins: ["jsx"] } as any);
  } catch {
    return jsxCode;
  }
  if (!t.isJSXElement(newNode) && !t.isJSXFragment(newNode)) return jsxCode;

  rootPath.node.children.push(t.jsxText("\n  "), newNode);

  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}

/** Moves an existing element (by tag + nth-occurrence) to become the last child of the root element. */
export function moveElementToRootEnd(
  jsxCode: string,
  source: { tag: string; occurrence: number }
): string {
  const ast = parseJSXToAST(jsxCode);
  const sourcePath = findNthElementPathByTag(ast, source.tag, source.occurrence);
  const rootPath = findRootJSXElementPath(ast);
  if (!sourcePath || !rootPath || sourcePath.node === rootPath.node) return jsxCode;

  const movedNode = t.cloneNode(sourcePath.node, true);
  sourcePath.remove();
  rootPath.node.children.push(t.jsxText("\n  "), movedNode);

  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}
// ---------------------------------------------------------------------------
// Stable element identity (data-wb-id)
// ---------------------------------------------------------------------------

/**
 * Attribute injected into the *preview* build of App.jsx so every element rendered in the
 * canvas can be traced back to an exact node in the source AST. Targeting by tag name plus
 * "nth occurrence in the DOM" is unreliable, because custom components (e.g. `<Hero />`)
 * expand into many DOM nodes that don't exist in App.jsx — so DOM and AST indices drift
 * apart and edits land in the wrong place or silently no-op. An id is simply the node's
 * traversal index, which is deterministic for a given source, so the same index resolves
 * to the same node in both the annotate pass and the edit pass.
 */
export const WB_ID_ATTR = "data-wb-id";

/** Returns a copy of `jsxCode` with a `data-wb-id` on every element. Used only to render the editor preview — never persisted to the user's files. */
export function annotateJsxWithIds(jsxCode: string): string {
  let ast;
  try {
    ast = parseJSXToAST(jsxCode);
  } catch {
    return jsxCode; // invalid/mid-edit code: render as-is rather than throwing
  }
  let index = 0;
  traverse(ast, {
    JSXElement(path) {
      const id = String(index++);
      path.node.openingElement.attributes.push(
        t.jsxAttribute(t.jsxIdentifier(WB_ID_ATTR), t.stringLiteral(id))
      );
    },
  });
  return generate(ast, { retainLines: false, compact: false }).code;
}

/** Finds the JSXElement at a given traversal index — the counterpart to annotateJsxWithIds. */
function findPathByIndex(ast: any, targetIndex: number) {
  let index = 0;
  let foundPath: any = null;
  traverse(ast, {
    JSXElement(path) {
      if (foundPath) return;
      if (index === targetIndex) foundPath = path;
      index++;
    },
  });
  return foundPath;
}

/** Reads the text content of the element at a given wb-id index. */
export function getTextForIndex(jsxCode: string, targetIndex: number): string {
  let ast;
  try {
    ast = parseJSXToAST(jsxCode);
  } catch {
    return "";
  }
  const path = findPathByIndex(ast, targetIndex);
  if (!path) return "";
  return path.node.children
    .filter((c: any) => t.isJSXText(c))
    .map((c: any) => c.value)
    .join("")
    .trim();
}

/** Replaces the text content of the element at a given wb-id index. */
export function setTextForIndex(jsxCode: string, targetIndex: number, text: string): string {
  const ast = parseJSXToAST(jsxCode);
  const path = findPathByIndex(ast, targetIndex);
  if (!path) return jsxCode;
  path.node.children = [t.jsxText(text)];
  return generate(ast, { retainLines: false, compact: false }).code;
}

/** Reads a single attribute off the element at a given wb-id index. */
export function getAttributeForIndex(jsxCode: string, targetIndex: number, attr: string): string {
  let ast;
  try {
    ast = parseJSXToAST(jsxCode);
  } catch {
    return "";
  }
  const path = findPathByIndex(ast, targetIndex);
  if (!path) return "";
  const attrNode = path.node.openingElement.attributes.find(
    (a: any) => t.isJSXAttribute(a) && a.name.name === attr
  );
  if (!attrNode) return "";
  if (attrNode.value === null) return "true";
  if (t.isStringLiteral(attrNode.value)) return attrNode.value.value;
  if (t.isJSXExpressionContainer(attrNode.value)) return generate(attrNode.value.expression).code;
  return "";
}

/** Sets (or removes, when value resolves to `false`) an attribute on the element at a given wb-id index. */
export function setAttributeForIndex(
  jsxCode: string,
  targetIndex: number,
  attr: string,
  value: string
): string {
  const ast = parseJSXToAST(jsxCode);
  const path = findPathByIndex(ast, targetIndex);
  if (!path) return jsxCode;

  const attrs = path.node.openingElement.attributes;
  const existingIndex = attrs.findIndex((a: any) => t.isJSXAttribute(a) && a.name.name === attr);
  const valueNode = createJSXAttributeValue(value);

  if (valueNode === undefined) {
    if (existingIndex !== -1) attrs.splice(existingIndex, 1);
  } else {
    const newAttr = t.jsxAttribute(t.jsxIdentifier(attr), valueNode);
    if (existingIndex !== -1) attrs[existingIndex] = newAttr;
    else attrs.push(newAttr);
  }
  return generate(ast, { retainLines: false, compact: false }).code;
}

/** Inserts a new snippet before/after the element identified by its stable wb-id index. */
export function insertElementAtIndex(
  jsxCode: string,
  targetIndex: number,
  newElementJsx: string,
  placement: "before" | "after"
): string {
  const ast = parseJSXToAST(jsxCode);
  const targetPath = findPathByIndex(ast, targetIndex);
  if (!targetPath) return jsxCode;

  let newNode: t.Node;
  try {
    newNode = parser.parseExpression(newElementJsx, { plugins: ["jsx"] } as any);
  } catch {
    return jsxCode;
  }
  if (!t.isJSXElement(newNode) && !t.isJSXFragment(newNode)) return jsxCode;

  const parent = targetPath.parent;
  if (t.isJSXElement(parent) || t.isJSXFragment(parent)) {
    if (placement === "before") targetPath.insertBefore(newNode);
    else targetPath.insertAfter(newNode);
  } else {
    // Target is the root returned element — no sibling list, so nest inside it instead.
    if (placement === "before") targetPath.node.children.unshift(t.jsxText("\n  "), newNode as t.JSXElement);
    else targetPath.node.children.push(t.jsxText("\n  "), newNode as t.JSXElement);
  }
  return generate(ast, { retainLines: false, compact: false }).code;
}

/** Moves the element at `sourceIndex` to sit before/after the element at `targetIndex`. */
export function moveElementToIndex(
  jsxCode: string,
  sourceIndex: number,
  targetIndex: number,
  placement: "before" | "after"
): string {
  const ast = parseJSXToAST(jsxCode);
  const sourcePath = findPathByIndex(ast, sourceIndex);
  const targetPath = findPathByIndex(ast, targetIndex);
  if (!sourcePath || !targetPath || sourcePath.node === targetPath.node) return jsxCode;

  // Refuse to move a node into its own subtree, which would detach the tree.
  let ancestor = targetPath.parentPath;
  while (ancestor) {
    if (ancestor.node === sourcePath.node) return jsxCode;
    ancestor = ancestor.parentPath;
  }

  const movedNode = t.cloneNode(sourcePath.node, true);
  sourcePath.remove();

  const targetParent = targetPath.parent;
  if (t.isJSXElement(targetParent) || t.isJSXFragment(targetParent)) {
    if (placement === "before") targetPath.insertBefore(movedNode);
    else targetPath.insertAfter(movedNode);
  } else {
    if (placement === "before") targetPath.node.children.unshift(t.jsxText("\n  "), movedNode);
    else targetPath.node.children.push(t.jsxText("\n  "), movedNode);
  }
  return generate(ast, { retainLines: false, compact: false }).code;
}

/** Moves the element at `sourceIndex` to become the last child of the root element. */
export function moveElementIndexToRootEnd(jsxCode: string, sourceIndex: number): string {
  const ast = parseJSXToAST(jsxCode);
  const sourcePath = findPathByIndex(ast, sourceIndex);
  const rootPath = findRootJSXElementPath(ast);
  if (!sourcePath || !rootPath || sourcePath.node === rootPath.node) return jsxCode;

  const movedNode = t.cloneNode(sourcePath.node, true);
  sourcePath.remove();
  rootPath.node.children.push(t.jsxText("\n  "), movedNode);
  return generate(ast, { retainLines: false, compact: false }).code;
}
