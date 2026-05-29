"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { StyleEditor, StyleValues } from "./StyleEditor";

function styleObjToString(styles: StyleValues): string {
  const entries = Object.entries(styles).filter(([_, v]) => v && v !== "");
  if (entries.length === 0) return "";
  const inner = entries.map(([k, v]) => `${k}: ${typeof v === "string" && v.includes(" ") ? `"${v}"` : v}`).join(", ");
  return `{ ${inner} }`;
}

function stringToStyleObj(str: string): StyleValues {
  if (!str || str === "{}") return {};
  try {
    const cleaned = str.slice(1, -1).trim();
    const parsed = Function(`"use strict"; return ({ ${cleaned} })`)();
    return parsed;
  } catch {
    return {};
  }
}

export function MobilePropertySheet({
  isOpen,
  onClose,
  selectedElement,
  classNameValue,
  onClassNameChange,
  idValue,
  onIdChange,
  textValue,
  onTextChange,
  srcValue,
  onSrcChange,
  altValue,
  onAltChange,
  hrefValue,
  onHrefChange,
  targetValue,
  onTargetChange,
  relValue,
  onRelChange,
  styleValue,
  onStyleChange,
  widthValue,
  onWidthChange,
  heightValue,
  onHeightChange,
  placeholderValue,
  onPlaceholderChange,
  disabledChecked,
  onDisabledChange,
  readOnlyChecked,
  onReadOnlyChange,
  autoCompleteValue,
  onAutoCompleteChange,
  tabIndexValue,
  onTabIndexChange,
  ariaLabelValue,
  onAriaLabelChange,
  ariaHiddenChecked,
  onAriaHiddenChange,
  onClickValue,
  onOnClickChange,
  interactiveMode,
}: any) {
  const [stylesObj, setStylesObj] = useState<StyleValues>({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAttrKey, setCustomAttrKey] = useState("");
  const [customAttrValue, setCustomAttrValue] = useState("");

  useEffect(() => {
    if (!styleValue) {
      setStylesObj({});
      return;
    }
    setStylesObj(stringToStyleObj(styleValue));
  }, [styleValue]);

  const handleStyleChange = (newStyles: StyleValues) => {
    setStylesObj(newStyles);
    const newStyleStr = styleObjToString(newStyles);
    onStyleChange(newStyleStr);
  };

  const handleAddCustomAttr = () => {
    if (!selectedElement || !customAttrKey) return;
    // This should call the parent's add custom attribute function
    // We need to pass it from EditorPageContent. For now, we'll just close the modal
    console.log("Add custom attribute", customAttrKey, customAttrValue);
    setShowCustomModal(false);
    setCustomAttrKey("");
    setCustomAttrValue("");
  };

  if (!isOpen) return null;

  const tagLower = selectedElement?.toLowerCase() || "";
  const isVoid = ["img", "input", "br", "hr", "meta", "link"].includes(tagLower);
  const textEditable = [
    "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "button", "li", "td", "th", "label", "strong", "em",
    "b", "i", "pre", "code", "figcaption",
  ].includes(tagLower);

  return (
    <div className="fixed md:hidden left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out translate-y-0">
      <div
        className="bg-background border-t rounded-t-xl shadow-lg overflow-auto"
        style={{ height: "55vh", maxHeight: "55vh" }}
      >
        <div className="sticky top-0 flex justify-between items-center p-3 border-b bg-background">
          <h3 className="font-semibold">Properties</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-auto">
          {!selectedElement ? (
            <p className="text-muted-foreground text-sm">
              {interactiveMode
                ? "Shift+click an element to edit properties."
                : "Click an element to edit properties."}
            </p>
          ) : (
            <>
              {/* Tag */}
              <div>
                <label className="text-sm font-medium">Tag</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/30">{selectedElement}</div>
              </div>

              {/* Basic attributes */}
              <div>
                <label className="text-sm font-medium">Class Name</label>
                <input
                  type="text"
                  value={classNameValue}
                  onChange={(e) => onClassNameChange(e.target.value)}
                  placeholder="className"
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ID</label>
                <input
                  type="text"
                  value={idValue}
                  onChange={(e) => onIdChange(e.target.value)}
                  placeholder="id"
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>

              {/* Text content */}
              {!isVoid && textEditable && (
                <div>
                  <label className="text-sm font-medium">Text Content</label>
                  <input
                    type="text"
                    value={textValue}
                    onChange={(e) => onTextChange(e.target.value)}
                    placeholder="text"
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
              )}

              {/* Image specific */}
              {tagLower === "img" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Source (src)</label>
                    <input
                      type="text"
                      value={srcValue}
                      onChange={(e) => onSrcChange(e.target.value)}
                      placeholder="image url"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alt Text</label>
                    <input
                      type="text"
                      value={altValue}
                      onChange={(e) => onAltChange(e.target.value)}
                      placeholder="alt"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                </>
              )}

              {/* Link specific */}
              {tagLower === "a" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Href</label>
                    <input
                      type="text"
                      value={hrefValue}
                      onChange={(e) => onHrefChange(e.target.value)}
                      placeholder="https://"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target</label>
                    <input
                      type="text"
                      value={targetValue}
                      onChange={(e) => onTargetChange(e.target.value)}
                      placeholder="_blank"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rel</label>
                    <input
                      type="text"
                      value={relValue}
                      onChange={(e) => onRelChange(e.target.value)}
                      placeholder="noopener"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                </>
              )}

              {/* Visual Style Editor */}
              <div>
                <label className="text-sm font-medium">Visual Styles</label>
                <StyleEditor styles={stylesObj} onChange={handleStyleChange} />
              </div>

              {/* Width/Height (optional, also available in style editor) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Width</label>
                  <input
                    type="text"
                    value={widthValue}
                    onChange={(e) => onWidthChange(e.target.value)}
                    placeholder="auto"
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Height</label>
                  <input
                    type="text"
                    value={heightValue}
                    onChange={(e) => onHeightChange(e.target.value)}
                    placeholder="auto"
                    className="w-full p-2 border rounded-md bg-background"
                  />
                </div>
              </div>

              {/* Input/textarea specific */}
              {(tagLower === "input" || tagLower === "textarea") && (
                <>
                  <div>
                    <label className="text-sm font-medium">Placeholder</label>
                    <input
                      type="text"
                      value={placeholderValue}
                      onChange={(e) => onPlaceholderChange(e.target.value)}
                      placeholder="placeholder"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto Complete</label>
                    <input
                      type="text"
                      value={autoCompleteValue}
                      onChange={(e) => onAutoCompleteChange(e.target.value)}
                      placeholder="off"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Disabled</label>
                    <input
                      type="checkbox"
                      checked={disabledChecked}
                      onChange={(e) => onDisabledChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Read Only</label>
                    <input
                      type="checkbox"
                      checked={readOnlyChecked}
                      onChange={(e) => onReadOnlyChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </>
              )}

              {/* Tab index */}
              <div>
                <label className="text-sm font-medium">Tab Index</label>
                <input
                  type="text"
                  value={tabIndexValue}
                  onChange={(e) => onTabIndexChange(e.target.value)}
                  placeholder="0"
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>

              {/* ARIA attributes */}
              <div>
                <label className="text-sm font-medium">Aria Label</label>
                <input
                  type="text"
                  value={ariaLabelValue}
                  onChange={(e) => onAriaLabelChange(e.target.value)}
                  placeholder="accessible name"
                  className="w-full p-2 border rounded-md bg-background"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Aria Hidden</label>
                <input
                  type="checkbox"
                  checked={ariaHiddenChecked}
                  onChange={(e) => onAriaHiddenChange(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {/* Event handler */}
              <div>
                <label className="text-sm font-medium">On Click</label>
                <select
                  value={onClickValue === "" ? "none" : onClickValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    onOnClickChange(val === "none" ? "" : val);
                  }}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="none">None</option>
                  <option value="() => alert('Hello!')">Alert('Hello!')</option>
                  <option value="() => console.log('Clicked')">Console.log('Clicked')</option>
                  <option value="() => window.location.href = '/'">Navigate to /</option>
                  <option value="() => window.open('https://google.com', '_blank')">Open new tab</option>
                </select>
              </div>

              {/* Custom Attribute button */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm w-full"
                >
                  Add Custom Attribute
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Custom Attribute Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Add Custom Attribute</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={customAttrKey}
                onChange={(e) => setCustomAttrKey(e.target.value)}
                placeholder="Attribute name"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                value={customAttrValue}
                onChange={(e) => setCustomAttrValue(e.target.value)}
                placeholder="Value"
                className="w-full p-2 border rounded-md"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomAttr}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}