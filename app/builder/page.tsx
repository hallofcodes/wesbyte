
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Sparkles, Wand2, Send, ArrowRight, Monitor, Tablet, Smartphone, RefreshCw, Lightbulb } from 'lucide-react';
import { generateComponents } from '@/lib/ai';
import { useWebsiteStore, useAIStore, useEditorStore } from '@/store';
import { ComponentRenderer } from '@/components/editor/renderers';
import Link from 'next/link';

const examplePrompts = [
  'Create a modern landing page for a tech startup',
  'Build a professional portfolio website for a designer',
  'Design an e-commerce product page with pricing',
  'Make a restaurant website with menu and reservations',
  'Create a fitness studio landing page with class schedules',
];

export default function BuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createWebsite, currentPageId, pages, addComponent } = useWebsiteStore();
  const { isGenerating, messages, setIsGenerating, addMessage } = useAIStore();
  const { setDevicePreview, devicePreview } = useEditorStore();

  const currentPage = pages.find((p) => p.id === currentPageId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    const userPrompt = prompt;
    setPrompt('');
    addMessage('user', userPrompt);
    try {
      const components = await generateComponents(userPrompt);
      if (!currentPageId) createWebsite('My Website');
      for (const comp of components) {
        setTimeout(() => addComponent(comp.type), 100 * components.indexOf(comp));
      }
      addMessage('assistant', `Generated ${components.length} components. Want changes or more sections?`);
      setShowSuggestions(false);
    } catch (error) {
      addMessage('assistant', 'Error generating website. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, setIsGenerating, addMessage, currentPageId, createWebsite, addComponent]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const renderPreviewContent = () => (
    <>
      {currentPage && currentPage.components.length > 0 ? (
        <div className="min-h-full">
          {currentPage.components.map((component) => (
            <ComponentRenderer key={component.id} component={component} isPreview />
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center p-12 text-center">
          <div>
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Wand2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your website preview</h3>
            <p className="text-sm text-muted-foreground">
              Describe what you want to build, and your website will appear here.
            </p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Wesbyte</span>
          </Link>
          <div className="flex items-center gap-4">
            {currentPage && currentPage.components.length > 0 && (
              <Button onClick={() => router.push('/editor')} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Continue to Editor
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Horizontal layout: side by side, scroll if needed */}
      <div className="flex-1 flex flex-row overflow-auto min-h-0">
        {/* Chat Panel - fixed width */}
        <div className="w-[400px] flex-shrink-0 border-r flex flex-col h-full">
          {/* Scrollable messages + suggestions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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

          {/* Input area at bottom of chat panel */}
          <div className="border-t p-4 space-y-3 bg-background flex-shrink-0">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your website..."
                className="min-h-[100px] pr-12 resize-none"
                disabled={isGenerating}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
              />
              <Button size="icon" className="absolute right-2 bottom-2" onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}>
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPrompt('Add a pricing table')} disabled={isGenerating}>
                Add Pricing
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPrompt('Add testimonials')} disabled={isGenerating}>
                Add Testimonials
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Be specific about style, sections, and purpose.</p>
          </div>
        </div>

        {/* Preview Panel - flexible width */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
            <div className="flex items-center border rounded-lg">
              {[
                { device: 'desktop', icon: Monitor },
                { device: 'tablet', icon: Tablet },
                { device: 'mobile', icon: Smartphone },
              ].map(({ device, icon: Icon }) => (
                <button
                  key={device}
                  onClick={() => setDevicePreview(device as any)}
                  className={`p-2 ${devicePreview === device ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-muted/30 overflow-auto p-4 flex justify-center items-center">
            <div
              className="shadow-2xl overflow-hidden flex flex-col bg-background"
              style={{
                width:
                  devicePreview === 'desktop' ? 'min(1024px, 100%)' :
                  devicePreview === 'tablet' ? 'min(768px, 100%)' : 'min(375px, 100%)',
                height:
                  devicePreview === 'desktop' ? 'min(768px, 80vh)' :
                  devicePreview === 'tablet' ? 'min(1024px, 80vh)' : 'min(667px, 80vh)',
                border: devicePreview !== 'desktop' ? '8px solid #1f2937' : '1px solid #e5e7eb',
                borderRadius: devicePreview === 'desktop' ? '0.75rem' : devicePreview === 'tablet' ? '2rem' : '2rem',
              }}
            >
              {/* Device chrome */}
              {devicePreview === 'desktop' && (
                <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 rounded-md bg-background px-4 py-1 text-sm text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      {currentPage && currentPage.components.length > 0 ? 'Website Preview' : 'Your site'}
                    </div>
                  </div>
                </div>
              )}
              {(devicePreview === 'tablet' || devicePreview === 'mobile') && (
                <div className="bg-gray-800 flex justify-center py-1 flex-shrink-0">
                  <div className="h-1 w-12 rounded-full bg-gray-600" />
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                {renderPreviewContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}