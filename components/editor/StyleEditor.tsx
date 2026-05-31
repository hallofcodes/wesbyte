"use client";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Slider } from "@/components/ui/slider"; // your Radix slider

export interface StyleValues {
  color?: string;
  backgroundColor?: string;
  width?: string;
  height?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  borderRadius?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}

const toNumber = (val: string | undefined) => {
  if (!val) return 0;
  return parseInt(val.replace("px", ""), 10);
};

const toPx = (num: number) => `${num}px`;

export function StyleEditor({ styles, onChange }: { styles: StyleValues; onChange: (newStyles: StyleValues) => void }) {
  // Local state for all interactive controls
  const [localColor, setLocalColor] = useState(styles.color || "#000000");
  const [localBgColor, setLocalBgColor] = useState(styles.backgroundColor || "#ffffff");
  const [marginUniform, setMarginUniform] = useState(true);
  const [paddingUniform, setPaddingUniform] = useState(true);
  const [marginTop, setMarginTop] = useState(toNumber(styles.marginTop));
  const [marginRight, setMarginRight] = useState(toNumber(styles.marginRight));
  const [marginBottom, setMarginBottom] = useState(toNumber(styles.marginBottom));
  const [marginLeft, setMarginLeft] = useState(toNumber(styles.marginLeft));
  const [paddingTop, setPaddingTop] = useState(toNumber(styles.paddingTop));
  const [paddingRight, setPaddingRight] = useState(toNumber(styles.paddingRight));
  const [paddingBottom, setPaddingBottom] = useState(toNumber(styles.paddingBottom));
  const [paddingLeft, setPaddingLeft] = useState(toNumber(styles.paddingLeft));

  // Sync when selected element changes
  useEffect(() => {
    setLocalColor(styles.color || "#000000");
    setLocalBgColor(styles.backgroundColor || "#ffffff");
    setMarginTop(toNumber(styles.marginTop));
    setMarginRight(toNumber(styles.marginRight));
    setMarginBottom(toNumber(styles.marginBottom));
    setMarginLeft(toNumber(styles.marginLeft));
    setPaddingTop(toNumber(styles.paddingTop));
    setPaddingRight(toNumber(styles.paddingRight));
    setPaddingBottom(toNumber(styles.paddingBottom));
    setPaddingLeft(toNumber(styles.paddingLeft));
  }, [styles]);

  const update = (key: keyof StyleValues, value: string) => {
    onChange({ ...styles, [key]: value });
  };

  //Commit margin – batch all sides in one update
const commitMargin = () => {
  if (marginUniform) {
    const px = toPx(marginTop);
    onChange({
      ...styles,
      marginTop: px,
      marginRight: px,
      marginBottom: px,
      marginLeft: px,
    });
  } else {
    onChange({
      ...styles,
      marginTop: toPx(marginTop),
      marginRight: toPx(marginRight),
      marginBottom: toPx(marginBottom),
      marginLeft: toPx(marginLeft),
    });
  }
};

// Commit padding – batch all sides in one update
const commitPadding = () => {
  if (paddingUniform) {
    const px = toPx(paddingTop);
    onChange({
      ...styles,
      paddingTop: px,
      paddingRight: px,
      paddingBottom: px,
      paddingLeft: px,
    });
  } else {
    onChange({
      ...styles,
      paddingTop: toPx(paddingTop),
      paddingRight: toPx(paddingRight),
      paddingBottom: toPx(paddingBottom),
      paddingLeft: toPx(paddingLeft),
    });
  }
};
  
  const handleMarginUniformToggle = (checked: boolean) => {
    if (checked) {
      const avg = marginTop || marginRight || marginBottom || marginLeft || 0;
      setMarginTop(avg);
      setMarginRight(avg);
      setMarginBottom(avg);
      setMarginLeft(avg);
    }
    setMarginUniform(checked);
  };

  const handlePaddingUniformToggle = (checked: boolean) => {
    if (checked) {
      const avg = paddingTop || paddingRight || paddingBottom || paddingLeft || 0;
      setPaddingTop(avg);
      setPaddingRight(avg);
      setPaddingBottom(avg);
      setPaddingLeft(avg);
    }
    setPaddingUniform(checked);
  };
  
  const hqndleColor = () => {
    alert(0)
  }

  return (
    <div className="space-y-4">
      {/* Colors */}
      <div className="relative z-0">
        <label className="text-xs font-medium block mb-1">Text Color</label>
        <HexColorPicker color={localColor} onChange={setLocalColor} onChangeEnd={(val) => update("color", val)} className="!w-full" />
      </div>
      <div className="relative z-0">
        <label className="text-xs font-medium block mb-1">Background Color</label>
        <HexColorPicker color={localBgColor} onChange={setLocalBgColor} onChangeEnd={(val) => update("backgroundColor", val)} className="!w-full" />
      </div>

      {/* Width / Height */}
      <div>
        <label className="text-xs font-medium block mb-1">Width</label>
        <input type="text" value={styles.width || ""} onChange={(e) => update("width", e.target.value)} placeholder="auto" className="w-full p-1 border rounded" />
      </div>
      <div>
        <label className="text-xs font-medium block mb-1">Height</label>
        <input type="text" value={styles.height || ""} onChange={(e) => update("height", e.target.value)} placeholder="auto" className="w-full p-1 border rounded" />
      </div>

      {/* Margin */}
      <div className="border-t pt-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium">Margin</label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={marginUniform} onChange={(e) => handleMarginUniformToggle(e.target.checked)} /> Uniform
          </label>
        </div>
        {marginUniform ? (
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">All</span>
            <Slider
              value={[marginTop]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => {
                setMarginTop(val);
                setMarginRight(val);
                setMarginBottom(val);
                setMarginLeft(val);
              }}
              onValueCommit={commitMargin}
              className="flex-1"
            />
            <input
              type="number"
              value={marginTop}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setMarginTop(v);
                setMarginRight(v);
                setMarginBottom(v);
                setMarginLeft(v);
              }}
              onBlur={commitMargin}
              className="w-12 p-1 border rounded text-xs text-center"
            />
            <span className="text-xs">px</span>
          </div>
        ) : (
          <div className="space-y-2">
            {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
              const value = side === "Top" ? marginTop : side === "Right" ? marginRight : side === "Bottom" ? marginBottom : marginLeft;
              const setter = side === "Top" ? setMarginTop : side === "Right" ? setMarginRight : side === "Bottom" ? setMarginBottom : setMarginLeft;
              return (
                <div key={side} className="flex items-center gap-2">
                  <span className="text-xs w-12">{side}</span>
                  <Slider
                    value={[value]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([val]) => setter(val)}
                    onValueCommit={commitMargin}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(parseInt(e.target.value, 10))}
                    onBlur={commitMargin}
                    className="w-12 p-1 border rounded text-xs text-center"
                  />
                  <span className="text-xs">px</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Padding (same pattern as margin) */}
      <div className="border-t pt-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium">Padding</label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={paddingUniform} onChange={(e) => handlePaddingUniformToggle(e.target.checked)} /> Uniform
          </label>
        </div>
        {paddingUniform ? (
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">All</span>
            <Slider
              value={[paddingTop]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => {
                setPaddingTop(val);
                setPaddingRight(val);
                setPaddingBottom(val);
                setPaddingLeft(val);
              }}
              onValueCommit={commitPadding}
              className="flex-1"
            />
            <input
              type="number"
              value={paddingTop}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setPaddingTop(v);
                setPaddingRight(v);
                setPaddingBottom(v);
                setPaddingLeft(v);
              }}
              onBlur={commitPadding}
              className="w-12 p-1 border rounded text-xs text-center"
            />
            <span className="text-xs">px</span>
          </div>
        ) : (
          <div className="space-y-2">
            {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
              const value = side === "Top" ? paddingTop : side === "Right" ? paddingRight : side === "Bottom" ? paddingBottom : paddingLeft;
              const setter = side === "Top" ? setPaddingTop : side === "Right" ? setPaddingRight : side === "Bottom" ? setPaddingBottom : setPaddingLeft;
              return (
                <div key={side} className="flex items-center gap-2">
                  <span className="text-xs w-12">{side}</span>
                  <Slider
                    value={[value]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([val]) => setter(val)}
                    onValueCommit={commitPadding}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(parseInt(e.target.value, 10))}
                    onBlur={commitPadding}
                    className="w-12 p-1 border rounded text-xs text-center"
                  />
                  <span className="text-xs">px</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Display */}
      <div>
        <label className="text-xs font-medium block mb-1">Display</label>
        <select value={styles.display || ""} onChange={(e) => update("display", e.target.value)} className="w-full p-1 border rounded">
          <option value="">Default</option>
          <option value="block">Block</option>
          <option value="inline">Inline</option>
          <option value="inline-block">Inline Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Position */}
      <div>
        <label className="text-xs font-medium block mb-1">Position</label>
        <select value={styles.position || ""} onChange={(e) => update("position", e.target.value)} className="w-full p-1 border rounded">
          <option value="">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
          <option value="fixed">Fixed</option>
          <option value="sticky">Sticky</option>
        </select>
      </div>

      {/* Position offsets */}
      {styles.position && styles.position !== "static" && (
        <div className="grid grid-cols-2 gap-2">
          {["top", "right", "bottom", "left"].map((offset) => (
            <div key={offset}>
              <label className="text-xs capitalize">{offset}</label>
              <input
                type="text"
                value={(styles as any)[offset] || ""}
                onChange={(e) => update(offset as keyof StyleValues, e.target.value)}
                placeholder="auto"
                className="w-full p-1 border rounded text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* Font Size */}
      <div>
        <label className="text-xs font-medium block mb-1">Font Size</label>
        <input type="text" value={styles.fontSize || ""} onChange={(e) => update("fontSize", e.target.value)} placeholder="16px" className="w-full p-1 border rounded" />
      </div>

      {/* Font Weight */}
      <div>
        <label className="text-xs font-medium block mb-1">Font Weight</label>
        <select value={styles.fontWeight || ""} onChange={(e) => update("fontWeight", e.target.value)} className="w-full p-1 border rounded">
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

      {/* Text Align */}
      <div>
        <label className="text-xs font-medium block mb-1">Text Align</label>
        <select value={styles.textAlign || ""} onChange={(e) => update("textAlign", e.target.value)} className="w-full p-1 border rounded">
          <option value="">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      {/* Flex / Grid extras */}
      {(styles.display === "flex" || styles.display === "grid") && (
        <div className="border-t pt-3 space-y-2">
          {styles.display === "flex" && (
            <>
              <div>
                <label className="text-xs font-medium block mb-1">Flex Direction</label>
                <select value={styles.flexDirection || ""} onChange={(e) => update("flexDirection", e.target.value)} className="w-full p-1 border rounded">
                  <option value="">Row</option>
                  <option value="row-reverse">Row Reverse</option>
                  <option value="column">Column</option>
                  <option value="column-reverse">Column Reverse</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Justify Content</label>
                <select value={styles.justifyContent || ""} onChange={(e) => update("justifyContent", e.target.value)} className="w-full p-1 border rounded">
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
                <select value={styles.alignItems || ""} onChange={(e) => update("alignItems", e.target.value)} className="w-full p-1 border rounded">
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
            <input type="text" value={styles.gap || ""} onChange={(e) => update("gap", e.target.value)} placeholder="0px" className="w-full p-1 border rounded" />
          </div>
        </div>
      )}

      {/* Border Radius */}
      <div>
        <label className="text-xs font-medium block mb-1">Border Radius</label>
        <input type="text" value={styles.borderRadius || ""} onChange={(e) => update("borderRadius", e.target.value)} placeholder="0px" className="w-full p-1 border rounded" />
      </div>
    </div>
  );
}