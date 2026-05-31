"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Maximize2, Minimize2, Save, X } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";

interface FileTreeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilePath?: string | null;
}

export function FileTreeSheet({ isOpen, onClose, initialFilePath }: FileTreeSheetProps) {
  const { files, selectedFilePath, setSelectedFilePath, updateFileContent } = useProjectStore();
  const [editContent, setEditContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selected file when opened or initialFilePath changes
  useEffect(() => {
    if (isOpen && initialFilePath && files[initialFilePath]) {
      setSelectedFilePath(initialFilePath);
      setEditContent(files[initialFilePath]);
    } else if (isOpen && !selectedFilePath && Object.keys(files).length > 0) {
      const firstFile = Object.keys(files)[0];
      setSelectedFilePath(firstFile);
      setEditContent(files[firstFile]);
    }
  }, [isOpen, initialFilePath, files, setSelectedFilePath]);

  // When selected file changes, update edit content
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
  side="right"
  className={`p-0 flex flex-col transition-all duration-300 ${
    isFullscreen ? "!inset-0 !w-full !h-full !max-w-none !rounded-none" : "w-[90vw] sm:w-[700px]"
  } [&>button]:hidden`}   // ← add this: hides the default close button
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
            {/* File list sidebar */}
            <div className="w-1/3 border-r overflow-auto p-2">
              <h4 className="text-sm font-medium mb-2 px-2">Files</h4>
              <ul className="space-y-1">
                {Object.keys(files).map((path) => (
                  <li
                    key={path}
                    className={`text-sm p-2 rounded-md cursor-pointer hover:bg-muted ${
                      selectedFilePath === path ? "bg-muted font-medium" : ""
                    }`}
                    onClick={() => handleFileSelect(path)}
                  >
                    {path}
                  </li>
                ))}
              </ul>
            </div>

            {/* Code editor area */}
            <div className="flex-1 flex flex-col p-4 overflow-auto">
              {selectedFilePath ? (
                <>
                  <div className="text-sm text-muted-foreground mb-2">
                    {selectedFilePath}
                  </div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 font-mono text-sm min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground mt-8">
                  Select a file to edit
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-md shadow-lg text-sm animate-in fade-in slide-in-from-bottom-2">
          {toast.message}
        </div>
      )}
    </>
  );
}