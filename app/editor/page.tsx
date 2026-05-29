"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  ChevronDown,
  ChevronRight,
  Square,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  ButtonIcon,
  Image,
  Input as InputIcon,
  Link,
  Menu,
  Home,
  Info,
  Mail,
  Circle,
} from "lucide-react";
import NextLink from "next/link";
import { useProjectStore } from "@/store/projectStore";
import { DirectRenderer } from "@/components/editor/DirectRenderer";

// ------------------------------
// JSX Parser
// ------------------------------
type JsxNode = {
  tag: string;
  children: JsxNode[];
};

function parseJsxToTree(jsxCode: string): JsxNode[] {
  const lines = jsxCode.split("\n");
  const stack: { node: JsxNode; indent: number }[] = [];
  const roots: JsxNode[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const indent = line.search(/\S/);
    if (indent === -1) continue;

    const openMatch = trimmed.match(/^<([\w-]+)(?:\s|>)/);
    const closeMatch = trimmed.match(/^<\/([\w-]+)>/);

    if (closeMatch) {
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      continue;
    }

    if (openMatch) {
      const tag = openMatch[1];
      const node: JsxNode = { tag, children: [] };
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      if (stack.length === 0) {
        roots.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }
      stack.push({ node, indent });
    }
  }
  return roots;
}

// ------------------------------
// Helper functions (className)
// ------------------------------
function getClassNameForTag(jsxCode: string, tag: string): string {
  const regex = new RegExp(`<${tag}\\s+className="([^"]*)"`, "i");
  const match = jsxCode.match(regex);
  return match ? match[1] : "";
}

function updateClassNameInCode(jsxCode: string, tag: string, newClassName: string): string {
  const regex = new RegExp(`(<${tag}\\s+className=")[^"]*(")`, "i");
  if (regex.test(jsxCode)) {
    return jsxCode.replace(regex, `$1${newClassName}$2`);
  }
  const openTagRegex = new RegExp(`(<${tag})([^>]*)(>)`, "i");
  return jsxCode.replace(openTagRegex, `$1$2 className="${newClassName}"$3`);
}

// ------------------------------
// Icon mapping
// ------------------------------
const tagIconMap: Record<string, React.ElementType> = {
  div: Square,
  header: Menu,
  nav: Menu,
  main: Home,
  section: Info,
  article: Mail,
  footer: Mail,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  p: AlignLeft,
  button: ButtonIcon,
  img: Image,
  input: InputIcon,
  a: Link,
  ul: Menu,
  li: Circle,
  span: AlignLeft,
};

const FallbackIcon = Square;

