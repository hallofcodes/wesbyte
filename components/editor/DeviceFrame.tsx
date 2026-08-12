"use client";

import { useEffect, useRef, useState } from "react";
import type { DevicePreview } from "./PreviewToolbar";

/** Logical viewport width each device preview emulates. */
export const DEVICE_WIDTHS: Record<DevicePreview, number | null> = {
  desktop: null, // fluid — fills whatever space is available
  tablet: 768,
  mobile: 375,
};

interface DeviceFrameProps {
  device: DevicePreview;
  children: React.ReactNode;
}

/**
 * Wraps the canvas in device-appropriate chrome — a macOS-style window bar for desktop, a
 * hardware bezel for tablet and mobile — so the preview reads as "this is what the site
 * looks like on that device".
 *
 * The important part on small screens: a 768px tablet can't physically fit in a ~390px
 * viewport, so instead of letting `max-width: 100%` silently clamp every device to the same
 * size (which made the toolbar buttons look broken), the frame renders at true device width
 * and is scaled down with a CSS transform. Layout still resolves at the real width, so
 * responsive breakpoints behave exactly as they would on the device.
 */
export function DeviceFrame({ device, children }: DeviceFrameProps) {
  const availableRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const targetWidth = DEVICE_WIDTHS[device];

  useEffect(() => {
    const node = availableRef.current;
    if (!node) return;

    const recompute = () => {
      if (!targetWidth) {
        setScale(1);
        return;
      }
      // Leave room for the bezel padding so the frame itself never gets clipped.
      const bezel = device === "desktop" ? 0 : 24;
      const available = node.clientWidth - bezel;
      setScale(available >= targetWidth ? 1 : Math.max(available / targetWidth, 0.2));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(node);
    return () => observer.disconnect();
  }, [targetWidth, device]);

  if (device === "desktop") {
    return (
      <div ref={availableRef} className="w-full flex justify-center">
        <div className="w-full rounded-xl overflow-hidden shadow-2xl border bg-background">
          {/* macOS-style title bar */}
          <div className="flex items-center gap-2 px-3 h-9 bg-muted/80 border-b shrink-0">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="mx-auto flex items-center h-5 px-3 rounded-md bg-background/70 border text-[10px] text-muted-foreground max-w-[60%] truncate">
              localhost:3000
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  const isTablet = device === "tablet";

  return (
    <div ref={availableRef} className="w-full flex justify-center">
      <div
        style={{
          width: targetWidth! * scale,
          // Keep the flow height correct after scaling, so the page doesn't reserve
          // the unscaled height and leave a huge empty gap below the frame.
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        className="shrink-0"
      >
        <div
          style={{ width: targetWidth!, transform: `translateX(${(targetWidth! * scale - targetWidth!) / 2}px)` }}
          className={`bg-neutral-900 shadow-2xl ${isTablet ? "rounded-[28px] p-3" : "rounded-[44px] p-3"}`}
        >
          {/* Speaker / notch */}
          <div className="flex justify-center pb-2">
            <div className={`bg-neutral-700 rounded-full ${isTablet ? "h-1.5 w-12" : "h-1.5 w-16"}`} />
          </div>

          <div className={`bg-background overflow-hidden ${isTablet ? "rounded-[16px]" : "rounded-[30px]"}`}>
            {children}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pt-2">
            <div className={`bg-neutral-700 rounded-full ${isTablet ? "h-8 w-8" : "h-1 w-28"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
