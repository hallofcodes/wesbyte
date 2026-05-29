"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Sparkles,
  Wand2,
  Send,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Lightbulb,
  PanelLeft,
} from "lucide-react";
import { generateProject } from "@/lib/ai";
import { useProjectStore } from "@/store/projectStore";
import { MultiFileSandbox } from "@/components/editor/MultiFileSandbox";
import { DirectRenderer } from "@/components/editor/DirectRenderer";
import { useAIStore } from "@/store";
import Link from "next/link";

const examplePrompts = [
  "Create a modern landing page for a tech startup",
  "Build a professional portfolio website for a designer",
  "Design an e-commerce product page with pricing",
  "Make a restaurant website with menu and reservations",
  "Create a fitness studio landing page with class schedules",
];

export default function BuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isGenerating, messages, setIsGenerating, addMessage } = useAIStore();
  const { setFiles, files } = useProjectStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const userPrompt = prompt;
    setPrompt("");
    addMessage("user", userPrompt);

    try {
      const files = await generateProject(userPrompt);
      setFiles(files);
      addMessage("assistant", "Generated project with multiple files.");
      setShowSuggestions(false);
    } catch (error) {
      console.error(error);
      addMessage("assistant", "Error generating website. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, setIsGenerating, addMessage, setFiles]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const renderPreviewContent = () => <DirectRenderer />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsChatOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Wesbyte</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {Object.keys(files).length > 0 && (
              <Button onClick={() => router.push("/editor")} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Continue to Editor
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Overlay for mobile sidebar */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* Horizontal layout */}
      <div className="flex-1 flex flex-row overflow-auto min-h-0">
        {/* Chat Panel */}
        <div
          className={`fixed mt-16 md:mt-0 inset-y-0 left-0 z-40 w-[320px] max-w-[85vw] border-r bg-background flex flex-col transform transition-transform duration-200 md:static md:z-auto md:w-[400px] md:translate-x-0 ${
            isChatOpen ? "translate-x-0" : "-translate-x-full"
          } md:flex md:shrink-0`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            {showSuggestions && messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-sm font-medium">Try these prompts</span>
                </div>
                <div className="space-y-2">
                  {examplePrompts.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(example)}
                      className="w-full text-left text-sm p-3 rounded-lg border bg-card hover:bg-muted transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t p-4 space-y-3 bg-background flex-shrink-0">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your website..."
                className="min-h-[100px] pr-12 resize-none"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleGenerate()}
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPrompt("Add a pricing table")}
                disabled={isGenerating}
              >
                Add Pricing
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPrompt("Add testimonials")}
                disabled={isGenerating}
              >
                Add Testimonials
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Be specific about style, sections, and purpose.
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top bar with device switcher */}
          <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
            <div className="flex items-center border rounded-lg">
              {[
                { device: "desktop", icon: Monitor },
                { device: "tablet", icon: Tablet },
                { device: "mobile", icon: Smartphone },
              ].map(({ device, icon: Icon }) => (
                <button
                  key={device}
                  onClick={() => setDevicePreview(device as any)}
                  className={`p-2 ${
                    devicePreview === device
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Center stage with device wrapper */}
          <div className="flex-1 bg-muted/30 overflow-auto flex items-center justify-center p-6">
            <div
              className="shadow-2xl bg-background overflow-hidden flex flex-col"
              style={{
                width:
                  devicePreview === "desktop"
                    ? "min(1200px, 100%)"
                    : devicePreview === "tablet"
                    ? "min(820px, 100%)"
                    : "min(390px, 100%)",
                aspectRatio:
                  devicePreview === "desktop"
                    ? "16 / 10"
                    : devicePreview === "tablet"
                    ? "4 / 3"
                    : "9 / 19.5",
                border:
                  devicePreview === "desktop"
                    ? "1px solid #e5e7eb"
                    : "10px solid #1f2937",
                borderRadius:
                  devicePreview === "desktop"
                    ? "12px"
                    : devicePreview === "tablet"
                    ? "28px"
                    : "36px",
              }}
            >
              {/* Desktop chrome */}
              {devicePreview === "desktop" && (
                <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 rounded-md bg-background px-4 py-1 text-sm text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      Preview
                    </div>
                  </div>
                </div>
              )}

              {/* Phone/tablet top notch */}
              {(devicePreview === "mobile" || devicePreview === "tablet") && (
                <div className="h-4 bg-gray-800 flex-shrink-0 relative">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-600/70" />
                </div>
              )}

              {/* Content area – the sandbox */}
              <div className="flex-1 overflow-y-auto">
                <div className="preview">
                {renderPreviewContent()}
                </div>
              </div>

              {/* Phone/tablet bottom gesture bar */}
              {(devicePreview === "mobile" || devicePreview === "tablet") && (
                <div className="h-4 bg-gray-800 flex-shrink-0 relative">
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                    <div className="h-1 w-12 rounded-full bg-gray-500/80" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}