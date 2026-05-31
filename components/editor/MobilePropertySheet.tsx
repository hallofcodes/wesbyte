"use client";

import { useState, useEffect, useRef } from "react";
import { X, Settings } from "lucide-react";
import { StyleEditor, StyleValues } from "./StyleEditor";
import { Button } from "@/components/ui/button";
import { styleObjToString, stringToStyleObj } from "@/lib/styleUtils";

export function MobilePropertySheet({
  isOpen,
  onClose,
  selectedElement,
  selectedElementRaw,
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
  customAttrKey,
  customAttrValue,
  onCustomAttrKeyChange,
  onCustomAttrValueChange,
  onAddCustomAttr,
  isCustomComponent,
  customComponentFilePath,
  onOpenFile,
}: any) {
  const [stylesObj, setStylesObj] = useState<StyleValues>({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showHeightMenu, setShowHeightMenu] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(60);
  const [tempHeight, setTempHeight] = useState(60);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (!styleValue) {
      setStylesObj({});
      return;
    }
    setStylesObj(stringToStyleObj(styleValue));
  }, [styleValue]);

  const handleStyleChange = (newStyles: StyleValues) => {
    isInternalUpdate.current = true;
    setStylesObj(newStyles);
    const newStyleStr = styleObjToString(newStyles);
    onStyleChange(newStyleStr);
  };

  const handleHeightSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempHeight(Number(e.target.value));
  };
  const commitHeight = () => {
    setSheetHeight(tempHeight);
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
    <div className="fixed inset-0 z-50 flex items-end md:hidden">
      <div
        className="relative bg-background w-full rounded-t-xl shadow-xl flex flex-col transition-all duration-300 ease-out"
        style={{ maxHeight: `${sheetHeight}vh` }}
      >
        <div className="flex justify-center pt-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Properties</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHeightMenu(!showHeightMenu)}
              className="p-1 rounded-md hover:bg-muted"
              title="Adjust sheet height"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {showHeightMenu && (
          <div className="absolute right-4 top-16 z-10 bg-popover border rounded-md shadow-md p-3 w-48">
            <div className="text-xs font-medium text-muted-foreground mb-2">Sheet height: {tempHeight}%</div>
            <input
              type="range"
              min="20"
              max="80"
              step="1"
              value={tempHeight}
              onChange={handleHeightSlider}
              onMouseUp={commitHeight}
              onTouchEnd={commitHeight}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>20%</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
        )}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: `calc(${sheetHeight}vh - 70px)` }}>
          {!selectedElement || !selectedElementRaw ? (
            <p className="text-muted-foreground text-sm">
              {interactiveMode
                ? "Shift+click an element to edit properties."
                : "Click an element to edit properties."}
            </p>
          ) : isCustomComponent ? (
            <div className="p-4 border rounded-md bg-muted/20 text-center space-y-3">
              <p className="text-sm">
                This is a custom component (<strong>{selectedElementRaw}</strong>).
              </p>
              <p className="text-xs text-muted-foreground">
                Edit its source code directly.
              </p>
              {customComponentFilePath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onOpenFile?.(customComponentFilePath)}
                >
                  Edit {customComponentFilePath}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Tag</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/30">{selectedElementRaw}</div>
              </div>
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
              <div>
                <label className="text-sm font-medium">Visual Styles</label>
                <StyleEditor styles={stylesObj} onChange={handleStyleChange} />
              </div>
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

      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Add Custom Attribute</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={customAttrKey}
                onChange={(e) => onCustomAttrKeyChange(e.target.value)}
                placeholder="Attribute name"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                value={customAttrValue}
                onChange={(e) => onCustomAttrValueChange(e.target.value)}
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
                  onClick={() => {
                    onAddCustomAttr();
                    setShowCustomModal(false);
                  }}
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