"use client";

import { StyleEditor, StyleValues } from "./StyleEditor";
import type { ElementAttributes } from "./attributeSchema";

const VOID_TAGS = ["img", "input", "br", "hr", "meta", "link"];
const TEXT_EDITABLE_TAGS = [
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "button", "li", "td", "th", "label", "strong", "em",
  "b", "i", "pre", "code", "figcaption",
];

const ONCLICK_PRESETS = [
  { value: "", label: "None" },
  { value: "() => alert('Hello!')", label: "Alert('Hello!')" },
  { value: "() => console.log('Clicked')", label: "Console.log('Clicked')" },
  { value: "() => window.location.href = '/'", label: "Navigate to /" },
  { value: "() => window.open('https://google.com', '_blank')", label: "Open new tab" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full p-2 border rounded-md bg-background mt-1";

interface AttributeFieldsProps {
  rawTag: string;
  attributes: ElementAttributes;
  onChange: (key: keyof ElementAttributes, value: string | boolean) => void;
  stylesObj: StyleValues;
  onStyleChange: (styles: StyleValues) => void;
}

/** Renders the tag-appropriate set of editable attribute inputs. Used by both the desktop PropertyPanel and MobilePropertySheet so they can never drift out of sync. */
export function AttributeFields({ rawTag, attributes, onChange, stylesObj, onStyleChange }: AttributeFieldsProps) {
  const tagLower = rawTag.toLowerCase();
  const isVoid = VOID_TAGS.includes(tagLower);
  const textEditable = TEXT_EDITABLE_TAGS.includes(tagLower);
  const isFormControl = tagLower === "input" || tagLower === "textarea";

  return (
    <>
      <Field label="Tag">
        <div className="mt-1 p-2 border rounded-md bg-muted/30">{rawTag}</div>
      </Field>

      <Field label="Class Name">
        <input
          type="text"
          value={attributes.className}
          onChange={(e) => onChange("className", e.target.value)}
          placeholder="className"
          className={inputClass}
        />
      </Field>

      <Field label="ID">
        <input
          type="text"
          value={attributes.id}
          onChange={(e) => onChange("id", e.target.value)}
          placeholder="id"
          className={inputClass}
        />
      </Field>

      {!isVoid && textEditable && (
        <Field label="Text Content">
          <input
            type="text"
            value={attributes.text}
            onChange={(e) => onChange("text", e.target.value)}
            placeholder="text"
            className={inputClass}
          />
        </Field>
      )}

      {tagLower === "img" && (
        <>
          <Field label="Source (src)">
            <input
              type="text"
              value={attributes.src}
              onChange={(e) => onChange("src", e.target.value)}
              placeholder="image url"
              className={inputClass}
            />
          </Field>
          <Field label="Alt Text">
            <input
              type="text"
              value={attributes.alt}
              onChange={(e) => onChange("alt", e.target.value)}
              placeholder="alt"
              className={inputClass}
            />
          </Field>
        </>
      )}

      {tagLower === "a" && (
        <>
          <Field label="Href">
            <input
              type="text"
              value={attributes.href}
              onChange={(e) => onChange("href", e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
          <Field label="Target">
            <input
              type="text"
              value={attributes.target}
              onChange={(e) => onChange("target", e.target.value)}
              placeholder="_blank"
              className={inputClass}
            />
          </Field>
          <Field label="Rel">
            <input
              type="text"
              value={attributes.rel}
              onChange={(e) => onChange("rel", e.target.value)}
              placeholder="noopener"
              className={inputClass}
            />
          </Field>
        </>
      )}

      <div>
        <label className="text-sm font-medium">Visual Styles</label>
        <div className="mt-1">
          <StyleEditor styles={stylesObj} onChange={onStyleChange} />
        </div>
      </div>

      {isFormControl && (
        <>
          <Field label="Placeholder">
            <input
              type="text"
              value={attributes.placeholder}
              onChange={(e) => onChange("placeholder", e.target.value)}
              placeholder="placeholder"
              className={inputClass}
            />
          </Field>
          <Field label="Auto Complete">
            <input
              type="text"
              value={attributes.autoComplete}
              onChange={(e) => onChange("autoComplete", e.target.value)}
              placeholder="off"
              className={inputClass}
            />
          </Field>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Disabled</label>
            <input
              type="checkbox"
              checked={attributes.disabled}
              onChange={(e) => onChange("disabled", e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Read Only</label>
            <input
              type="checkbox"
              checked={attributes.readOnly}
              onChange={(e) => onChange("readOnly", e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </>
      )}

      <Field label="Tab Index">
        <input
          type="text"
          value={attributes.tabIndex}
          onChange={(e) => onChange("tabIndex", e.target.value)}
          placeholder="0"
          className={inputClass}
        />
      </Field>

      <Field label="Aria Label">
        <input
          type="text"
          value={attributes.ariaLabel}
          onChange={(e) => onChange("ariaLabel", e.target.value)}
          placeholder="accessible name"
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Aria Hidden</label>
        <input
          type="checkbox"
          checked={attributes.ariaHidden}
          onChange={(e) => onChange("ariaHidden", e.target.checked)}
          className="h-4 w-4"
        />
      </div>

      <Field label="On Click">
        <select
          value={attributes.onClick}
          onChange={(e) => onChange("onClick", e.target.value)}
          className={inputClass}
        >
          {ONCLICK_PRESETS.map((preset) => (
            <option key={preset.label} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}
