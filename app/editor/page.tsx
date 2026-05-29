"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  FolderTree,
  Download,
  Globe,
  X,
  Box,
  Settings,
} from "lucide-react";
import NextLink from "next/link";

// Dummy data
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

const layerTreeItems = [
  "div",
  "header",
  "nav",
  "main",
  "section",
  "h1",
  "p",
  "button",
];

export default function EditorPageUI() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "layerTree">("elements");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const openSidebarWithTab = (tab: "elements" | "layerTree") => {
    setIsLeftOpen(true);
    setActiveTab(tab);
  };

  const handleSelectElement = (tag: string) => {
    setSelectedElement(tag);
    if (window.innerWidth < 768) setIsBottomSheetOpen(true);
  };

  const closeBottomSheet = () => setIsBottomSheetOpen(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <NextLink href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Wesbyte</span>
            </NextLink>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm">
              <Globe className="h-4 w-4 mr-1" /> Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar – tabbed, not collapsible sections */}
        <div className="relative flex-shrink-0">
          {isLeftOpen ? (
            <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
              {/* Sidebar header with tabs and collapse button */}
              <div className="flex items-center justify-between p-2 border-b">
                <div className="flex gap-1 flex-1">
                  <Button
                    variant={activeTab === "elements" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("elements")}
                    className="flex-1"
                  >
                    Elements
                  </Button>
                  <Button
                    variant={activeTab === "layerTree" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("layerTree")}
                    className="flex-1"
                  >
                    Layer Tree
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLeftOpen(false)}
                  className="h-8 w-8 ml-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              {/* Tab content */}
              <div className="flex-1 overflow-auto p-2">
                {activeTab === "elements" ? (
                  <div className="space-y-1">
                    {elements.map((el) => (
                      <div
                        key={el.tag}
                        className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover:bg-muted transition-colors"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", el.tag)}
                      >
                        <span className="text-xs font-mono">&lt;{el.tag}&gt;</span>
                        <span className="text-xs">{el.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {layerTreeItems.map((tag) => (
                      <div
                        key={tag}
                        className={`text-sm p-2 cursor-pointer hover:bg-muted rounded-md ${
                          selectedElement === tag ? "bg-muted font-medium" : ""
                        }`}
                        onClick={() => handleSelectElement(tag)}
                      >
                        &lt;{tag}&gt;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 space-y-2 h-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openSidebarWithTab("elements")}
                className="rounded-lg"
                title="Elements"
              >
                <Box className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openSidebarWithTab("layerTree")}
                className="rounded-lg"
                title="Layer Tree"
              >
                <FolderTree className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b p-2 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button className="p-2 hover:bg-muted"><Monitor className="h-4 w-4" /></button>
                <button className="p-2 hover:bg-muted"><Tablet className="h-4 w-4" /></button>
                <button className="p-2 hover:bg-muted"><Smartphone className="h-4 w-4" /></button>
              </div>
              <Button variant="outline" size="icon">
                <FolderTree className="h-4 w-4" />
              </Button>
              <div className="md:hidden">
                <Button variant="outline" size="icon" onClick={() => setIsBottomSheetOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center p-4">
            <div className="shadow-2xl bg-background w-full max-w-4xl min-h-[400px] rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Preview area (dummy)</p>
            </div>
          </div>
        </div>

        {/* Right property panel (desktop) */}
        <div className="hidden md:block w-72 border-l bg-muted/20 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tag</label>
              <div className="mt-1 p-2 border rounded-md bg-muted/30">
                {selectedElement || "—"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Class Name</label>
              <div className="mt-1 p-2 border rounded-md bg-muted/30">example-class</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Select an element from the layer tree to edit properties.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {isBottomSheetOpen && (
        <div className="fixed md:hidden left-0 right-0 bottom-0 z-50">
          <div
            className="bg-background border-t rounded-t-xl shadow-lg overflow-auto"
            style={{ height: "30vh", maxHeight: "30vh" }}
          >
            <div className="sticky top-0 flex justify-between items-center p-3 border-b bg-background">
              <h3 className="font-semibold">Properties</h3>
              <Button variant="ghost" size="icon" onClick={closeBottomSheet}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Tag</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/30">
                  {selectedElement || "No selection"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Class Name</label>
                <div className="mt-1 p-2 border rounded-md bg-muted/30">example-class</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedElement
                  ? "Property editing will be implemented soon."
                  : "Select an element from the layer tree to edit its properties."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}