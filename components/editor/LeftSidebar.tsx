"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export interface SidebarTab {
  id: string;
  icon: React.ElementType;
  label: string;
  content: React.ReactNode;
}

interface LeftSidebarProps {
  tabs: SidebarTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function LeftSidebar({
  tabs,
  activeTabId,
  onTabChange,
  isOpen,
  onToggle,
}: LeftSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripRect, setStripRect] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const measure = () => {
      if (stripRef.current) {
        const rect = stripRef.current.getBoundingClientRect();
        setStripRect({ left: rect.left, top: rect.top });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleIconClick = (tabId: string) => {
    onTabChange(tabId);
    if (!isOpen) onToggle();
  };

  const activeTab = tabs.find(t => t.id === activeTabId);
  const sidebarWidth = 304;
  const backdropLeft = stripRect.left + sidebarWidth;

  return (
    <>
      {/* Persistent thin strip - always visible, part of flex layout */}
      <div
        ref={stripRef}
        className="w-12 border-r bg-muted/20 flex flex-col items-center py-2 space-y-2 h-full"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="icon"
            onClick={() => handleIconClick(tab.id)}
            className="rounded-lg hover:!bg-primary hover:!text-primary-foreground"
            title={tab.label}
          >
            <tab.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      {/* Backdrop - always rendered, transitions opacity */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          left: `${backdropLeft}px`,
          top: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onToggle}
      />

      {/* Expanded panel - always rendered, transitions transform and opacity */}
      <div
        ref={panelRef}
        className="fixed z-50 flex shadow-xl bg-background transition-all duration-300 ease-out"
        style={{
          left: `${stripRect.left}px`,
          top: `${stripRect.top}px`,
          width: `${sidebarWidth}px`,
          bottom: 0,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {/* Inner strip (replica) */}
        <div className="w-12 border-r flex flex-col items-center py-2 space-y-2 h-full bg-background flex-shrink-0">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => handleIconClick(tab.id)}
              className={`rounded-lg hover:!bg-primary hover:!text-primary-foreground ${
                activeTabId === tab.id ? "bg-primary text-primary-foreground" : ""
              }`}
              title={tab.label}
            >
              <tab.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>

        {/* Content panel with fade animation on tab change */}
        <div className="w-64 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="text-sm font-medium ml-2">{activeTab?.label}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 hover:!bg-primary hover:!text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <div
              key={activeTabId}
              className="transition-all duration-200"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              {activeTab?.content}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}