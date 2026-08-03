"use client";

import { useState, useEffect, useRef } from "react";
import { StyleValues } from "./StyleEditor";
import { Button } from "@/components/ui/button";
import { styleObjToString, stringToStyleObj } from "@/lib/styleUtils";
import { AttributeFields } from "./AttributeFields";
import { CustomAttributeModal } from "./CustomAttributeModal";
import type { ElementAttributes } from "./attributeSchema";

interface PropertyPanelProps {
  selectedElement: string | null;
  selectedElementRaw: string | null;
  attributes: ElementAttributes;
  onAttributeChange: (key: keyof ElementAttributes, value: string | boolean) => void;
  customAttrKey: string;
  customAttrValue: string;
  onCustomAttrKeyChange: (value: string) => void;
  onCustomAttrValueChange: (value: string) => void;
  onAddCustomAttr: () => void;
  interactiveMode: boolean;
  isCustomComponent: boolean;
  customComponentFilePath: string | null;
  onOpenFile: (filePath: string) => void;
}

export function PropertyPanel({
  selectedElement,
  selectedElementRaw,
  attributes,
  onAttributeChange,
  customAttrKey,
  customAttrValue,
  onCustomAttrKeyChange,
  onCustomAttrValueChange,
  onAddCustomAttr,
  interactiveMode,
  isCustomComponent,
  customComponentFilePath,
  onOpenFile,
}: PropertyPanelProps) {
  const [stylesObj, setStylesObj] = useState<StyleValues>({});
  const [showCustomModal, setShowCustomModal] = useState(false);
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

  if (!selectedElement || !selectedElementRaw) {
    return (
      <p className="text-muted-foreground text-sm">
        {interactiveMode
          ? "Shift+click any element to edit its properties."
          : "Click any element to edit its properties."}
      </p>
    );
  }

  if (isCustomComponent) {
    return (
      <div className="p-4 border rounded-md bg-muted/20 text-center space-y-3">
        <p className="text-sm">
          This is a custom component (<strong>{selectedElementRaw}</strong>).
        </p>
        <p className="text-xs text-muted-foreground">Edit its source code directly.</p>
        {customComponentFilePath && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onOpenFile?.(customComponentFilePath)}
          >
            Edit {customComponentFilePath}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Add Custom Attribute
        </button>
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

      <p className="text-xs text-muted-foreground">
        Editing the first &lt;{selectedElementRaw}&gt; in the file.
      </p>
    </div>
  );
}
