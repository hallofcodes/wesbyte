"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  FolderTree,
  Eye,
  Code,
  Move,
  Type,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  Square,
  Image,
  Input as InputIcon,
  Link as LinkIcon,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { DirectRenderer } from "@/components/editor/DirectRenderer";
import NextLink from "next/link";

// ------------------------------
// Helper: parse JSX to AST
// ------------------------------
function parseJSX(jsxString: string) {
  return parser.parse(jsxString, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
}

// ------------------------------
// Helper: generate JSX from AST
// ------------------------------
function generateJSX(ast: any): string {
  const output = generate(ast, { retainLines: false, compact: false });
  return output.code;
}

// ------------------------------
// AST mutation functions
// ------------------------------
function findAppComponent(ast: any): t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression | null {
  let appNode = null;
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const decl = path.node.declaration;
      if (t.isFunctionDeclaration(decl) && decl.id?.name === "App") {
        appNode = decl;
      } else if (t.isArrowFunctionExpression(decl) || t.isFunctionExpression(decl)) {
        appNode = decl;
      }
    },
    FunctionDeclaration(path) {
      if (path.node.id?.name === "App") {
        appNode = path.node;
      }
    },
  });
  return appNode;
}

function getReturnStatement(body: any): t.ReturnStatement | null {
  // body is a BlockStatement (or potentially a Program)
  const statements = body.body || (Array.isArray(body) ? body : []);
  for (const stmt of statements) {
    if (t.isReturnStatement(stmt)) return stmt;
    // Recursively search inside nested blocks (if any)
    if (t.isBlockStatement(stmt)) {
      const found = getReturnStatement(stmt);
      if (found) return found;
    }
  }
  return null;
}

function insertElementAtIndex(parentElement: t.JSXElement, newElement: t.JSXElement, index: number) {
  const children = parentElement.children;
  if (!children) return;
  if (index < 0) index = 0;
  if (index > children.length) index = children.length;
  children.splice(index, 0, t.jsxExpressionContainer(newElement));
}

function updateAttribute(jsxElement: t.JSXElement, attrName: string, attrValue: any) {
  const attributes = jsxElement.openingElement.attributes;
  const existingAttr = attributes.find((attr: any) => t.isJSXAttribute(attr) && attr.name.name === attrName);
  if (existingAttr && t.isJSXAttribute(existingAttr)) {
    existingAttr.value = t.stringLiteral(attrValue);
  } else {
    attributes.push(t.jsxAttribute(t.jsxIdentifier(attrName), t.stringLiteral(attrValue)));
  }
}

function createJSXElement(tag: string, text?: string): t.JSXElement {
  const opening = t.jsxOpeningElement(t.jsxIdentifier(tag), [], false);
  const closing = t.jsxClosingElement(t.jsxIdentifier(tag));
  const children = text ? [t.jsxText(text)] : [];
  return t.jsxElement(opening, closing, children, false);
}

