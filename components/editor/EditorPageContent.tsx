"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, type DragStartEvent, type DragMoveEvent, type DragEndEvent } from "@dnd-kit/core";
import { useProjectStore } from "@/store/projectStore";
import { DirectRenderer } from "@/components/editor/DirectRenderer";
import { ComponentPreviewRenderer } from "@/components/editor/ComponentPreviewRenderer";
import { LeftSidebar, SidebarTab } from "./LeftSidebar";
import { PreviewToolbar } from "./PreviewToolbar";
import { DeviceFrame } from "./DeviceFrame";
import { PropertyPanel } from "./PropertyPanel";
import { MobilePropertySheet } from "./MobilePropertySheet";
import {
  parseJsxToTree,
  setAttributeForTag,
  setTextForTag,
  appendElementToRoot,
  insertElementAtIndex,
  moveElementToIndex,
  moveElementIndexToRootEnd,
  setAttributeForIndex,
  setTextForIndex,
  getAttributeForIndex,
  WB_ID_ATTR,
} from "./editor-helpers";
import {
  ATTR_JSX_NAME,
  EMPTY_ATTRIBUTES,
  isBooleanAttribute,
  readAttributesForTag,
  readAttributesForIndex,
  type ElementAttributes,
} from "./attributeSchema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Globe, Sparkles, Box, FolderTree } from "lucide-react";
import NextLink from "next/link";
import { FileTreeSheet } from "@/components/editor/FileTreeSheet";
import { ElementsTab, type PaletteDragData } from "./SidebarTabs/ElementsTab";
import { LayerTreeTab } from "./SidebarTabs/LayerTreeTab";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const APP_ENTRY_FILE = "src/App.jsx";

/** Unified payload shape for anything being dragged onto the canvas — either a brand-new
 * palette element (dnd-kit driven) or an existing canvas element being repositioned
 * (manually pointer-driven, since dnd-kit's hooks can't wrap dynamically-rendered nodes). */
type DragPayload = PaletteDragData | { source: "canvas-move"; wbIndex: number };

/** Reads the nearest stable source-node id at or above a DOM node inside the canvas.
 * Returns null for nodes rendered by imported components, which carry no id of their own. */
