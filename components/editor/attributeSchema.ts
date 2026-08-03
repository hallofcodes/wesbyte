import {
  getAttributeForTag,
  getClassNameForTag,
  getTextForTag,
} from "./editor-helpers";

/**
 * Every attribute the Property Panel / Mobile Property Sheet can edit,
 * as one object instead of 19 separate `useState` calls.
 */
export interface ElementAttributes {
  className: string;
  id: string;
  text: string;
  src: string;
  alt: string;
  href: string;
  target: string;
  rel: string;
  style: string;
  width: string;
  height: string;
  placeholder: string;
  disabled: boolean;
  readOnly: boolean;
  autoComplete: string;
  tabIndex: string;
  ariaLabel: string;
  ariaHidden: boolean;
  onClick: string;
}

export const EMPTY_ATTRIBUTES: ElementAttributes = {
  className: "",
  id: "",
  text: "",
  src: "",
  alt: "",
  href: "",
  target: "",
  rel: "",
  style: "",
  width: "",
  height: "",
  placeholder: "",
  disabled: false,
  readOnly: false,
  autoComplete: "",
  tabIndex: "",
  ariaLabel: "",
  ariaHidden: false,
  onClick: "",
};

/** Maps an ElementAttributes key to the real JSX attribute name, where they differ. */
export const ATTR_JSX_NAME: Partial<Record<keyof ElementAttributes, string>> = {
  ariaLabel: "aria-label",
  ariaHidden: "aria-hidden",
};

const BOOLEAN_ATTRS: ReadonlySet<keyof ElementAttributes> = new Set([
  "disabled",
  "readOnly",
  "ariaHidden",
]);

export function isBooleanAttribute(key: keyof ElementAttributes): boolean {
  return BOOLEAN_ATTRS.has(key);
}

/** Reads all editable attributes for the first element matching `tag` out of `code`. */
export function readAttributesForTag(code: string, tag: string): ElementAttributes {
  const get = (attr: keyof ElementAttributes) =>
    getAttributeForTag(code, tag, ATTR_JSX_NAME[attr] ?? attr);

  return {
    className: getClassNameForTag(code, tag),
    id: get("id"),
    text: getTextForTag(code, tag),
    src: get("src"),
    alt: get("alt"),
    href: get("href"),
    target: get("target"),
    rel: get("rel"),
    style: get("style"),
    width: get("width"),
    height: get("height"),
    placeholder: get("placeholder"),
    disabled: get("disabled") === "true",
    readOnly: get("readOnly") === "true",
    autoComplete: get("autoComplete"),
    tabIndex: get("tabIndex"),
    ariaLabel: get("ariaLabel"),
    ariaHidden: get("ariaHidden") === "true",
    onClick: get("onClick"),
  };
}
