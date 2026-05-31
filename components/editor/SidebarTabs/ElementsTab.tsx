import { Box } from "lucide-react";

const elements = [
  { tag: "div", label: "Container" },
  { tag: "h1", label: "Heading 1" },
  { tag: "h2", label: "Heading 2" },
  { tag: "h3", label: "Heading 3" },
  { tag: "p", label: "Paragraph" },
  { tag: "button", label: "Button" },
  { tag: "img", label: "Image" },
  { tag: "input", label: "Input" },
  { tag: "a", label: "Link" },
];

export function ElementsTab({ onSelectElement }: { onSelectElement: (tag: string) => void }) {
  return (
    <div className="space-y-1">
      {elements.map((el) => (
        <div
          key={el.tag}
          className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover:bg-muted transition-colors"
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", el.tag)}
          onClick={() => onSelectElement(el.tag)}
        >
          <span className="text-xs font-mono">&lt;{el.tag}&gt;</span>
          <span className="text-xs">{el.label}</span>
        </div>
      ))}
    </div>
  );
}