"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

export interface StyleValues {
  // Colors
  color?: string;
  backgroundColor?: string;
  // Size
  width?: string;
  height?: string;
  // Spacing
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Layout
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  // Text
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  // Border
  borderRadius?: string;
  // Flex/Grid
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}

// Helper to convert CSS value to number (removing "px")
const toNumber = (val: string | undefined) => {
  if (!val) return 0;
  return parseInt(val.replace("px", ""), 10);
};

// Helper to add "px" to number
const toPx = (num: number) => `${num}px`;

export function StyleEditor({
  styles,
  onChange,
}: {
  styles: StyleValues;
  onChange: (newStyles: StyleValues) => void;
}) {
  const [marginUniform, setMarginUniform] = useState(true);
  const [paddingUniform, setPaddingUniform] = useState(true);

  const update = (key: keyof StyleValues, value: string) => {
    onChange({ ...styles, [key]: value });
  };

  // Margin uniform handling
  const marginTop = toNumber(styles.marginTop);
  const marginRight = toNumber(styles.marginRight);
  const marginBottom = toNumber(styles.marginBottom);
  const marginLeft = toNumber(styles.marginLeft);

  const handleMarginUniform = (val: number) => {
    const px = toPx(val);
    update("marginTop", px);
    update("marginRight", px);
    update("marginBottom", px);
    update("marginLeft", px);
  };

  const handleMarginSide = (side: "top" | "right" | "bottom" | "left", val: number) => {
    const px = toPx(val);
    update(`margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof StyleValues, px);
  };

  // Padding uniform handling
  const paddingTop = toNumber(styles.paddingTop);
  const paddingRight = toNumber(styles.paddingRight);
  const paddingBottom = toNumber(styles.paddingBottom);
  const paddingLeft = toNumber(styles.paddingLeft);

  const handlePaddingUniform = (val: number) => {
    const px = toPx(val);
    update("paddingTop", px);
    update("paddingRight", px);
    update("paddingBottom", px);
    update("paddingLeft", px);
  };

  const handlePaddingSide = (side: "top" | "right" | "bottom" | "left", val: number) => {
    const px = toPx(val);
    update(`padding${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof StyleValues, px);
  };

  // Slider with numeric input
  const SliderInput = ({ value, onChange, min = 0, max = 200, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string }) => (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs w-12">{label}</span>}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="flex-1"
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-12 p-1 border rounded text-xs text-center"
      />
      <span className="text-xs">px</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Colors */}
      <div>
        <label className="text-xs font-medium block mb-1">Text Color</label>
        <HexColorPicker
          color={styles.color || "#000000"}
          onChange={(val) => update("color", val)}
          className="!w-full"
        />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1">Background Color</label>
        <HexColorPicker
          color={styles.backgroundColor || "#ffffff"}
          onChange={(val) => update("backgroundColor", val)}
          className="!w-full"
        />
      </div>

      {/* Size */}
      <div>
        <label className="text-xs font-medium block mb-1">Width</label>
        <input
          type="text"
          value={styles.width || ""}
          onChange={(e) => update("width", e.target.value)}
          placeholder="auto"
          className="w-full p-1 border rounded"
        />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1">Height</label>
        <input
          type="text"
          value={styles.height || ""}
          onChange={(e) => update("height", e.target.value)}
          placeholder="auto"
          className="w-full p-1 border rounded"
        />
      </div>

      {/* Margin */}
      <div className="border-t pt-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium">Margin</label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={marginUniform}
              onChange={(e) => setMarginUniform(e.target.checked)}
            />
            Uniform
          </label>
        </div>
        {marginUniform ? (
          <SliderInput
            value={marginTop}
            onChange={(val) => handleMarginUniform(val)}
            min={0}
            max={100}
          />
        ) : (
          <div className="space-y-2">
            <SliderInput label="Top" value={marginTop} onChange={(v) => handleMarginSide("top", v)} />
            <SliderInput label="Right" value={marginRight} onChange={(v) => handleMarginSide("right", v)} />
            <SliderInput label="Bottom" value={marginBottom} onChange={(v) => handleMarginSide("bottom", v)} />
            <SliderInput label="Left" value={marginLeft} onChange={(v) => handleMarginSide("left", v)} />
          </div>
        )}
      </div>

      {/* Padding */}
      <div className="border-t pt-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium">Padding</label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={paddingUniform}
              onChange={(e) => setPaddingUniform(e.target.checked)}
            />
            Uniform
          </label>
        </div>
        {paddingUniform ? (
          <SliderInput
            value={paddingTop}
            onChange={(val) => handlePaddingUniform(val)}
            min={0}
            max={100}
          />
        ) : (
          <div className="space-y-2">
            <SliderInput label="Top" value={paddingTop} onChange={(v) => handlePaddingSide("top", v)} />
            <SliderInput label="Right" value={paddingRight} onChange={(v) => handlePaddingSide("right", v)} />
            <SliderInput label="Bottom" value={paddingBottom} onChange={(v) => handlePaddingSide("bottom", v)} />
            <SliderInput label="Left" value={paddingLeft} onChange={(v) => handlePaddingSide("left", v)} />
          </div>
        )}
      </div>

      {/* Layout: display, position */}
      <div className="border-t pt-3">
        <div>
          <label className="text-xs font-medium block mb-1">Display</label>
          <select
            value={styles.display || ""}
            onChange={(e) => update("display", e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="">Default</option>
            <option value="block">Block</option>
            <option value="inline">Inline</option>
            <option value="inline-block">Inline Block</option>
            <option value="flex">Flex</option>
            <option value="grid">Grid</option>
            <option value="none">None</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1 mt-2">Position</label>
          <select
            value={styles.position || ""}
            onChange={(e) => update("position", e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>
        {/* Position offsets (shown only when position is not static) */}
        {styles.position && styles.position !== "static" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-xs">Top</label>
              <input
                type="text"
                value={styles.top || ""}
                onChange={(e) => update("top", e.target.value)}
                placeholder="auto"
                className="w-full p-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs">Right</label>
              <input
                type="text"
                value={styles.right || ""}
                onChange={(e) => update("right", e.target.value)}
                placeholder="auto"
                className="w-full p-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs">Bottom</label>
              <input
                type="text"
                value={styles.bottom || ""}
                onChange={(e) => update("bottom", e.target.value)}
                placeholder="auto"
                className="w-full p-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs">Left</label>
              <input
                type="text"
                value={styles.left || ""}
                onChange={(e) => update("left", e.target.value)}
                placeholder="auto"
                className="w-full p-1 border rounded text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Text styling */}
      <div className="border-t pt-3">
        <div>
          <label className="text-xs font-medium block mb-1">Font Size</label>
          <input
            type="text"
            value={styles.fontSize || ""}
            onChange={(e) => update("fontSize", e.target.value)}
            placeholder="16px"
            className="w-full p-1 border rounded"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Font Weight</label>
          <select
            value={styles.fontWeight || ""}
            onChange={(e) => update("fontWeight", e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="">Normal</option>
            <option value="100">Thin</option>
            <option value="200">Extra Light</option>
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semi Bold</option>
            <option value="700">Bold</option>
            <option value="800">Extra Bold</option>
            <option value="900">Black</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Text Align</label>
          <select
            value={styles.textAlign || ""}
            onChange={(e) => update("textAlign", e.target.value)}
            className="w-full p-1 border rounded"
          >
            <option value="">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </div>

      {/* Flex/Grid extras */}
      {(styles.display === "flex" || styles.display === "grid") && (
        <div className="border-t pt-3 space-y-2">
          {styles.display === "flex" && (
            <>
              <div>
                <label className="text-xs font-medium block mb-1">Flex Direction</label>
                <select
                  value={styles.flexDirection || ""}
                  onChange={(e) => update("flexDirection", e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Row</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column">Column</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Justify Content</label>
                <select
                  value={styles.justifyContent || ""}
                  onChange={(e) => update("justifyContent", e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Flex Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">Flex End</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                  <option value="space-evenly">Space Evenly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Align Items</label>
                <select
                  value={styles.alignItems || ""}
                  onChange={(e) => update("alignItems", e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Stretch</option>
                  <option value="flex-start">Flex Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">Flex End</option>
                  <option value="baseline">Baseline</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-medium block mb-1">Gap</label>
            <input
              type="text"
              value={styles.gap || ""}
              onChange={(e) => update("gap", e.target.value)}
              placeholder="0px"
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
      )}

      {/* Border radius */}
      <div>
        <label className="text-xs font-medium block mb-1">Border Radius</label>
        <input
          type="text"
          value={styles.borderRadius || ""}
          onChange={(e) => update("borderRadius", e.target.value)}
          placeholder="0px"
          className="w-full p-1 border rounded"
        />
      </div>
    </div>
  );
}