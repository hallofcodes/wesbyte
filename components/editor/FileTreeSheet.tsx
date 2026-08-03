"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Maximize2,
  Minimize2,
  Save,
  X,
  FileCode,
  Plus,
  ChevronLeft,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { Switch } from "@/components/ui/switch";

interface FileTreeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilePath?: string | null;
  previewMode: "full" | "file";
  onPreviewModeChange: (mode: "full" | "file") => void;
  hasError: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: Record<string, TreeNode>;
}

export function FileTreeSheet({
  isOpen,
  onClose,
  initialFilePath,
  previewMode,
  onPreviewModeChange,
  hasError,
}: FileTreeSheetProps) {
  const { files, selectedFilePath, setSelectedFilePath, updateFileContent } = useProjectStore();
  const [editContent, setEditContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  // Build nested tree from flat file paths
  useEffect(() => {
    const tree: Record<string, TreeNode> = {};
    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split("/");
      let current = tree;
      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath += (currentPath ? "/" : "") + part;
        if (i === parts.length - 1) {
          if (!current[part]) {
            current[part] = {
              name: part,
              path: currentPath,
              type: "file",
            };
          }
        } else {
          if (!current[part]) {
            current[part] = {
              name: part,
              path: currentPath,
              type: "folder",
              children: {},
            };
          }
          current = (current[part] as TreeNode).children!;
        }
      }
    });
    const root: TreeNode = {
      name: "root",
      path: "",
      type: "folder",
      children: tree,
    };
    setFileTree(root);
  }, [files]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  const renderTree = (node: TreeNode, level = 0) => {
    const paddingStyle = { paddingLeft: `${level * 16 + 8}px` };

    if (node.type === "file") {
      return (
        <li
          key={node.path}
          className={`text-sm p-2 rounded-md cursor-pointer hover:bg-muted flex items-center gap-2 ${
            selectedFilePath === node.path ? "bg-muted font-medium" : ""
          }`}
          style={paddingStyle}
          onClick={() => handleFileSelect(node.path)}
        >
          <FileCode className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </li>
      );
    }
    const isOpen = openFolders.has(node.path);
    return (
      <li key={node.path}>
        <div
          className="flex items-center gap-1 p-2 rounded-md cursor-pointer hover:bg-muted"
          style={paddingStyle}
          onClick={() => toggleFolder(node.path)}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronRightIcon className="h-3 w-3 shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <ul className="list-none">
            {Object.values(node.children).map((child) => renderTree(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // Sync selected file when opened or initialFilePath changes
  useEffect(() => {
    if (isOpen && initialFilePath && files[initialFilePath]) {
      setSelectedFilePath(initialFilePath);
      setEditContent(files[initialFilePath]);
      const parts = initialFilePath.split("/");
      let cumulative = "";
      for (let i = 0; i < parts.length - 1; i++) {
        cumulative += (cumulative ? "/" : "") + parts[i];
        setOpenFolders((prev) => new Set(prev).add(cumulative));
      }
    } else if (isOpen && !selectedFilePath && Object.keys(files).length > 0) {
      const firstFile = Object.keys(files)[0];
      setSelectedFilePath(firstFile);
      setEditContent(files[firstFile]);
    }
  }, [isOpen, initialFilePath, files, setSelectedFilePath]);

  useEffect(() => {
    if (selectedFilePath && files[selectedFilePath]) {
      setEditContent(files[selectedFilePath]);
    }
  }, [selectedFilePath, files]);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, visible: true });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: "", visible: false });
    }, 2000);
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
  };

  const handleSave = () => {
    if (selectedFilePath && editContent !== files[selectedFilePath]) {
      updateFileContent(selectedFilePath, editContent);
      showToast(`Saved ${selectedFilePath}`);
    } else {
      showToast("No changes to save");
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const expandSidebar = () => {
    setSidebarCollapsed(false);
  };

  const handleCreateFile = () => {
    setIsCreatingFile(true);
  };

  const confirmCreateFile = () => {
    const path = newFileName.trim();
    if (!path) return;
    let fullPath = path;
    if (!fullPath.endsWith(".jsx")) fullPath += ".jsx";
    if (!fullPath.startsWith("src/")) fullPath = "src/" + fullPath;
    if (files[fullPath]) {
      showToast(`File ${fullPath} already exists`);
      setIsCreatingFile(false);
      setNewFileName("");
      return;
    }
    const componentName = fullPath.split("/").pop()?.replace(".jsx", "") || "Component";
    const template = `function ${componentName}() {
  return <div>${componentName} component</div>;
}
module.exports = ${componentName};`;
    updateFileContent(fullPath, template);
    setSelectedFilePath(fullPath);
    setEditContent(template);
    setIsCreatingFile(false);
    setNewFileName("");
    showToast(`Created ${fullPath}`);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className={`p-0 flex flex-col transition-all duration-300 [&>button]:hidden ${
            isFullscreen
              ? "!inset-0 !w-full !h-full !max-w-none !rounded-none"
              : "w-[90vw] sm:w-[700px]"
          }`}
        >
          <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
            <SheetTitle>Project Files</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with smooth width transition */}
            <div
              className={`border-r transition-all duration-300 ease-out ${
                sidebarCollapsed ? "w-12" : "w-64"
              } overflow-x-hidden flex flex-col`}
            >
              {/* Expanded content */}
              <div className={sidebarCollapsed ? "hidden" : "block"}>
                <div className="flex justify-between items-center p-2 gap-2">
                  <h4 className="text-sm font-medium px-2">Files</h4>
                  <div className="flex flex-row gap-1">
                    <Button variant="ghost" size="icon" onClick={handleCreateFile} className="h-8 w-8" title="New file">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8" title="Collapse sidebar">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="list-none p-2">
                  {fileTree && renderTree(fileTree)}
                </ul>
              </div>

              {/* Collapsed content */}
              <div className={sidebarCollapsed ? "block" : "hidden"}>
                <div className="flex flex-col items-center p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={expandSidebar}
                    className="h-8 w-8 mt-2"
                    title="Expand file tree"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Code editor area */}
            <div className="flex-1 flex flex-col p-4 overflow-auto">
              {selectedFilePath ? (
                <>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="text-sm text-muted-foreground">{selectedFilePath}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Full App</span>
                      <Switch
                        checked={previewMode === "file"}
                        onCheckedChange={(checked) => onPreviewModeChange(checked ? "file" : "full")}
                      />
                      <span className="text-xs">File Preview</span>
                    </div>
                  </div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 font-mono text-sm min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    {hasError && previewMode === "file" && (
                      <div className="text-red-500 text-xs self-center mr-auto">Fix errors before saving</div>
                    )}
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={hasError && previewMode === "file"} className="gap-2">
                      <Save className="h-4 w-4" /> Save
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

      {/* Dialog for creating new file */}
      <Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g., src/NewComponent.jsx"
              className="w-full p-2 border rounded-md"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && confirmCreateFile()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFile(false)}>Cancel</Button>
            <Button onClick={confirmCreateFile}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-4 py-2 rounded-md shadow-lg text-sm animate-in fade-in slide-in-from-bottom-2">
          {toast.message}
        </div>
      )}
    </>
  );
}