"use client";

import {
  Heading2,
  Pilcrow,
  MousePointerClick,
  Image as ImageIcon,
  Square,
  TextCursorInput,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

export interface PaletteElement {
  tag: string;
  label: string;
  icon: LucideIcon;
  jsx: string;
}

export const PALETTE_ELEMENTS: PaletteElement[] = [
  { tag: "h2", label: "Heading", icon: Heading2, jsx: `<h2 className="text-2xl font-bold">New Heading</h2>` },
  { tag: "p", label: "Paragraph", icon: Pilcrow, jsx: `<p className="text-base">New paragraph text.</p>` },
  {
    tag: "button",
    label: "Button",
    icon: MousePointerClick,
    jsx: `<button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => alert('Clicked!')}>Click me</button>`,
  },
  {
    tag: "img",
    label: "Image",
    icon: ImageIcon,
    jsx: `<img src="https://placehold.co/400x200" alt="Placeholder image" className="rounded" />`,
  },
  {
    tag: "div",
    label: "Container",
    icon: Square,
    jsx: `<div className="p-4 border rounded-md"><p>New container</p></div>`,
  },
  {
    tag: "input",
    label: "Input",
    icon: TextCursorInput,
    jsx: `<input type="text" placeholder="New input" className="border rounded px-2 py-1" />`,
  },
  { tag: "a", label: "Link", icon: Link2, jsx: `<a href="#" className="text-blue-500 underline">New link</a>` },
];

interface ElementsTabProps {
  onSelectElement: (tag: string) => void;
  /** Called the moment a palette item starts being dragged, so the sidebar panel can close and get out of the way of the canvas. */
  onDragStart?: () => void;
}

/** Palette drag payload shape, read on the receiving end via `event.active.data.current`. */
export interface PaletteDragData {
  source: "palette";
  jsx: string;
}

function PaletteItem({
  el,
  onSelectElement,
  onDragStart,
}: {
  el: PaletteElement;
  onSelectElement: (tag: string) => void;
  onDragStart?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${el.tag}`,
    data: { source: "palette", jsx: el.jsx } satisfies PaletteDragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={() => onDragStart?.()}
      className={`flex items-center gap-2 p-2 border rounded-md cursor-grab active:cursor-grabbing hover:bg-muted transition-colors touch-none select-none ${
        isDragging ? "opacity-40" : ""
      }`}
      onClick={() => onSelectElement(el.tag)}
    >
      <el.icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs">{el.label}</span>
    </div>
  );
}

export function ElementsTab({ onSelectElement, onDragStart }: ElementsTabProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground px-1 pb-1">
        Drag onto the canvas to add, or tap to jump to an existing one.
      </p>
      {PALETTE_ELEMENTS.map((el) => (
        <PaletteItem key={el.tag} el={el} onSelectElement={onSelectElement} onDragStart={onDragStart} />
      ))}
    </div>
  );
}
