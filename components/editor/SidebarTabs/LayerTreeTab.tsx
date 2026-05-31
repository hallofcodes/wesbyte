import { LayerTree } from "../LayerTree"; // assuming LayerTree is already a component

export function LayerTreeTab({ nodes, selectedTag, onSelect }: any) {
  return (
    <LayerTree nodes={nodes} selectedTag={selectedTag} onSelect={onSelect} />
  );
}