// ------------------------------
// TreeItem component with lines and icons
// ------------------------------
function TreeItem({
  node,
  selectedTag,
  onSelect,
  depth = 0,
}: {
  node: JsxNode;
  selectedTag: string | null;
  onSelect: (tag: string) => void;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedTag === node.tag;
  const Icon = tagIconMap[node.tag] || FallbackIcon;

  return (
    <div className="relative">
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-border"
          style={{ left: `${depth * 12 - 8}px` }}
        />
      )}
      <div
        className={`flex items-center gap-1 py-1 cursor-pointer hover:bg-muted rounded-md ${
          isSelected ? "bg-muted font-medium" : ""
        }`}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => onSelect(node.tag)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5"
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm">{node.tag}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children.map((child, idx) => (
            <TreeItem
              key={idx}
              node={child}
              selectedTag={selectedTag}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------
// Draggable elements list
// ------------------------------
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

// ------------------------------
// Main Editor Component
// ------------------------------
export default function EditorPageUI() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"elements" | "layerTree">("elements");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [interactiveMode, setInteractiveMode] = useState(true);

  const { files, setFiles, updateFileContent } = useProjectStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // Inject mock project if no files exist
  useEffect(() => {
    if (!files || Object.keys(files).length === 0) {
      const mockFiles = {
        "src/App.jsx": `const Header = require('src/Header.jsx');
function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Header />
      <main>
        <p>This is a sample website. Edit files via the file tree.</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => alert('Button works')}>Click me</button>
      </main>
    </div>
  );
}
module.exports = App;`,
        "src/Header.jsx": `function Header() {
  return <header style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>Sample Header</header>;
}
module.exports = Header;`,
      };
      setFiles(mockFiles);
    }
  }, [files, setFiles]);

  // Compute JSX tree from App.jsx
  const jsxTree = useMemo(() => {
    const appCode = files?.["src/App.jsx"] || "";
    return parseJsxToTree(appCode);
  }, [files]);

  // Global click capture to suppress interactive elements when interactiveMode is false
  useEffect(() => {
    if (interactiveMode) return;

    const handleCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!previewRef.current?.contains(target)) return;
      const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
      if (interactiveTags.includes(target.tagName)) {
        e.preventDefault();
        e.stopPropagation();
        const tag = target.tagName.toLowerCase();
        handleSelectElement(tag);
      }
    };
    document.addEventListener("click", handleCapture, true);
    return () => document.removeEventListener("click", handleCapture, true);
  }, [interactiveMode]);

  const openSidebarWithTab = (tab: "elements" | "layerTree") => {
    setIsLeftOpen(true);
    setActiveTab(tab);
  };

  const handleSelectElement = (tag: string) => {
    const appCode = files?.["src/App.jsx"] || "";
    const currentClass = getClassNameForTag(appCode, tag);
    setSelectedElement(tag);
    setSelectedClassName(currentClass);
    if (window.innerWidth < 768) setIsBottomSheetOpen(true);
  };

  const handleClassNameChange = (newClass: string) => {
    if (!selectedElement) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const newCode = updateClassNameInCode(appCode, selectedElement, newClass);
    updateFileContent("src/App.jsx", newCode);
    setSelectedClassName(newClass);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveMode && !e.shiftKey) return;
    let target = e.target as HTMLElement;
    while (target && !target.tagName) {
      target = target.parentElement!;
    }
    if (!target) return;
    const tag = target.tagName.toLowerCase();
    handleSelectElement(tag);
  };

  const closeBottomSheet = () => setIsBottomSheetOpen(false);

  if (!files || Object.keys(files).length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading project...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="relative flex-shrink-0">
          <div
            className={`border-r bg-muted/20 flex flex-col h-full transition-all duration-200 ease-in-out overflow-hidden ${
              isLeftOpen ? "w-64" : "w-12"
            }`}
          >
            {isLeftOpen ? (
              <>
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
                      {jsxTree.map((node, idx) => (
                        <TreeItem
                          key={idx}
                          node={node}
                          selectedTag={selectedElement}
                          onSelect={handleSelectElement}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-2 space-y-2">
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
        </div>

        {/* Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b p-2 flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Preview</span>
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setDevicePreview("desktop")}
                  className={`p-2 ${devicePreview === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevicePreview("tablet")}
                  className={`p-2 ${devicePreview === "tablet" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevicePreview("mobile")}
                  className={`p-2 ${devicePreview === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1 border-l pl-2">
                <Label htmlFor="interactive-mode" className="text-xs text-muted-foreground">Interactive</Label>
                <Switch id="interactive-mode" checked={interactiveMode} onCheckedChange={setInteractiveMode} />
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
            <div
              className="shadow-2xl bg-background rounded-lg overflow-auto transition-all duration-200"
              style={{
                width:
                  devicePreview === "desktop"
                    ? "100%"
                    : devicePreview === "tablet"
                    ? "768px"
                    : "375px",
                maxWidth: "100%",
                minHeight: "400px",
              }}
            >
              <div ref={previewRef} onClick={handlePreviewClick} className="preview">
                <DirectRenderer />
              </div>
            </div>
          </div>
        </div>

        {/* Property panel (desktop) */}
        <div className="hidden md:block w-72 border-l bg-muted/20 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <Label>Tag</Label>
                <div className="mt-1 p-2 border rounded-md bg-muted/30">{selectedElement}</div>
              </div>
              <div>
                <Label>Class Name</Label>
                <Input
                  value={selectedClassName}
                  onChange={(e) => handleClassNameChange(e.target.value)}
                  placeholder="className"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Editing the first occurrence of &lt;{selectedElement}&gt;.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {interactiveMode
                ? "Shift+click any element to edit its properties."
                : "Click any element to edit its properties."}
            </p>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div
        className={`fixed md:hidden left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isBottomSheetOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
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
            {selectedElement ? (
              <>
                <div>
                  <Label>Tag</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/30">{selectedElement}</div>
                </div>
                <div>
                  <Label>Class Name</Label>
                  <Input
                    value={selectedClassName}
                    onChange={(e) => handleClassNameChange(e.target.value)}
                    placeholder="className"
                  />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {interactiveMode
                  ? "Shift+click an element to edit properties."
                  : "Click an element to edit properties."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}