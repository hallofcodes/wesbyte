"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Box, FolderTree } from "lucide-react";
import { LayerTree } from "./LayerTree";
import type { JsxNode } from "./editor-helpers";
const elements = [{ tag: "div", label: "Container" }, { tag: "h1", label: "Heading 1" }, { tag: "h2", label: "Heading 2" }, { tag: "h3", label: "Heading 3" }, { tag: "p", label: "Paragraph" }, { tag: "button", label: "Button" }, { tag: "img", label: "Image" }, { tag: "input", label: "Input" }, { tag: "a", label: "Link" }];
export function LeftSidebar({ isOpen, onToggle, activeTab, onTabChange, layerTreeNodes, selectedTag, onSelectElement, onInsertElement }: any) {
  if (!isOpen) {
    return (
      <div className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 space-y-2 h-full">
        <Button variant="ghost" size="icon" onClick={() => { onToggle(); onTabChange("elements"); }} className="rounded-lg" title="Elements"><Box className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" onClick={() => { onToggle(); onTabChange("layerTree"); }} className="rounded-lg" title="Layer Tree"><FolderTree className="h-5 w-5" /></Button>
      </div>
    );
  }
  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex gap-1 flex-1">
          <button className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${activeTab === "elements" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`} onClick={() => onTabChange("elements")}><Box className="h-3.5 w-3.5 flex-shrink-0" /><span>Elements</span></button>
          <button className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${activeTab === "layerTree" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`} onClick={() => onTabChange("layerTree")}><FolderTree className="h-3.5 w-3.5 flex-shrink-0" /><span>Layer Tree</span></button>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 ml-1"><ChevronLeft className="h-4 w-4" /></Button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {activeTab === "elements" ? (
          <div className="space-y-1">{elements.map((el) => <div key={el.tag} className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover:bg-muted transition-colors" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", el.tag)}><span className="text-xs font-mono">&lt;{el.tag}&gt;</span><span className="text-xs">{el.label}</span></div>)}</div>
        ) : <LayerTree nodes={layerTreeNodes} selectedTag={selectedTag} onSelect={onSelectElement} />}
      </div>
    </div>
  );
}