// ------------------------------
// Palette component (uses useDrop inside DndProvider)
// ------------------------------
function Palette({ onInsert }: { onInsert: (tag: string, defaultText: string) => void }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "element",
    drop: (item: { tag: string; defaultText: string }) => {
      onInsert(item.tag, item.defaultText);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const paletteItems = [
    { tag: "div", label: "Container", defaultText: "New Container" },
    { tag: "h1", label: "Heading 1", defaultText: "Heading 1" },
    { tag: "h2", label: "Heading 2", defaultText: "Heading 2" },
    { tag: "h3", label: "Heading 3", defaultText: "Heading 3" },
    { tag: "p", label: "Paragraph", defaultText: "Lorem ipsum..." },
    { tag: "button", label: "Button", defaultText: "Button" },
    { tag: "img", label: "Image", defaultText: "" },
    { tag: "input", label: "Input", defaultText: "" },
    { tag: "a", label: "Link", defaultText: "Link text" },
  ];

  return (
    <div className="p-3 border-b">
      <h3 className="font-semibold mb-2">Elements</h3>
      <div ref={drop} className={`grid grid-cols-2 gap-2 p-2 rounded ${isOver ? "bg-primary/10" : ""}`}>
        {paletteItems.map((item) => (
          <div
            key={item.tag}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify({ tag: item.tag, defaultText: item.defaultText }));
            }}
            className="flex flex-col items-center gap-1 p-2 border rounded-md cursor-grab hover:bg-muted transition-colors"
          >
            <span className="text-xs font-mono">&lt;{item.tag}&gt;</span>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ------------------------------
// Main Editor Component
// ------------------------------
export default function EditorPage() {
  const router = useRouter();
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [selectedNodePath, setSelectedNodePath] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [ast, setAst] = useState<any>(null);
  const [editingMode, setEditingMode] = useState<"visual" | "code">("visual");
  const [codeEditorContent, setCodeEditorContent] = useState("");

  const { files, selectedFilePath, setSelectedFilePath, updateFileContent } = useProjectStore();

  // Load current App.jsx into AST
  useEffect(() => {
    const appCode = files["src/App.jsx"];
    if (!appCode) return;
    setCodeEditorContent(appCode);
    try {
      const newAst = parseJSX(appCode);
      setAst(newAst);
    } catch (err) {
      console.error("Failed to parse JSX", err);
    }
  }, [files]);

  // Save AST back to store
  const saveAstToStore = useCallback(() => {
    if (!ast) return;
    const newCode = generateJSX(ast);
    updateFileContent("src/App.jsx", newCode);
    setCodeEditorContent(newCode);
  }, [ast, updateFileContent]);

  // Manual code edit save
  const handleCodeSave = () => {
    try {
      const newAst = parseJSX(codeEditorContent);
      setAst(newAst);
      updateFileContent("src/App.jsx", codeEditorContent);
    } catch (err) {
      console.error("Invalid JSX", err);
      alert("Invalid JSX syntax");
    }
  };

  // Insert element at the end of App's root div
  const insertElement = (tag: string, text?: string) => {
    if (!ast) return;
    const appNode = findAppComponent(ast);
    if (!appNode) return;
    const returnStmt = getReturnStatement(appNode.body);
    if (!returnStmt || !t.isJSXElement(returnStmt.argument)) return;
    const rootElement = returnStmt.argument;
    const newElement = createJSXElement(tag, text);
    insertElementAtIndex(rootElement, newElement, rootElement.children.length);
    saveAstToStore();
  };

  // Delete selected element (simplified – you can improve)
  const deleteSelectedElement = () => {
    if (!selectedNode || !ast) return;
    console.warn("Delete not fully implemented without parent path");
    // For a production version, you need to find the parent and remove the child.
  };

  // Update attribute of selected element
  const updateSelectedAttribute = (attr: string, value: string) => {
    if (!selectedNode || !t.isJSXElement(selectedNode)) return;
    updateAttribute(selectedNode, attr, value);
    saveAstToStore();
  };

  // Layer tree renderer
  const renderLayerTree = (jsxElement: t.JSXElement, depth = 0): React.ReactNode => {
    const tag = jsxElement.openingElement.name.name;
    const children = jsxElement.children.filter((c: any) => t.isJSXElement(c) || t.isJSXExpressionContainer(c));
    return (
      <div key={Math.random()} style={{ marginLeft: depth * 16 }}>
        <div
          className={`p-1 cursor-pointer hover:bg-muted rounded ${selectedNode === jsxElement ? "bg-muted" : ""}`}
          onClick={() => setSelectedNode(jsxElement)}
        >
          &lt;{tag}&gt;
        </div>
        {children.map((child: any) => {
          if (t.isJSXElement(child)) return renderLayerTree(child, depth + 1);
          if (t.isJSXExpressionContainer(child) && t.isJSXElement(child.expression)) return renderLayerTree(child.expression, depth + 1);
          return null;
        })}
      </div>
    );
  };

  // Extract root element for layer tree
  let rootElement: t.JSXElement | null = null;
  if (ast) {
    const appNode = findAppComponent(ast);
    if (appNode && t.isFunctionDeclaration(appNode)) {
      const returnStmt = getReturnStatement(appNode.body);
      if (returnStmt && t.isJSXElement(returnStmt.argument)) rootElement = returnStmt.argument;
    }
  }

  // Redirect if no project
  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Project Found</h1>
          <p className="text-muted-foreground mb-4">Generate a website in the builder first.</p>
          <Button onClick={() => router.push("/builder")}>Go to Builder</Button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => router.push("/builder")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <NextLink href="/" className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Wesbyte</span>
              </NextLink>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={editingMode === "visual" ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingMode("visual")}
              >
                <Eye className="h-4 w-4 mr-1" /> Visual
              </Button>
              <Button
                variant={editingMode === "code" ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingMode("code")}
              >
                <Code className="h-4 w-4 mr-1" /> Code
              </Button>
            </div>
          </div>
        </header>

        {/* Main layout: three columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar: Palette and Layer Tree */}
          <div className="w-64 border-r bg-muted/20 flex flex-col overflow-auto">
            <Palette onInsert={insertElement} />
            <div className="p-3">
              <h3 className="font-semibold mb-2">Layer Tree</h3>
              <div className="text-sm">{rootElement && renderLayerTree(rootElement)}</div>
            </div>
          </div>

          {/* Center canvas: Preview or Code editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top toolbar */}
            <div className="border-b p-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex border rounded-lg overflow-hidden">
                  {[
                    { device: "desktop", icon: Monitor },
                    { device: "tablet", icon: Tablet },
                    { device: "mobile", icon: Smartphone },
                  ].map(({ device, icon: Icon }) => (
                    <button
                      key={device}
                      onClick={() => setDevicePreview(device as any)}
                      className={`p-2 ${devicePreview === device ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFileTreeOpen(true)}>
                  <FolderTree className="h-4 w-4 mr-1" /> Files
                </Button>
              </div>
            </div>

            {/* Preview or Code area */}
            <div className="flex-1 bg-muted/30 overflow-auto">
              {editingMode === "visual" ? (
                <div className="flex items-center justify-center p-6 min-h-full">
                  <div
                    className="shadow-2xl bg-background overflow-auto"
                    style={{
                      width:
                        devicePreview === "desktop"
                          ? "min(1200px, 100%)"
                          : devicePreview === "tablet"
                          ? "min(820px, 100%)"
                          : "min(390px, 100%)",
                      minHeight: "calc(100vh - 200px)",
                    }}
                  >
                    <div className="preview">
                      <DirectRenderer />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 h-full flex flex-col">
                  <Textarea
                    value={codeEditorContent}
                    onChange={(e) => setCodeEditorContent(e.target.value)}
                    className="flex-1 font-mono text-sm"
                    style={{ minHeight: "400px" }}
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setCodeEditorContent(files["src/App.jsx"])}>
                      Cancel
                    </Button>
                    <Button onClick={handleCodeSave}>Save & Preview</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Property Panel */}
          <div className="w-72 border-l bg-muted/20 p-4 overflow-auto">
            <h3 className="font-semibold mb-4">Properties</h3>
            {selectedNode && t.isJSXElement(selectedNode) ? (
              <div className="space-y-4">
                <div>
                  <Label>Tag</Label>
                  <Input value={selectedNode.openingElement.name.name} disabled />
                </div>
                <div>
                  <Label>Class Name</Label>
                  <Input
                    placeholder="className"
                    value={
                      selectedNode.openingElement.attributes.find(
                        (attr: any) => t.isJSXAttribute(attr) && attr.name.name === "className"
                      )?.value?.value || ""
                    }
                    onChange={(e) => updateSelectedAttribute("className", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Text Content</Label>
                  <Input
                    placeholder="text"
                    value={
                      selectedNode.children[0] && t.isJSXText(selectedNode.children[0])
                        ? selectedNode.children[0].value
                        : ""
                    }
                    onChange={(e) => {
                      const newChildren = [t.jsxText(e.target.value)];
                      selectedNode.children = newChildren;
                      saveAstToStore();
                    }}
                  />
                </div>
                <Button variant="destructive" size="sm" onClick={deleteSelectedElement}>
                  Delete Element
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Select an element from the layer tree to edit properties.</p>
            )}
          </div>
        </div>

        {/* File tree sheet */}
        <Sheet open={isFileTreeOpen} onOpenChange={setIsFileTreeOpen}>
          <SheetContent side="right" className="w-[90vw] sm:w-[700px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Project Files</SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r overflow-auto p-2">
                <h4 className="text-sm font-medium mb-2 px-2">Files</h4>
                <ul className="space-y-1">
                  {Object.keys(files).map((path) => (
                    <li
                      key={path}
                      className={`text-sm p-2 rounded-md cursor-pointer hover:bg-muted ${
                        selectedFilePath === path ? "bg-muted font-medium" : ""
                      }`}
                      onClick={() => {
                        setSelectedFilePath(path);
                        setEditContent(files[path]);
                      }}
                    >
                      {path}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex flex-col p-4 overflow-auto">
                {selectedFilePath ? (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">{selectedFilePath}</div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 font-mono text-sm"
                      style={{ minHeight: "300px" }}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setIsFileTreeOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          updateFileContent(selectedFilePath, editContent);
                          setIsFileTreeOpen(false);
                        }}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground mt-8">Select a file to edit</div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DndProvider>
  );
}