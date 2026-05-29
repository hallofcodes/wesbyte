"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Monitor, Tablet, Smartphone, FolderTree, Settings } from "lucide-react";
export function PreviewToolbar({ devicePreview, onDeviceChange, interactiveMode, onInteractiveToggle, onFileTreeClick, onMobilePropertyOpen }: any) {
  return (
    <div className="border-b p-2 flex justify-between items-center">
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Preview</span>
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button onClick={() => onDeviceChange("desktop")} className={`p-2 ${devicePreview === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}><Monitor className="h-4 w-4" /></button>
          <button onClick={() => onDeviceChange("tablet")} className={`p-2 ${devicePreview === "tablet" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}><Tablet className="h-4 w-4" /></button>
          <button onClick={() => onDeviceChange("mobile")} className={`p-2 ${devicePreview === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"} transition-colors`}><Smartphone className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2"><Label htmlFor="interactive-mode" className="text-xs text-muted-foreground">Interactive</Label><Switch id="interactive-mode" checked={interactiveMode} onCheckedChange={onInteractiveToggle} /></div>
        <Button variant="outline" size="icon" onClick={onFileTreeClick}><FolderTree className="h-4 w-4" /></Button>
        <div className="md:hidden"><Button variant="outline" size="icon" onClick={onMobilePropertyOpen}><Settings className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}
