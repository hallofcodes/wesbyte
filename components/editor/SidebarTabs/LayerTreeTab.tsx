import { LayerTree } from "../LayerTree";

interface LayerTreeTabProps {
  nodes: any[];
  selectedTag: string | null;
  onSelect: (tag: string) => void;
  title?: string;
}

export function LayerTreeTab({ nodes, selectedTag, onSelect, title }: LayerTreeTabProps) {
  return (
    <div>
      {title && <div className="text-xs text-muted-foreground mb-2">{title}</div>}
      <LayerTree nodes={nodes} selectedTag={selectedTag} onSelect={onSelect} />
    </div>
  );
}