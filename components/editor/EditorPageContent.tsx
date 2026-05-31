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
  getClassNameForTag,
  getAttributeForTag,
  setAttributeForTag,
  getTextForTag,
  setTextForTag,
} from "./editor-helpers";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Globe, Sparkles, Box, FolderTree } from "lucide-react";
import NextLink from "next/link";
import { FileTreeSheet } from "@/components/editor/FileTreeSheet";
import { ElementsTab } from "./SidebarTabs/ElementsTab";
import { LayerTreeTab } from "./SidebarTabs/LayerTreeTab";

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

export default function EditorPageContent() {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "layerTree">("elements");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [fileTreeInitialFile, setFileTreeInitialFile] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"full" | "file">("full");
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Basic attributes state
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedSrc, setSelectedSrc] = useState("");
  const [selectedAlt, setSelectedAlt] = useState("");
  const [selectedHref, setSelectedHref] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedRel, setSelectedRel] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedWidth, setSelectedWidth] = useState("");
  const [selectedHeight, setSelectedHeight] = useState("");
  const [selectedPlaceholder, setSelectedPlaceholder] = useState("");
  const [selectedDisabled, setSelectedDisabled] = useState(false);
  const [selectedReadOnly, setSelectedReadOnly] = useState(false);
  const [selectedAutoComplete, setSelectedAutoComplete] = useState("");
  const [selectedTabIndex, setSelectedTabIndex] = useState("");
  const [selectedAriaLabel, setSelectedAriaLabel] = useState("");
  const [selectedAriaHidden, setSelectedAriaHidden] = useState(false);
  const [selectedOnClick, setSelectedOnClick] = useState("");
  const [customAttrKey, setCustomAttrKey] = useState("");
  const [customAttrValue, setCustomAttrValue] = useState("");

  const { files, setFiles, updateFileContent, selectedFilePath, setSelectedFilePath } = useProjectStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // Inject mock project if empty
  useEffect(() => {
    if (!files || Object.keys(files).length === 0) {
      setFiles(mockFiles);
    }
  }, [files, setFiles]);

  // Dynamic layer tree – shows either App.jsx or the selected file (depending on preview mode)
  const currentFileForLayerTree = useMemo(() => {
    if (previewMode === "file" && selectedFilePath && files[selectedFilePath]) {
      return selectedFilePath;
    }
    return "src/App.jsx";
  }, [previewMode, selectedFilePath, files]);

  const currentLayerTree = useMemo(() => {
    const code = files?.[currentFileForLayerTree] || "";
    return parseJsxToTree(code);
  }, [files, currentFileForLayerTree]);

  // Global click capture for interactive mode
  useEffect(() => {
    if (interactiveMode) return;
    const handleCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!previewRef.current?.contains(target)) return;
      const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
      if (interactiveTags.includes(target.tagName)) {
        e.preventDefault();
        e.stopPropagation();
        handleSelectElement(target.tagName.toLowerCase());
      }
    };
    document.addEventListener("click", handleCapture, true);
    return () => document.removeEventListener("click", handleCapture, true);
  }, [interactiveMode]);

  const refreshAttributes = (tag: string, code: string) => {
    setSelectedClassName(getClassNameForTag(code, tag));
    setSelectedId(getAttributeForTag(code, tag, "id"));
    setSelectedSrc(getAttributeForTag(code, tag, "src"));
    setSelectedAlt(getAttributeForTag(code, tag, "alt"));
    setSelectedHref(getAttributeForTag(code, tag, "href"));
    setSelectedTarget(getAttributeForTag(code, tag, "target"));
    setSelectedRel(getAttributeForTag(code, tag, "rel"));
    setSelectedStyle(getAttributeForTag(code, tag, "style"));
    setSelectedWidth(getAttributeForTag(code, tag, "width"));
    setSelectedHeight(getAttributeForTag(code, tag, "height"));
    setSelectedPlaceholder(getAttributeForTag(code, tag, "placeholder"));
    setSelectedDisabled(getAttributeForTag(code, tag, "disabled") === "true");
    setSelectedReadOnly(getAttributeForTag(code, tag, "readOnly") === "true");
    setSelectedAutoComplete(getAttributeForTag(code, tag, "autoComplete"));
    setSelectedTabIndex(getAttributeForTag(code, tag, "tabIndex"));
    setSelectedAriaLabel(getAttributeForTag(code, tag, "aria-label"));
    setSelectedAriaHidden(getAttributeForTag(code, tag, "aria-hidden") === "true");
    setSelectedOnClick(getAttributeForTag(code, tag, "onClick"));
    setSelectedText(getTextForTag(code, tag));
  };

  const handleSelectElement = (tag: string) => {
    const appCode = files?.["src/App.jsx"] || "";
    setSelectedElement(tag);
    refreshAttributes(tag, appCode);
    if (window.innerWidth < 768) setIsMobileSheetOpen(true);
  };

  const updateAttribute = (attr: string, value: string, setter: (v: string) => void) => {
    if (!selectedElement) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const newCode = setAttributeForTag(appCode, selectedElement, attr, value);
    updateFileContent("src/App.jsx", newCode);
    setter(value);
  };

  const updateBooleanAttribute = (attr: string, checked: boolean, setter: (v: boolean) => void) => {
    if (!selectedElement) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const value = checked ? "true" : "";
    const newCode = setAttributeForTag(appCode, selectedElement, attr, value);
    updateFileContent("src/App.jsx", newCode);
    setter(checked);
  };

  const handleClassNameChange = (v: string) => updateAttribute("className", v, setSelectedClassName);
  const handleIdChange = (v: string) => updateAttribute("id", v, setSelectedId);
  const handleSrcChange = (v: string) => updateAttribute("src", v, setSelectedSrc);
  const handleAltChange = (v: string) => updateAttribute("alt", v, setSelectedAlt);
  const handleHrefChange = (v: string) => updateAttribute("href", v, setSelectedHref);
  const handleTargetChange = (v: string) => updateAttribute("target", v, setSelectedTarget);
  const handleRelChange = (v: string) => updateAttribute("rel", v, setSelectedRel);
  const handleTextChange = (v: string) => {
    if (!selectedElement) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const newCode = setTextForTag(appCode, selectedElement, v);
    updateFileContent("src/App.jsx", newCode);
    setSelectedText(v);
  };
  const handleStyleChange = (v: string) => updateAttribute("style", v, setSelectedStyle);
  const handleWidthChange = (v: string) => updateAttribute("width", v, setSelectedWidth);
  const handleHeightChange = (v: string) => updateAttribute("height", v, setSelectedHeight);
  const handlePlaceholderChange = (v: string) => updateAttribute("placeholder", v, setSelectedPlaceholder);
  const handleDisabledChange = (v: boolean) => updateBooleanAttribute("disabled", v, setSelectedDisabled);
  const handleReadOnlyChange = (v: boolean) => updateBooleanAttribute("readOnly", v, setSelectedReadOnly);
  const handleAutoCompleteChange = (v: string) => updateAttribute("autoComplete", v, setSelectedAutoComplete);
  const handleTabIndexChange = (v: string) => updateAttribute("tabIndex", v, setSelectedTabIndex);
  const handleAriaLabelChange = (v: string) => updateAttribute("aria-label", v, setSelectedAriaLabel);
  const handleAriaHiddenChange = (v: boolean) => updateBooleanAttribute("aria-hidden", v, setSelectedAriaHidden);
  const handleOnClickChange = (v: string) => updateAttribute("onClick", v, setSelectedOnClick);

  const handleAddCustomAttr = () => {
    if (!selectedElement || !customAttrKey) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const newCode = setAttributeForTag(appCode, selectedElement, customAttrKey, customAttrValue);
    updateFileContent("src/App.jsx", newCode);
    refreshAttributes(selectedElement, newCode);
    setCustomAttrKey("");
    setCustomAttrValue("");
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveMode && !e.shiftKey) return;
    let target = e.target as HTMLElement;
    while (target && !target.tagName) target = target.parentElement!;
    if (!target) return;
    handleSelectElement(target.tagName.toLowerCase());
  };

  const handleFileTreeClick = () => {
    setIsFileTreeOpen(true);
    if (window.innerWidth < 768) setIsMobileSheetOpen(false);
  };

  const handleCloseFileTree = () => {
    setIsFileTreeOpen(false);
    setFileTreeInitialFile(null);
  };

  // Sidebar tabs
  const sidebarTabs: SidebarTab[] = [
    {
      id: "elements",
      icon: Box,
      label: "Elements",
      content: <ElementsTab onSelectElement={handleSelectElement} />,
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
              className="shadow-2xl bg-background rounded-lg overflow-auto transition-all duration-200"
              style={{
                width: devicePreview === "desktop" ? "100%" : devicePreview === "tablet" ? "768px" : "375px",
                maxWidth: "100%",
                minHeight: "400px",
              }}
            >
              <div ref={previewRef} onClick={handlePreviewClick} className="preview">
                {previewMode === "full" ? (
                  <DirectRenderer />
                ) : (
                  <ComponentPreviewRenderer
                    filePath={selectedFilePath}
                    onError={setPreviewError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop property panel */}
        <div className="hidden md:block w-72 border-l bg-muted/20 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Properties</h3>
          <PropertyPanel
            selectedElement={selectedElement}
            classNameValue={selectedClassName}
            onClassNameChange={handleClassNameChange}
            idValue={selectedId}
            onIdChange={handleIdChange}
            textValue={selectedText}
            onTextChange={handleTextChange}
            srcValue={selectedSrc}
            onSrcChange={handleSrcChange}
            altValue={selectedAlt}
            onAltChange={handleAltChange}
            hrefValue={selectedHref}
            onHrefChange={handleHrefChange}
            targetValue={selectedTarget}
            onTargetChange={handleTargetChange}
            relValue={selectedRel}
            onRelChange={handleRelChange}
            styleValue={selectedStyle}
            onStyleChange={handleStyleChange}
            widthValue={selectedWidth}
            onWidthChange={handleWidthChange}
            heightValue={selectedHeight}
            onHeightChange={handleHeightChange}
            placeholderValue={selectedPlaceholder}
            onPlaceholderChange={handlePlaceholderChange}
            disabledChecked={selectedDisabled}
            onDisabledChange={handleDisabledChange}
            readOnlyChecked={selectedReadOnly}
            onReadOnlyChange={handleReadOnlyChange}
            autoCompleteValue={selectedAutoComplete}
            onAutoCompleteChange={handleAutoCompleteChange}
            tabIndexValue={selectedTabIndex}
            onTabIndexChange={handleTabIndexChange}
            ariaLabelValue={selectedAriaLabel}
            onAriaLabelChange={handleAriaLabelChange}
            ariaHiddenChecked={selectedAriaHidden}
            onAriaHiddenChange={handleAriaHiddenChange}
            onClickValue={selectedOnClick}
            onOnClickChange={handleOnClickChange}
            customAttrKey={customAttrKey}
            customAttrValue={customAttrValue}
            onCustomAttrKeyChange={setCustomAttrKey}
            onCustomAttrValueChange={setCustomAttrValue}
            onAddCustomAttr={handleAddCustomAttr}
            interactiveMode={interactiveMode}
          />
        </div>
      </div>

      <MobilePropertySheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        selectedElement={selectedElement}
        classNameValue={selectedClassName}
        onClassNameChange={handleClassNameChange}
        idValue={selectedId}
        onIdChange={handleIdChange}
        textValue={selectedText}
        onTextChange={handleTextChange}
        srcValue={selectedSrc}
        onSrcChange={handleSrcChange}
        altValue={selectedAlt}
        onAltChange={handleAltChange}
        hrefValue={selectedHref}
        onHrefChange={handleHrefChange}
        targetValue={selectedTarget}
        onTargetChange={handleTargetChange}
        relValue={selectedRel}
        onRelChange={handleRelChange}
        styleValue={selectedStyle}
        onStyleChange={handleStyleChange}
        widthValue={selectedWidth}
        onWidthChange={handleWidthChange}
        heightValue={selectedHeight}
        onHeightChange={handleHeightChange}
        placeholderValue={selectedPlaceholder}
        onPlaceholderChange={handlePlaceholderChange}
        disabledChecked={selectedDisabled}
        onDisabledChange={handleDisabledChange}
        readOnlyChecked={selectedReadOnly}
        onReadOnlyChange={handleReadOnlyChange}
        autoCompleteValue={selectedAutoComplete}
        onAutoCompleteChange={handleAutoCompleteChange}
        tabIndexValue={selectedTabIndex}
        onTabIndexChange={handleTabIndexChange}
        ariaLabelValue={selectedAriaLabel}
        onAriaLabelChange={handleAriaLabelChange}
        ariaHiddenChecked={selectedAriaHidden}
        onAriaHiddenChange={handleAriaHiddenChange}
        onClickValue={selectedOnClick}
        onOnClickChange={handleOnClickChange}
        interactiveMode={interactiveMode}
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