function findWbIndex(el: HTMLElement | null): number | null {
  const holder = el?.closest(`[${WB_ID_ATTR}]`) as HTMLElement | null;
  if (!holder) return null;
  const raw = holder.getAttribute(WB_ID_ATTR);
  const parsed = raw === null ? NaN : Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

/** How long (ms) a press on a canvas element must be held, and how far (px) it may drift,
 * before it's treated as a drag rather than a tap/scroll — mirrors dnd-kit's TouchSensor
 * defaults so behavior feels consistent between the palette and existing-element dragging. */
const CANVAS_MOVE_ACTIVATION_DELAY = 200;
const CANVAS_MOVE_ACTIVATION_TOLERANCE = 8;

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
export default function EditorPageContent() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementRaw, setSelectedElementRaw] = useState<string | null>(null);
  /** Stable source-node index of the current selection, when it came from clicking the canvas. */
  const [selectedWbIndex, setSelectedWbIndex] = useState<number | null>(null);
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

  // Always-current mirror of `files`, read from inside long-lived pointer-event listeners
  // (attached in a useEffect that doesn't re-run on every file edit) so those listeners
  // never act on stale file content from before the last edit.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // What's currently being dragged onto the canvas, if anything — either a new palette
  // element (source of truth: dnd-kit) or an existing canvas element being repositioned
  // (source of truth: the manual pointer handlers below).
  const [activeDragData, setActiveDragData] = useState<DragPayload | null>(null);
  // The pointer's position at drag start, used together with dnd-kit's `delta` to derive
  // the live pointer position during a palette drag (dnd-kit doesn't expose raw clientX/Y).
  const initialPointerRef = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: CANVAS_MOVE_ACTIVATION_DELAY, tolerance: CANVAS_MOVE_ACTIVATION_TOLERANCE } })
  );

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

  // Real drag-and-drop, touch and mouse alike: works for both (a) new elements dragged in
  // from the palette (driven by dnd-kit, see the DndContext handlers below), and (b)
  // existing canvas elements being repositioned (driven manually, since dnd-kit's hooks
  // can't wrap the dynamically-rendered/compiled elements in the canvas). Both paths funnel
  // through the same computeIndicatorForTarget/updateDropIndicatorForPoint/finalizeDrop logic
  // so behavior is consistent regardless of source.
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

  /** Updates the insertion-line indicator (and the canvas ring highlight) for a live pointer position during a drag. */
  const updateDropIndicatorForPoint = (x: number, y: number) => {
    const container = previewRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!container || !wrapper) {
      setDropIndicator(null);
      setIsDragOverCanvas(false);
      return;
    }

    const hovered = document.elementFromPoint(x, y) as HTMLElement | null;
    const overCanvas = !!hovered && (hovered === container || hovered === wrapper || container.contains(hovered) || wrapper.contains(hovered));
    setIsDragOverCanvas(overCanvas);

    if (hovered && hovered !== container && container.contains(hovered)) {
      const result = computeIndicatorForTarget(hovered, y);
      setDropIndicator(result?.indicator ?? null);
      return;
    }

    if (overCanvas) {
      // Empty canvas space (below/around the rendered content): show the line at the
      // bottom of the content, since the drop will append to the end of the root element.
      const wrapperRect = wrapper.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setDropIndicator({
        top: containerRect.bottom - wrapperRect.top + wrapper.scrollTop,
        left: containerRect.left - wrapperRect.left,
        width: containerRect.width,
      });
      return;
    }

    setDropIndicator(null);
  };

  /** Resolves a finished drag (from either source) into an actual JSX edit. Targets nodes by
   * their stable data-wb-id index rather than tag+DOM-occurrence, so inserts land correctly
   * even in the middle of the tree and even when imported components are rendered. Reads
   * files via filesRef so it's always current when called from a long-lived listener. */
  const finalizeDrop = (data: DragPayload, x: number, y: number) => {
    const container = previewRef.current;
    const wrapper = canvasWrapperRef.current;
    if (!container || !wrapper) return;

    const hovered = document.elementFromPoint(x, y) as HTMLElement | null;
    const appCode = filesRef.current?.[APP_ENTRY_FILE];
    if (!appCode) return;

    const overCanvas =
      !!hovered && (hovered === container || hovered === wrapper || container.contains(hovered) || wrapper.contains(hovered));
    if (!overCanvas || !hovered) return;

    // Which source node is under the pointer, if any. Nodes inside imported components
    // resolve to their nearest annotated ancestor, which is the right place to edit.
    const targetIndex =
      hovered === container || hovered === wrapper ? null : findWbIndex(hovered);

    let newCode: string | null = null;

    if (targetIndex !== null) {
      const { placement } = computeIndicatorForTarget(hovered, y) ?? { placement: "after" as const };
      if (data.source === "palette") {
        newCode = insertElementAtIndex(appCode, targetIndex, data.jsx, placement);
      } else {
        if (data.wbIndex === targetIndex) return; // dropped on itself
        newCode = moveElementToIndex(appCode, data.wbIndex, targetIndex, placement);
      }
    } else {
      // Empty canvas space: append to the end of the root element.
      if (data.source === "palette") {
        newCode = appendElementToRoot(appCode, data.jsx);
      } else {
        newCode = moveElementIndexToRootEnd(appCode, data.wbIndex);
      }
    }

    if (newCode && newCode !== appCode) updateFileContent(APP_ENTRY_FILE, newCode);
  };

  // dnd-kit event handlers for palette → canvas drags. dnd-kit doesn't expose raw pointer
  // coordinates directly, but `activatorEvent` gives the pointer/mouse/touch event that
  // started the drag, and `delta` gives movement since then — added together, that's the
  // live pointer position, without needing a separate window-level listener.
  const getClientPointFromActivator = (activatorEvent: Event): { x: number; y: number } | null => {
    if ("clientX" in activatorEvent) {
      const evt = activatorEvent as MouseEvent | PointerEvent;
      return { x: evt.clientX, y: evt.clientY };
    }
    const touchEvent = activatorEvent as TouchEvent;
    const touch = touchEvent.touches?.[0] ?? touchEvent.changedTouches?.[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleDndDragStart = (event: DragStartEvent) => {
    const data = (event.active.data.current as DragPayload | undefined) ?? null;
    setActiveDragData(data);
    const point = getClientPointFromActivator(event.activatorEvent);
    initialPointerRef.current = point;
    if (point) updateDropIndicatorForPoint(point.x, point.y);
  };

  const handleDndDragMove = (event: DragMoveEvent) => {
    if (!initialPointerRef.current) return;
    const x = initialPointerRef.current.x + event.delta.x;
    const y = initialPointerRef.current.y + event.delta.y;
    updateDropIndicatorForPoint(x, y);
  };

  const handleDndDragEnd = (event: DragEndEvent) => {
    const data = event.active.data.current as DragPayload | undefined;
    const start = initialPointerRef.current;
    setActiveDragData(null);
    setIsDragOverCanvas(false);
    setDropIndicator(null);
    initialPointerRef.current = null;
    if (!data || !start) return;
    finalizeDrop(data, start.x + event.delta.x, start.y + event.delta.y);
  };

  const handleDndDragCancel = () => {
    setActiveDragData(null);
    setIsDragOverCanvas(false);
    setDropIndicator(null);
    initialPointerRef.current = null;
  };

  // Makes every rendered element in the canvas manually draggable via Pointer Events (not
  // dnd-kit, which can't hook into these dynamically-rendered nodes), so existing elements
  // can be repositioned by touch or mouse. A press must be held past a short delay without
  // drifting far (matching dnd-kit's own TouchSensor defaults) before it counts as a drag —
  // this keeps ordinary taps (selection) and scrolling working normally. Form controls are
  // excluded so you can still click/type into them.
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    // In Interactive mode the canvas behaves like the real site: no drag capture, no
    // touch-action override, so buttons/links/scrolling all work normally.
    if (interactiveMode) return;

    const NON_DRAGGABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
    const attached: HTMLElement[] = [];

    const handlePointerDown = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const startX = e.clientX;
      const startY = e.clientY;
      let cancelled = false;
      let armed = false;

      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        clearTimeout(timer);
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (!armed) {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.hypot(dx, dy) > CANVAS_MOVE_ACTIVATION_TOLERANCE) {
            cancelled = true;
            cleanup();
          }
          return;
        }
        moveEvent.preventDefault();
        updateDropIndicatorForPoint(moveEvent.clientX, moveEvent.clientY);
      };

      const onUp = (upEvent: PointerEvent) => {
        cleanup();
        if (armed) {
          const wbIndex = findWbIndex(el);
          if (wbIndex !== null) finalizeDrop({ source: "canvas-move", wbIndex }, upEvent.clientX, upEvent.clientY);
          setActiveDragData(null);
          setIsDragOverCanvas(false);
          setDropIndicator(null);
        }
      };

      const timer = setTimeout(() => {
        if (cancelled) return;
        armed = true;
        const wbIndex = findWbIndex(el);
        if (wbIndex === null) return; // not an App.jsx-owned node; nothing we can reposition
        setActiveDragData({ source: "canvas-move", wbIndex });
        updateDropIndicatorForPoint(startX, startY);
      }, CANVAS_MOVE_ACTIVATION_DELAY);

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
    };

    const walk = (node: Element) => {
      Array.from(node.children).forEach((child) => {
        const el = child as HTMLElement;
        if (!NON_DRAGGABLE_TAGS.has(el.tagName)) {
          el.style.touchAction = "none";
          el.addEventListener("pointerdown", handlePointerDown);
          attached.push(el);
        }
        walk(el);
      });
    };
    walk(container);

    return () => {
      attached.forEach((el) => {
        el.removeEventListener("pointerdown", handlePointerDown);
        el.style.touchAction = "";
      });
    };
  }, [filesKey, interactiveMode]);

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

  // Core selection function. `wbIndex` pins the selection to one exact source node so edits
  // apply to the element that was actually clicked, not merely the first one with that tag.
  const handleSelectElement = (rawTag: string, wbIndex: number | null = null) => {
    const lowerTag = rawTag.toLowerCase();
    setSelectedElement(lowerTag);
    setSelectedElementRaw(rawTag);
    setSelectedWbIndex(wbIndex);

    const isCustom = customComponentNames.has(rawTag);
    setIsCustomComponent(isCustom);

    if (isCustom) {
      const guessedPath = `src/${rawTag}.jsx`;
      setCustomComponentFilePath(files[guessedPath] ? guessedPath : null);
      setAttributes(EMPTY_ATTRIBUTES);
    } else {
      setCustomComponentFilePath(null);
      const appCode = files?.[APP_ENTRY_FILE] || "";
      setAttributes(
        wbIndex !== null
          ? readAttributesForIndex(appCode, wbIndex)
          : readAttributesForTag(appCode, lowerTag)
      );
    }

    if (isMobile) setIsMobileSheetOpen(true);
  };

  // Native click listener on the preview container (reliable on mobile)
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      // Interactive mode means "use the page, don't edit it" -- so selection is suppressed
      // on every device. On desktop, Shift-click is an escape hatch to select anyway; touch
      // has no modifier key, so touch users flip the Interactive switch off instead.
      if (interactiveMode && !(!isMobile && e.shiftKey)) return;

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
        handleSelectElement(customEl.tagName, findWbIndex(customEl));
      } else if (e.target instanceof HTMLElement) {
        handleSelectElement(e.target.tagName, findWbIndex(e.target));
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
      newCode =
        selectedWbIndex !== null
          ? setTextForIndex(appCode, selectedWbIndex, String(value))
          : setTextForTag(appCode, selectedElement, String(value));
    } else {
      const jsxName = ATTR_JSX_NAME[key] ?? key;
      const jsxValue = isBooleanAttribute(key) ? (value ? "true" : "") : String(value);
      newCode =
        selectedWbIndex !== null
          ? setAttributeForIndex(appCode, selectedWbIndex, jsxName, jsxValue)
          : setAttributeForTag(appCode, selectedElement, jsxName, jsxValue);
    }

    updateFileContent(APP_ENTRY_FILE, newCode);
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCustomAttr = () => {
    if (!selectedElement || !customAttrKey) return;
    const appCode = files?.[APP_ENTRY_FILE];
    if (!appCode) return;
    const newCode =
      selectedWbIndex !== null
        ? setAttributeForIndex(appCode, selectedWbIndex, customAttrKey, customAttrValue)
        : setAttributeForTag(appCode, selectedElement, customAttrKey, customAttrValue);
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDndDragStart}
      onDragMove={handleDndDragMove}
      onDragEnd={handleDndDragEnd}
      onDragCancel={handleDndDragCancel}
    >
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
          <div className="flex-1 bg-muted/30 overflow-auto p-4">
            <DeviceFrame device={devicePreview}>
            <div
              ref={canvasWrapperRef}
              className={`relative bg-background overflow-auto transition-all duration-200 ${
                isDragOverCanvas ? "ring-2 ring-primary ring-inset" : ""
              }`}
              style={{ width: "100%", minHeight: "400px" }}
            >
              <div ref={previewRef} className="preview">
                {previewMode === "full" ? (
                  <DirectRenderer key={filesKey} annotateForEditor />
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
            </DeviceFrame>
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
    </DndContext>
  );
}
