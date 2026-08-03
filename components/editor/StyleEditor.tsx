"use client";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Slider } from "@/components/ui/slider";

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

type BoxPrefix = "margin" | "padding";
type Side = "Top" | "Right" | "Bottom" | "Left";
const SIDES: Side[] = ["Top", "Right", "Bottom", "Left"];

interface BoxValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const toNumber = (val: string | undefined) => {
  if (!val) return 0;
  const n = parseInt(val.replace("px", ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

const toPx = (num: number) => `${num}px`;

function boxFromStyles(prefix: BoxPrefix, styles: StyleValues): BoxValues {
  return {
    top: toNumber(styles[`${prefix}Top`]),
    right: toNumber(styles[`${prefix}Right`]),
    bottom: toNumber(styles[`${prefix}Bottom`]),
    left: toNumber(styles[`${prefix}Left`]),
  };
}

function boxToStyleUpdates(prefix: BoxPrefix, box: BoxValues): Partial<StyleValues> {
  return {
    [`${prefix}Top`]: toPx(box.top),
    [`${prefix}Right`]: toPx(box.right),
    [`${prefix}Bottom`]: toPx(box.bottom),
    [`${prefix}Left`]: toPx(box.left),
  };
}

function SpacingRow({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-12">{label}</span>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={([v]) => onChange(v)}
        onValueCommit={onCommit}
        className="flex-1"
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        onBlur={onCommit}
        className="w-12 p-1 border rounded text-xs text-center"
      />
      <span className="text-xs">px</span>
    </div>
  );
}

/** Shared control for margin and padding — same "uniform vs. per-side" UI, driven by a single BoxValues object instead of 4 useState fields each. */
function BoxSpacingEditor({
  label,
  values,
  uniform,
  onUniformChange,
  onCommit,
}: {
  label: string;
  values: BoxValues;
  uniform: boolean;
  onUniformChange: (uniform: boolean) => void;
  onCommit: (box: BoxValues) => void;
}) {
  const [local, setLocal] = useState(values);

  useEffect(() => setLocal(values), [values]);

  const setSide = (side: Side, val: number) => {
    if (uniform) {
      setLocal({ top: val, right: val, bottom: val, left: val });
    } else {
      setLocal((prev) => ({ ...prev, [side.toLowerCase()]: val }));
    }
  };

  const commit = () => onCommit(local);

  const handleUniformToggle = (checked: boolean) => {
    if (checked) {
      const avg = local.top || local.right || local.bottom || local.left || 0;
      const uniformBox = { top: avg, right: avg, bottom: avg, left: avg };
      setLocal(uniformBox);
      onCommit(uniformBox);
    }
    onUniformChange(checked);
  };

  return (
    <div className="border-t pt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium">{label}</label>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={uniform}
            onChange={(e) => handleUniformToggle(e.target.checked)}
          />{" "}
          Uniform
        </label>
      </div>
      {uniform ? (
        <SpacingRow label="All" value={local.top} onChange={(v) => setSide("Top", v)} onCommit={commit} />
      ) : (
        <div className="space-y-2">
          {SIDES.map((side) => (
            <SpacingRow
              key={side}
              label={side}
              value={local[side.toLowerCase() as keyof BoxValues]}
              onChange={(v) => setSide(side, v)}
              onCommit={commit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function StyleEditor({
  styles,
  onChange,
}: {
  styles: StyleValues;
  onChange: (newStyles: StyleValues) => void;
}) {
  const [localColor, setLocalColor] = useState(styles.color || "#000000");
  const [localBgColor, setLocalBgColor] = useState(styles.backgroundColor || "#ffffff");
  const [marginUniform, setMarginUniform] = useState(true);
  const [paddingUniform, setPaddingUniform] = useState(true);

  // Sync when selected element changes
  useEffect(() => {
    setLocalColor(styles.color || "#000000");
    setLocalBgColor(styles.backgroundColor || "#ffffff");
  }, [styles]);

  const update = (key: keyof StyleValues, value: string) => {
    onChange({ ...styles, [key]: value });
  };

  const commitBox = (prefix: BoxPrefix, box: BoxValues) => {
    onChange({ ...styles, ...boxToStyleUpdates(prefix, box) });
  };

  return (
    <div className="space-y-4">
      {/* Colors */}
      <div className="relative z-0">
        <label className="text-xs font-medium block mb-1">Text Color</label>
        <HexColorPicker
          color={localColor}
          onChange={setLocalColor}
          onChangeEnd={(val) => update("color", val)}
          className="!w-full"
        />
      </div>
      <div className="relative z-0">
        <label className="text-xs font-medium block mb-1">Background Color</label>
        <HexColorPicker
          color={localBgColor}
          onChange={setLocalBgColor}
          onChangeEnd={(val) => update("backgroundColor", val)}
          className="!w-full"
        />
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

      <BoxSpacingEditor
        label="Margin"
        values={boxFromStyles("margin", styles)}
        uniform={marginUniform}
        onUniformChange={setMarginUniform}
        onCommit={(box) => commitBox("margin", box)}
      />

      <BoxSpacingEditor
        label="Padding"
        values={boxFromStyles("padding", styles)}
        uniform={paddingUniform}
        onUniformChange={setPaddingUniform}
        onCommit={(box) => commitBox("padding", box)}
      />

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
          {(["top", "right", "bottom", "left"] as const).map((offset) => (
            <div key={offset}>
              <label className="text-xs capitalize">{offset}</label>
              <input
                type="text"
                value={styles[offset] || ""}
                onChange={(e) => update(offset, e.target.value)}
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
