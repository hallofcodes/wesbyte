"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { DirectRenderer } from "@/components/editor/DirectRenderer";
import { LeftSidebar } from "./LeftSidebar";
import { PreviewToolbar } from "./PreviewToolbar";
import { PropertyPanel } from "./PropertyPanel";
import { MobilePropertySheet } from "./MobilePropertySheet";
import { parseJsxToTree, getClassNameForTag, setClassNameForTag, getAttributeForTag, setAttributeForTag, getTextForTag, setTextForTag } from "./editor-helpers";
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
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedSrc, setSelectedSrc] = useState("");
  const [selectedHref, setSelectedHref] = useState("");
  const [selectedAlt, setSelectedAlt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const { files, setFiles, updateFileContent } = useProjectStore();
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!files || Object.keys(files).length === 0) setFiles(mockFiles); }, [files, setFiles]);
  const jsxTree = useMemo(() => parseJsxToTree(files?.["src/App.jsx"] || ""), [files]);
  useEffect(() => {
    if (interactiveMode) return;
    const handleCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!previewRef.current?.contains(target)) return;
      const interactiveTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
      if (interactiveTags.includes(target.tagName)) {
        e.preventDefault(); e.stopPropagation();
        handleSelectElement(target.tagName.toLowerCase());
      }
    };
    document.addEventListener("click", handleCapture, true);
    return () => document.removeEventListener("click", handleCapture, true);
  }, [interactiveMode]);
  const handleSelectElement = (tag: string) => {
    const appCode = files?.["src/App.jsx"] || "";
    setSelectedElement(tag);
    setSelectedClassName(getClassNameForTag(appCode, tag));
    setSelectedId(getAttributeForTag(appCode, tag, "id"));
    setSelectedSrc(getAttributeForTag(appCode, tag, "src"));
    setSelectedHref(getAttributeForTag(appCode, tag, "href"));
    setSelectedAlt(getAttributeForTag(appCode, tag, "alt"));
    setSelectedText(getTextForTag(appCode, tag));
    if (window.innerWidth < 768) setIsMobileSheetOpen(true);
  };
  const updateAttribute = (attr: string, value: string, setter: (v: string) => void, updater: (code: string, tag: string, val: string) => string) => {
    if (!selectedElement) return;
    const appCode = files?.["src/App.jsx"];
    if (!appCode) return;
    const newCode = updater(appCode, selectedElement, value);
    updateFileContent("src/App.jsx", newCode);
    setter(value);
  };
  const handleClassNameChange = (v: string) => updateAttribute("className", v, setSelectedClassName, setClassNameForTag);
  const handleIdChange = (v: string) => updateAttribute("id", v, setSelectedId, setAttributeForTag);
  const handleSrcChange = (v: string) => updateAttribute("src", v, setSelectedSrc, setAttributeForTag);
  const handleHrefChange = (v: string) => updateAttribute("href", v, setSelectedHref, setAttributeForTag);
  const handleAltChange = (v: string) => updateAttribute("alt", v, setSelectedAlt, setAttributeForTag);
  const handleTextChange = (v: string) => updateAttribute("text", v, setSelectedText, setTextForTag);
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveMode && !e.shiftKey) return;
    let target = e.target as HTMLElement;
    while (target && !target.tagName) target = target.parentElement!;
    if (!target) return;
    handleSelectElement(target.tagName.toLowerCase());
  };
  const handleFileTreeClick = () => console.log("Open file tree sheet");
  if (!files || Object.keys(files).length === 0) return <div className="flex items-center justify-center h-screen">Loading project...</div>;
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar isOpen={isLeftOpen} onToggle={() => setIsLeftOpen(!isLeftOpen)} activeTab={activeTab} onTabChange={setActiveTab} layerTreeNodes={jsxTree} selectedTag={selectedElement} onSelectElement={handleSelectElement} onInsertElement={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <PreviewToolbar devicePreview={devicePreview} onDeviceChange={setDevicePreview} interactiveMode={interactiveMode} onInteractiveToggle={setInteractiveMode} onFileTreeClick={handleFileTreeClick} onMobilePropertyOpen={() => setIsMobileSheetOpen(true)} />
          <div className="flex-1 bg-muted/30 overflow-auto flex items-start justify-center p-4">
            <div className="shadow-2xl bg-background rounded-lg overflow-auto transition-all duration-200" style={{ width: devicePreview === "desktop" ? "100%" : devicePreview === "tablet" ? "768px" : "375px", maxWidth: "100%", minHeight: "400px" }}>
              <div ref={previewRef} onClick={handlePreviewClick} className="preview"><DirectRenderer /></div>
            </div>
          </div>
        </div>
        <div className="hidden md:block w-72 border-l bg-muted/20 p-4 overflow-auto"><h3 className="font-semibold mb-4">Properties</h3><PropertyPanel selectedElement={selectedElement} classNameValue={selectedClassName} onClassNameChange={handleClassNameChange} idValue={selectedId} onIdChange={handleIdChange} textValue={selectedText} onTextChange={handleTextChange} srcValue={selectedSrc} onSrcChange={handleSrcChange} hrefValue={selectedHref} onHrefChange={handleHrefChange} altValue={selectedAlt} onAltChange={handleAltChange} interactiveMode={interactiveMode} /></div>
      </div>
      <MobilePropertySheet isOpen={isMobileSheetOpen} onClose={() => setIsMobileSheetOpen(false)} selectedElement={selectedElement} classNameValue={selectedClassName} onClassNameChange={handleClassNameChange} idValue={selectedId} onIdChange={handleIdChange} textValue={selectedText} onTextChange={handleTextChange} srcValue={selectedSrc} onSrcChange={handleSrcChange} hrefValue={selectedHref} onHrefChange={handleHrefChange} altValue={selectedAlt} onAltChange={handleAltChange} interactiveMode={interactiveMode} />
    </div>
  );
}
