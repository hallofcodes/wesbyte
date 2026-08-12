import { JsxNode } from "./editor-helpers";
import {
  Box,
  Type,
  Heading,
  TextQuote,
  SquareMousePointer,
  Link,
  Image,
  FormInput,
  ListChecks,
  Table,
  List,
  Code,
  Square,
} from "lucide-react";

interface LayerTreeProps {
  nodes: JsxNode[];
  selectedTag: string | null;
  onSelect: (tag: string) => void;
}

function getIcon(tag: string) {
  const lowerTag = tag.toLowerCase();
  switch (lowerTag) {
    case "div":
      return Square;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return Heading;
    case "p":
      return TextQuote;
    case "button":
      return SquareMousePointer;
    case "a":
      return Link;
    case "img":
      return Image;
    case "input":
      return FormInput;
    case "form":
      return ListChecks;
    case "table":
      return Table;
    case "ul":
    case "li":
      return List;
    case "code":
    case "pre":
      return Code;
    default:
      return Box; // fallback
  }
}

export function LayerTree({ nodes, selectedTag, onSelect }: LayerTreeProps) {
  const renderNode = (node: JsxNode, depth: number = 0, isLast: boolean = false) => {
    const Icon = getIcon(node.tag);
    const isSelected = selectedTag === node.tag;
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 20 + 16;

    return (
      <div key={node.tag + depth + node.children.length} className="relative">
        {/* Vertical line connectors */}
        {depth > 0 && (
          <div
            className="absolute left-4 top-0 bottom-0 w-px bg-border"
            style={{ left: `${depth * 20 + 8}px` }}
          />
        )}
        {depth > 0 && !isLast && (
          <div
            className="absolute w-3 h-px bg-border"
            style={{ left: `${depth * 20 + 8}px`, top: '50%' }}
          />
        )}

        <div
          className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer hover:bg-muted ${
            isSelected ? "bg-primary/10 text-primary" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => onSelect(node.tag)}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-mono">{node.tag}</span>
        </div>

        {hasChildren && (
          <div className="ml-0">
            {node.children.map((child, idx) =>
              renderNode(child, depth + 1, idx === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node, idx) => renderNode(node, 0, idx === nodes.length - 1))}
    </div>
  );
}