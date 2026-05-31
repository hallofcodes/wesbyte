import { StyleValues } from "@/components/editor/StyleEditor";

export function styleObjToString(styles: StyleValues): string {
  const entries = Object.entries(styles).filter(([_, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  
  // Build a plain object, then stringify it
  const obj: Record<string, string> = {};
  for (const [k, v] of entries) {
    obj[k] = v;
  }
  // JSON.stringify produces valid JS object literal with double-quoted strings
  const json = JSON.stringify(obj);
  // Remove the outer braces to get { ... } (JSON.stringify adds them)
  return json.replace(/^{/, "{ ").replace(/}$/, " }");
}

export function stringToStyleObj(str: string): StyleValues {
  if (!str || str === "{}") return {};
  try {
    // str looks like '{ "color": "#ff0000", "marginTop": "16px" }'
    // Wrap in parentheses and evaluate safely
    const obj = Function(`"use strict"; return (${str})`)();
    return obj;
  } catch (e) {
    console.error("Failed to parse style string:", str);
    return {};
  }
}