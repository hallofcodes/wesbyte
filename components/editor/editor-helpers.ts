export type JsxNode = {
  tag: string;
  children: JsxNode[];
};

export function parseJsxToTree(jsxCode: string): JsxNode[] {
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

export function getAttributeForTag(jsxCode: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}\\b[^>]*?\\b${attr}="([^"]*)"`, "i");
  const match = jsxCode.match(regex);
  return match ? match[1] : "";
}

export function setAttributeForTag(jsxCode: string, tag: string, attr: string, value: string): string {
  const openTagRegex = new RegExp(`(<${tag}\\b[^>]*?)(/?>)`, "i");
  const match = jsxCode.match(openTagRegex);
  if (!match) return jsxCode;

  const fullMatch = match[0];
  const openingPart = match[1];
  const closingPart = match[2];
  const attrRegex = new RegExp(`\\b${attr}="[^"]*"`, "i");
  let newOpeningPart: string;
  if (attrRegex.test(openingPart)) {
    newOpeningPart = openingPart.replace(attrRegex, `${attr}="${value}"`);
  } else {
    newOpeningPart = openingPart + ` ${attr}="${value}"`;
  }
  const newFullMatch = newOpeningPart + closingPart;
  return jsxCode.replace(fullMatch, newFullMatch);
}

export function getClassNameForTag(jsxCode: string, tag: string): string {
  return getAttributeForTag(jsxCode, tag, "className");
}

export function setClassNameForTag(jsxCode: string, tag: string, value: string): string {
  return setAttributeForTag(jsxCode, tag, "className", value);
}

const voidElements = new Set(["img", "input", "br", "hr", "meta", "link"]);

export function getTextForTag(jsxCode: string, tag: string): string {
  if (voidElements.has(tag)) return "";
  if (new RegExp(`<${tag}\\b[^>]*\\/\\s*>`, "i").test(jsxCode)) return "";
  const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = jsxCode.match(regex);
  if (match && match[1]) {
    return match[1].trim().replace(/<[^>]*>/g, "").trim();
  }
  return "";
}

export function setTextForTag(jsxCode: string, tag: string, text: string): string {
  if (voidElements.has(tag)) return jsxCode;

  // Handle self‑closing tags: capture exact tag name case
  const selfClosingRegex = new RegExp(`(<(${tag})\\b[^>]*?)(\\/\\s*>)`, "i");
  const selfMatch = jsxCode.match(selfClosingRegex);
  if (selfMatch) {
    const exactTag = selfMatch[2];  // preserves original case (e.g., "Header")
    const openingPart = selfMatch[1];
    const newTag = `${openingPart}>${text}</${exactTag}>`;
    return jsxCode.replace(selfClosingRegex, newTag);
  }

  // Handle normal tags: preserve case from opening tag
  const normalRegex = new RegExp(`(<(${tag})\\b[^>]*>)[\\s\\S]*?(<\\/\\2>)`, "i");
  const normalMatch = jsxCode.match(normalRegex);
  if (normalMatch) {
    const exactTag = normalMatch[2];
    const openingTag = normalMatch[1];
    const closingTag = normalMatch[3];
    return jsxCode.replace(normalRegex, `${openingTag}${text}${closingTag}`);
  }
  return jsxCode;
}