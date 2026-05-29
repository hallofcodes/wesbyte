"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, Square, Heading1, Heading2, Heading3, AlignLeft, ButtonIcon, Image, Input as InputIcon, Link, Menu, Home, Info, Mail, Circle } from "lucide-react";
import type { JsxNode } from "./editor-helpers";
const tagIconMap: Record<string, React.ElementType> = {
  div: Square, header: Menu, nav: Menu, main: Home, section: Info, article: Mail, footer: Mail,
  h1: Heading1, h2: Heading2, h3: Heading3, p: AlignLeft, button: ButtonIcon, img: Image,
  input: InputIcon, a: Link, ul: Menu, li: Circle, span: AlignLeft,
};
const FallbackIcon = Square;
function TreeItem({ node, selectedTag, onSelect, depth = 0 }: { node: JsxNode; selectedTag: string | null; onSelect: (tag: string) => void; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedTag === node.tag;
  const Icon = tagIconMap[node.tag] || FallbackIcon;
  return (
    <div className="relative">
      {depth > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-border" style={{ left: `${depth * 12 - 8}px` }} />}
      <div className={`flex items-center gap-1 py-1 cursor-pointer hover:bg-muted rounded-md ${isSelected ? "bg-muted font-medium" : ""}`} style={{ paddingLeft: depth * 12 + 4 }} onClick={() => onSelect(node.tag)}>
        {hasChildren && <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-0.5">{isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</button>}
        {!hasChildren && <span className="w-4" />}
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm">{node.tag}</span>
      </div>
      {hasChildren && isOpen && <div>{node.children.map((child, idx) => <TreeItem key={idx} node={child} selectedTag={selectedTag} onSelect={onSelect} depth={depth + 1} />)}</div>}
    </div>
  );
}
export function LayerTree({ nodes, selectedTag, onSelect }: { nodes: JsxNode[]; selectedTag: string | null; onSelect: (tag: string) => void }) {
  return <div className="space-y-1">{nodes.map((node, idx) => <TreeItem key={idx} node={node} selectedTag={selectedTag} onSelect={onSelect} />)}</div>;
}
