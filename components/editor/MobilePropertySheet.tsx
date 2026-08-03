"use client";

import { useState, useEffect, useRef } from "react";
import { X, Settings } from "lucide-react";
import { StyleValues } from "./StyleEditor";
import { Button } from "@/components/ui/button";
import { styleObjToString, stringToStyleObj } from "@/lib/styleUtils";
import { AttributeFields } from "./AttributeFields";
import { CustomAttributeModal } from "./CustomAttributeModal";
import type { ElementAttributes } from "./attributeSchema";

const MIN_SHEET_HEIGHT_VH = 20;
const MAX_SHEET_HEIGHT_VH = 80;
const DEFAULT_SHEET_HEIGHT_VH = 60;

interface MobilePropertySheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedElement: string | null;
  selectedElementRaw: string | null;
  attributes: ElementAttributes;
  onAttributeChange: (key: keyof ElementAttributes, value: string | boolean) => void;
  interactiveMode: boolean;
  customAttrKey: string;
  customAttrValue: string;
  onCustomAttrKeyChange: (value: string) => void;
  onCustomAttrValueChange: (value: string) => void;
  onAddCustomAttr: () => void;
  isCustomComponent: boolean;
  customComponentFilePath: string | null;
  onOpenFile: (filePath: string) => void;
}

export function MobilePropertySheet({
  isOpen,
  onClose,
  selectedElement,
  selectedElementRaw,
  attributes,
  onAttributeChange,
  interactiveMode,
  customAttrKey,
  customAttrValue,
  onCustomAttrKeyChange,
  onCustomAttrValueChange,
  onAddCustomAttr,
  isCustomComponent,
  customComponentFilePath,
  onOpenFile,
}: MobilePropertySheetProps) {
  const [stylesObj, setStylesObj] = useState<StyleValues>({});
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showHeightMenu, setShowHeightMenu] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_HEIGHT_VH);
  const [tempHeight, setTempHeight] = useState(DEFAULT_SHEET_HEIGHT_VH);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setStylesObj(attributes.style ? stringToStyleObj(attributes.style) : {});
  }, [attributes.style]);

  const handleStyleChange = (newStyles: StyleValues) => {
    isInternalUpdate.current = true;
    setStylesObj(newStyles);
    onAttributeChange("style", styleObjToString(newStyles));
  };

  const handleHeightSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempHeight(Number(e.target.value));
  };
  const commitHeight = () => setSheetHeight(tempHeight);

  if (!isOpen) return null;

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
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Sheet height: {tempHeight}%
            </div>
            <input
              type="range"
              min={MIN_SHEET_HEIGHT_VH}
              max={MAX_SHEET_HEIGHT_VH}
              step={1}
              value={tempHeight}
              onChange={handleHeightSlider}
              onMouseUp={commitHeight}
              onTouchEnd={commitHeight}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{MIN_SHEET_HEIGHT_VH}%</span>
              <span>50%</span>
              <span>{MAX_SHEET_HEIGHT_VH}%</span>
            </div>
          </div>
        )}

        <div
          className="overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: `calc(${sheetHeight}vh - 70px)` }}
        >
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
              <p className="text-xs text-muted-foreground">Edit its source code directly.</p>
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
              <AttributeFields
                rawTag={selectedElementRaw}
                attributes={attributes}
                onChange={onAttributeChange}
                stylesObj={stylesObj}
                onStyleChange={handleStyleChange}
              />
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
        <CustomAttributeModal
          attrKey={customAttrKey}
          attrValue={customAttrValue}
          onKeyChange={onCustomAttrKeyChange}
          onValueChange={onCustomAttrValueChange}
          onCancel={() => setShowCustomModal(false)}
          onAdd={() => {
            onAddCustomAttr();
            setShowCustomModal(false);
          }}
        />
      )}
    </div>
  );
}
