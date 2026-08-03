"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { DirectRenderer } from "@/components/editor/DirectRenderer";
import { ComponentPreviewRenderer } from "@/components/editor/ComponentPreviewRenderer";
import { LeftSidebar, SidebarTab } from "./LeftSidebar";
import { PreviewToolbar } from "./PreviewToolbar";
import { PropertyPanel } from "./PropertyPanel";
import { MobilePropertySheet } from "./MobilePropertySheet";
import {
  parseJsxToTree,
  setAttributeForTag,
  setTextForTag,
  insertElementNearTag,
  moveElementNearTag,
  WESBYTE_INSERT_MIME,
  WESBYTE_MOVE_MIME,
} from "./editor-helpers";
import {
  ATTR_JSX_NAME,
  EMPTY_ATTRIBUTES,
  isBooleanAttribute,
  readAttributesForTag,
  type ElementAttributes,
} from "./attributeSchema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Globe, Sparkles, Box, FolderTree } from "lucide-react";
import NextLink from "next/link";
import { FileTreeSheet } from "@/components/editor/FileTreeSheet";
import { ElementsTab } from "./SidebarTabs/ElementsTab";
import { LayerTreeTab } from "./SidebarTabs/LayerTreeTab";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const APP_ENTRY_FILE = "src/App.jsx";

