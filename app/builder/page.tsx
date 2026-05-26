'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  Wand2,
  Send,
  ArrowRight,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  X,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { generateComponents, generateChatResponse } from '@/lib/ai';
import { useWebsiteStore, useAIStore, useEditorStore } from '@/store';
import { WebsiteComponent } from '@/types';
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

  const {
    createWebsite,
    currentPageId,
    pages,
    addComponent,
  } = useWebsiteStore();

  const {
    isGenerating,
    messages,
    setIsGenerating,
    addMessage,
  } = useAIStore();

  const { setDevicePreview, devicePreview } = useEditorStore();

  const currentPage = pages.find((p) => p.id === currentPageId);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    addMessage('user', prompt);

    try {
      const components = await generateComponents(prompt);

      // Create website if none exists
      if (!currentPageId) {
        createWebsite('My Website');
      }

      // Add generated components
      for (const comp of components) {
        setTimeout(() => {
          addComponent(comp.type);
        }, 100 * components.indexOf(comp));
      }

      addMessage(
        'assistant',
        `I have generated ${components.length} components for your website. You can see them in the preview. Would you like to make any changes or add more sections?`
      );

      setShowSuggestions(false);
    } catch (error) {
      addMessage('assistant', 'Sorry, I encountered an error generating your website. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, setIsGenerating, addMessage, currentPageId, createWebsite, addComponent]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const handleContinueToEditor = () => {
    router.push('/editor');
  };

  // Responsive device preview widths: use max-width so they never exceed viewport
  const deviceSizes = {
    desktop: 'w-full max-w-full',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[375px]',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - remains same, already responsive */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Wesbyte</span>
          </Link>

          <div className="flex items-center gap-4">
            {currentPage && currentPage.components.length > 0 && (
              <Button onClick={handleContinueToEditor} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Continue to Editor
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content - responsive column on mobile, row on desktop */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        
        {/* Left Panel - AI Chat: full width on mobile, fixed width on desktop */}
        <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r flex flex-col overflow-auto">
          {/* Prompt Input */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Describe Your Website</h2>
            </div>

            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to build..."
                className="min-h-[120px] pr-12"
                disabled={isGenerating}
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

            <p className="text-xs text-muted-foreground mt-2">
              Be specific about the style, sections, and purpose of your website.
            </p>
          </div>

          {/* Example Prompts */}
          <AnimatePresence>
            {showSuggestions && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 border-b"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Try these prompts</span>
                </div>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(example)}
                      className="w-full text-left text-sm p-3 rounded-lg border bg-card hover:bg-muted transition-colors"
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating your website...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPrompt('Add a pricing table with three tiers')}
                disabled={isGenerating}
              >
                Add Pricing
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPrompt('Add customer testimonials section')}
                disabled={isGenerating}
              >
                Add Testimonials
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Preview Header */}
          <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Preview</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setDevicePreview('desktop')}
                  className={`p-2 ${
                    devicePreview === 'desktop'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevicePreview('tablet')}
                  className={`p-2 ${
                    devicePreview === 'tablet'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevicePreview('mobile')}
                  className={`p-2 ${
                    devicePreview === 'mobile'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 overflow-auto p-4 sm:p-8">
            <div className="flex justify-center">
              <motion.div
                layout
                className={`bg-background h-full border rounded-lg shadow-lg overflow-auto transition-all ${deviceSizes[devicePreview]}`}
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {currentPage && currentPage.components.length > 0 ? (
                  <div className="min-h-full">
                    {currentPage.components.map((component) => (
                      <ComponentRenderer
                        key={component.id}
                        component={component}
                        isPreview
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-12">
                    <div className="text-center max-w-md">
                      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                        <Wand2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Your website preview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Describe what you want to build, and your website will appear here.
                        Try one of the example prompts to get started.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}