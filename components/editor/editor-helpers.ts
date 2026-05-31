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
  const lines = jsxCode.split("\n");
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
  if (attrName === "style") {
  console.log("Style value before parsing:", value);
  console.log("Trimmed starts with { ?", trimmed.startsWith("{"));
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