const mockFiles = {
  [APP_ENTRY_FILE]: `const Header = require('src/Header.jsx');
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

/** Tracks whether the viewport is currently at/below the mobile breakpoint, reactively (not just at mount). */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/** 0-indexed position of `el` among all elements sharing its tag within `container`, in document order — matches how the AST helpers in editor-helpers.ts count occurrences. */
function computeOccurrenceIndex(container: HTMLElement, el: HTMLElement): number {
  const sameTag = Array.from(container.querySelectorAll(el.tagName));
  return sameTag.indexOf(el);
}

export default function EditorPageContent() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementRaw, setSelectedElementRaw] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "layerTree">("elements");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [fileTreeInitialFile, setFileTreeInitialFile] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"full" | "file">("full");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isCustomComponent, setIsCustomComponent] = useState(false);
  const [customComponentFilePath, setCustomComponentFilePath] = useState<string | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Every editable attribute of the selected element, as one object.
  const [attributes, setAttributes] = useState<ElementAttributes>(EMPTY_ATTRIBUTES);
  const [customAttrKey, setCustomAttrKey] = useState("");
  const [customAttrValue, setCustomAttrValue] = useState("");

  const { files, setFiles, updateFileContent, selectedFilePath, setSelectedFilePath } = useProjectStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [dropIndicator, setDropIndicator] = useState<{ top: number; left: number; width: number } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) {
      setFiles(mockFiles);
    }
  }, [files, setFiles]);

  // Build set of custom component names from src/*.jsx files
  const customComponentNames = useMemo(() => {
    const names = new Set<string>();
    Object.keys(files).forEach((path) => {
      if (path.startsWith("src/") && path.endsWith(".jsx")) {
        const componentName = path.slice(4, -4); // "src/Header.jsx" -> "Header"
        names.add(componentName);
      }
    });
    return names;
  }, [files]);

  // On mobile, default to non-interactive mode so tapping always selects an element.
  useEffect(() => {
    if (isMobile) setInteractiveMode(false);
  }, [isMobile]);

  // Force re-render of preview when files change
  const filesKey = useMemo(() => Object.keys(files).sort().join(","), [files]);

  // Makes every rendered element in the canvas draggable, so existing elements can be
  // dragged to a new position (not just new elements dropped in from the palette).
  // Form controls are excluded so you can still click/type into them normally.
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    const NON_DRAGGABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
    const attached: HTMLElement[] = [];

    const handleDragStart = (e: DragEvent) => {
      const el = e.currentTarget as HTMLElement;
      e.stopPropagation();
      const occurrence = computeOccurrenceIndex(container, el);
      e.dataTransfer?.setData(WESBYTE_MOVE_MIME, JSON.stringify({ tag: el.tagName, occurrence }));
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    };

    const walk = (node: Element) => {
      Array.from(node.children).forEach((child) => {
        const el = child as HTMLElement;
        if (!NON_DRAGGABLE_TAGS.has(el.tagName)) {
          el.draggable = true;
          el.addEventListener("dragstart", handleDragStart);
          attached.push(el);
        }
        walk(el);
      });
    };
    walk(container);

    return () => {
      attached.forEach((el) => el.removeEventListener("dragstart", handleDragStart));
    };
  }, [filesKey]);

  // Dynamic layer tree (full app or selected file)
  const currentFileForLayerTree = useMemo(() => {
    if (previewMode === "file" && selectedFilePath && files[selectedFilePath]) {
      return selectedFilePath;
    }
    return APP_ENTRY_FILE;
  }, [previewMode, selectedFilePath, files]);

  const currentLayerTree = useMemo(() => {
    const code = files?.[currentFileForLayerTree] || "";
    return parseJsxToTree(code);
  }, [files, currentFileForLayerTree]);

  // Core selection function
  const handleSelectElement = (rawTag: string) => {
    const lowerTag = rawTag.toLowerCase();
    setSelectedElement(lowerTag);
    setSelectedElementRaw(rawTag);

    const isCustom = customComponentNames.has(rawTag);
    setIsCustomComponent(isCustom);

    if (isCustom) {
      const guessedPath = `src/${rawTag}.jsx`;
      setCustomComponentFilePath(files[guessedPath] ? guessedPath : null);
      setAttributes(EMPTY_ATTRIBUTES);
    } else {
      setCustomComponentFilePath(null);
      const appCode = files?.[APP_ENTRY_FILE] || "";
      setAttributes(readAttributesForTag(appCode, lowerTag));
    }

    if (isMobile) setIsMobileSheetOpen(true);
  };

  // Native click listener on the preview container (reliable on mobile)
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      // On desktop with interactiveMode on, require Shift key
      if (!isMobile && interactiveMode && !e.shiftKey) return;

      let target = e.target as HTMLElement;
      // Find the deepest element that has a tag name matching a custom component
      let customEl: HTMLElement | null = null;
      while (target && target !== container) {
        if (customComponentNames.has(target.tagName)) {
          customEl = target;
        }
        target = target.parentElement!;
      }
      if (customEl) {
        handleSelectElement(customEl.tagName);
      } else if (e.target instanceof HTMLElement) {
        // Fallback to the clicked element's tag
        handleSelectElement(e.target.tagName);
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [interactiveMode, customComponentNames, files, isMobile]);

  // Interactive mode capture for buttons, links, etc. (only when interactiveMode is false)
  useEffect(() => {
    if (interactiveMode) return;
    const handleCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!previewRef.current?.contains(target)) return;
      const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
      if (interactiveTags.includes(target.tagName)) {
        e.preventDefault();
        e.stopPropagation();
        // Let the global click handler handle selection
      }
    };
    document.addEventListener("click", handleCapture, true);
    return () => document.removeEventListener("click", handleCapture, true);
  }, [interactiveMode]);

  // Single handler for every attribute edit, replacing 19 near-identical handlers.
  const handleAttributeChange = (key: keyof ElementAttributes, value: string | boolean) => {
    if (!selectedElement) return;
    const appCode = files?.[APP_ENTRY_FILE];
    if (!appCode) return;

    let newCode: string;
    if (key === "text") {
      newCode = setTextForTag(appCode, selectedElement, String(value));
    } else {
      const jsxName = ATTR_JSX_NAME[key] ?? key;
      const jsxValue = isBooleanAttribute(key) ? (value ? "true" : "") : String(value);
      newCode = setAttributeForTag(appCode, selectedElement, jsxName, jsxValue);
    }

    updateFileContent(APP_ENTRY_FILE, newCode);
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  // Real drag-and-drop: works for both (a) new elements dragged in from the palette, and
  // (b) existing canvas elements being repositioned. A thin insertion-line indicator shows
  // exactly where the drop will land, based on whether the cursor is over the top or
  // bottom half of the hovered element.
  const computeIndicatorForTarget = (targetEl: HTMLElement, clientY: number) => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return null;
    const rect = targetEl.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const before = clientY < rect.top + rect.height / 2;
    return {
      placement: (before ? "before" : "after") as "before" | "after",
      indicator: {
        top: (before ? rect.top : rect.bottom) - wrapperRect.top + wrapper.scrollTop,
        left: rect.left - wrapperRect.left,
        width: rect.width,
      },
    };
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    const isInsert = e.dataTransfer.types.includes(WESBYTE_INSERT_MIME);
    const isMove = e.dataTransfer.types.includes(WESBYTE_MOVE_MIME);
    if (!isInsert && !isMove) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = isMove ? "move" : "copy";
    setIsDragOverCanvas(true);

    const targetEl = e.target as HTMLElement;
    const container = previewRef.current;
    if (!container || !targetEl || targetEl === container) {
      setDropIndicator(null);
      return;
    }
    const result = computeIndicatorForTarget(targetEl, e.clientY);
    setDropIndicator(result?.indicator ?? null);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    const wrapper = canvasWrapperRef.current;
    const related = e.relatedTarget as Node | null;
    if (wrapper && related && wrapper.contains(related)) return; // still inside, just moved between children
    setIsDragOverCanvas(false);
    setDropIndicator(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    setIsDragOverCanvas(false);
    setDropIndicator(null);

    const container = previewRef.current;
    const targetEl = e.target as HTMLElement;
    if (!container || !targetEl || targetEl === container) return;

    const insertSnippet = e.dataTransfer.getData(WESBYTE_INSERT_MIME);
    const movePayloadRaw = e.dataTransfer.getData(WESBYTE_MOVE_MIME);
    if (!insertSnippet && !movePayloadRaw) return;
    e.preventDefault();

    const appCode = files?.[APP_ENTRY_FILE];
    if (!appCode) return;

    const { placement } = computeIndicatorForTarget(targetEl, e.clientY) ?? { placement: "after" as const };
    const targetOccurrence = computeOccurrenceIndex(container, targetEl);

    let newCode: string | null = null;
    if (insertSnippet) {
      newCode = insertElementNearTag(appCode, targetEl.tagName, insertSnippet, targetOccurrence, placement);
    } else if (movePayloadRaw) {
      try {
        const source = JSON.parse(movePayloadRaw) as { tag: string; occurrence: number };
        if (source.tag === targetEl.tagName && source.occurrence === targetOccurrence) return; // dropped on itself
        newCode = moveElementNearTag(appCode, source, { tag: targetEl.tagName, occurrence: targetOccurrence }, placement);
      } catch {
        return;
      }
    }
    if (newCode) updateFileContent(APP_ENTRY_FILE, newCode);
  };

  const handleAddCustomAttr = () => {
    if (!selectedElement || !customAttrKey) return;
    const appCode = files?.[APP_ENTRY_FILE];
    if (!appCode) return;
    const newCode = setAttributeForTag(appCode, selectedElement, customAttrKey, customAttrValue);
    updateFileContent(APP_ENTRY_FILE, newCode);
    setAttributes(readAttributesForTag(newCode, selectedElement));
    setCustomAttrKey("");
    setCustomAttrValue("");
  };

  const handleFileTreeClick = () => {
    setIsFileTreeOpen(true);
    if (isMobile) setIsMobileSheetOpen(false);
  };

  const handleCloseFileTree = () => {
    setIsFileTreeOpen(false);
    setFileTreeInitialFile(null);
  };

  const handleOpenFileInTree = (filePath: string) => {
    setFileTreeInitialFile(filePath);
    setIsFileTreeOpen(true);
    if (isMobile) setIsMobileSheetOpen(false);
  };

  const sidebarTabs: SidebarTab[] = [
    {
      id: "elements",
      icon: Box,
      label: "Elements",
      content: <ElementsTab onSelectElement={handleSelectElement} onDragStart={() => setIsLeftOpen(false)} />,
    },
    {
      id: "layerTree",
      icon: FolderTree,
      label: "Layer Tree",
      content: (
        <LayerTreeTab
          nodes={currentLayerTree}
          selectedTag={selectedElement}
          onSelect={handleSelectElement}
          title={`Structure: ${currentFileForLayerTree}`}
        />
      ),
    },
  ];

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
        <LeftSidebar
          tabs={sidebarTabs}
          activeTabId={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as "elements" | "layerTree")}
          isOpen={isLeftOpen}
          onToggle={() => setIsLeftOpen(!isLeftOpen)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <PreviewToolbar
            devicePreview={devicePreview}
            onDeviceChange={setDevicePreview}
            interactiveMode={interactiveMode}
            onInteractiveToggle={setInteractiveMode}
            onFileTreeClick={handleFileTreeClick}
            onMobilePropertyOpen={() => setIsMobileSheetOpen(true)}
          />
          <div className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center p-4">
            <div
              ref={canvasWrapperRef}
              className={`relative shadow-2xl bg-background rounded-lg overflow-auto transition-all duration-200 ${
                isDragOverCanvas ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                width: devicePreview === "desktop" ? "100%" : devicePreview === "tablet" ? "768px" : "375px",
                maxWidth: "100%",
                minHeight: "400px",
              }}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
            >
              <div ref={previewRef} className="preview">
                {previewMode === "full" ? (
                  <DirectRenderer key={filesKey} />
                ) : (
                  <ComponentPreviewRenderer
                    key={filesKey}
                    filePath={selectedFilePath}
                    onError={setPreviewError}
                  />
                )}
              </div>
              {dropIndicator && (
                <div
                  className="absolute h-0.5 bg-primary pointer-events-none z-10"
                  style={{ top: dropIndicator.top, left: dropIndicator.left, width: dropIndicator.width }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block w-72 border-l bg-muted/20 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          <PropertyPanel
            selectedElement={selectedElement}
            selectedElementRaw={selectedElementRaw}
            attributes={attributes}
            onAttributeChange={handleAttributeChange}
            customAttrKey={customAttrKey}
            customAttrValue={customAttrValue}
            onCustomAttrKeyChange={setCustomAttrKey}
            onCustomAttrValueChange={setCustomAttrValue}
            onAddCustomAttr={handleAddCustomAttr}
            interactiveMode={interactiveMode}
            isCustomComponent={isCustomComponent}
            customComponentFilePath={customComponentFilePath}
            onOpenFile={handleOpenFileInTree}
          />
        </div>
      </div>

      <MobilePropertySheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        selectedElement={selectedElement}
        selectedElementRaw={selectedElementRaw}
        attributes={attributes}
        onAttributeChange={handleAttributeChange}
        interactiveMode={interactiveMode}
        customAttrKey={customAttrKey}
        customAttrValue={customAttrValue}
        onCustomAttrKeyChange={setCustomAttrKey}
        onCustomAttrValueChange={setCustomAttrValue}
        onAddCustomAttr={handleAddCustomAttr}
        isCustomComponent={isCustomComponent}
        customComponentFilePath={customComponentFilePath}
        onOpenFile={handleOpenFileInTree}
      />

      <FileTreeSheet
        isOpen={isFileTreeOpen}
        onClose={handleCloseFileTree}
        initialFilePath={fileTreeInitialFile}
        previewMode={previewMode}
        onPreviewModeChange={(mode) => {
          setPreviewMode(mode);
          if (mode === "full") setPreviewError(null);
        }}
        hasError={!!previewError}
      />
    </div>
  );
}
