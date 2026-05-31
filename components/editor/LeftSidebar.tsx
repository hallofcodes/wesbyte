"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Box, FolderTree, ChevronLeft } from "lucide-react";
import { LayerTree } from "./LayerTree";

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

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: "elements" | "layerTree";
  onTabChange: (tab: "elements" | "layerTree") => void;
  layerTreeNodes: any[];
  selectedTag: string | null;
  onSelectElement: (tag: string) => void;
}

export function LeftSidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  layerTreeNodes,
  selectedTag,
  onSelectElement,
}: LeftSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripRect, setStripRect] = useState({ left: 0, top: 0 });

  // Measure strip position once
  useEffect(() => {
    const measure = () => {
      if (stripRef.current) {
        const rect = stripRef.current.getBoundingClientRect();
        setStripRect({ left: rect.left, top: rect.top });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Close when clicking outside the expanded panel
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleIconClick = (tab: "elements" | "layerTree") => {
    onTabChange(tab);
    if (!isOpen) onToggle();
  };

  const handleElementClick = (tag: string) => {
    onSelectElement(tag);
    onToggle();
  };

  const handleLayerSelect = (tag: string) => {
    onSelectElement(tag);
    onToggle();
  };

  const sidebarWidth = 304;
  const backdropLeft = stripRect.left + sidebarWidth;

  return (
    <>
      {/* Thin strip – always visible, part of flex layout */}
      <div
        ref={stripRef}
        className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 space-y-2 h-full"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleIconClick("elements")}
          className={`rounded-lg focus:outline-none focus:ring-0 ${activeTab === "elements" ? "bg-primary text-primary-foreground" : ""}`}
          title="Elements"
        >
          <Box className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleIconClick("layerTree")}
          className={`rounded-lg ${activeTab === "layerTree" && isOpen ? "bg-primary text-primary-foreground" : ""}`}
          title="Layer Tree"
        >
          <FolderTree className="h-5 w-5" />
        </Button>
      </div>

      {/* Backdrop – always rendered, transitions opacity */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          left: `${backdropLeft}px`,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onToggle}
      />

      {/* Expanded panel – always rendered, transitions transform + opacity */}
      <div
        ref={panelRef}
        className="fixed z-50 flex shadow-xl bg-background transition-all duration-300 ease-out"
        style={{
          left: `${stripRect.left}px`,
          top: `${stripRect.top}px`,
          width: `${sidebarWidth}px`,
          bottom: 0,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {/* Thin strip replica inside the panel (same width, keeps visual continuity) */}
        <div className="w-12 border-r flex flex-col items-center py-2 space-y-2 h-full bg-background flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleIconClick("elements")}
            className={`rounded-lg active:bg-transparent focus:bg-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
  activeTab === "layer-tree" ? "" : "bg-primary text-primary-foreground"
}`}
            title="Elements"
          >
            <Box className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleIconClick("layerTree")}
            className={`rounded-lg active:bg-transparent focus:bg-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
  activeTab === "elements" ? "" : "bg-primary text-primary-foreground"
}`}
            title="Layer Tree"
          >
            <FolderTree className="h-5 w-5" />
          </Button>
        </div>

        {/* Expandable content with tab fade */}
        <div className="w-64 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="text-sm font-medium ml-2">
              {activeTab === "elements" ? "Elements" : "Layer Tree"}
            </div>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2 relative">
            <div
              key={activeTab}
              className="transition-all duration-200"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              {activeTab === "elements" ? (
                <div className="space-y-1">
                  {elements.map((el) => (
                    <div
                      key={el.tag}
                      className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover:bg-muted transition-colors"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", el.tag)}
                      onClick={() => handleElementClick(el.tag)}
                    >
                      <span className="text-xs font-mono">&lt;{el.tag}&gt;</span>
                      <span className="text-xs">{el.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <LayerTree
                  nodes={layerTreeNodes}
                  selectedTag={selectedTag}
                  onSelect={handleLayerSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}