"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Monitor, Tablet, Smartphone, FolderTree, Settings } from "lucide-react";

export type DevicePreview = "desktop" | "tablet" | "mobile";

export const DEVICE_OPTIONS: { device: DevicePreview; icon: typeof Monitor }[] = [
  { device: "desktop", icon: Monitor },
  { device: "tablet", icon: Tablet },
  { device: "mobile", icon: Smartphone },
];

interface PreviewToolbarProps {
  devicePreview: DevicePreview;
  onDeviceChange: (device: DevicePreview) => void;
  interactiveMode: boolean;
  onInteractiveToggle: (enabled: boolean) => void;
  onFileTreeClick: () => void;
  onMobilePropertyOpen: () => void;
}

export function PreviewToolbar({
  devicePreview,
  onDeviceChange,
  interactiveMode,
  onInteractiveToggle,
  onFileTreeClick,
  onMobilePropertyOpen,
}: PreviewToolbarProps) {
  return (
    <div className="border-b p-2 flex justify-between items-center">
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Preview</span>
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <div className="flex items-center border rounded-lg overflow-hidden">
          {DEVICE_OPTIONS.map(({ device, icon: Icon }) => (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`p-2 transition-colors ${
                devicePreview === device ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l pl-2">
          <Label htmlFor="interactive-mode" className="text-xs text-muted-foreground">
            Interactive
          </Label>
          <Switch id="interactive-mode" checked={interactiveMode} onCheckedChange={onInteractiveToggle} />
        </div>

        <Button variant="outline" size="icon" onClick={onFileTreeClick}>
          <FolderTree className="h-4 w-4" />
        </Button>

        <div className="md:hidden">
          <Button variant="outline" size="icon" onClick={onMobilePropertyOpen}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
