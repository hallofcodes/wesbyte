'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Save,
  Eye,
  Settings,
  Layers,
  Component,
  Plus,
  Trash2,
  Copy,
  Move,
  ChevronRight,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Layout,
  Grid,
  FileText,
  MessageSquare,
  DollarSign,
  Users,
  HelpCircle,
  Phone,
  Star,
  ArrowRight,
  Box,
  Palette,
} from 'lucide-react';
import {
  useWebsiteStore,
  useEditorStore,
  useHistoryStore,
  useCurrentPage,
  useSelectedComponent,
} from '@/store';
import { ComponentType, WebsiteComponent, createComponent } from '@/types';
import { ComponentRenderer } from '@/components/editor/renderers';
import Link from 'next/link';

// Component library items
const componentLibrary: Array<{
  type: ComponentType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}> = [
  { type: 'hero', name: 'Hero', icon: Layout, category: 'Sections' },
  { type: 'navbar', name: 'Navbar', icon: Layout, category: 'Navigation' },
  { type: 'footer', name: 'Footer', icon: Layout, category: 'Navigation' },
  { type: 'feature', name: 'Features', icon: Star, category: 'Sections' },
  { type: 'pricing', name: 'Pricing', icon: DollarSign, category: 'Sections' },
  { type: 'testimonial', name: 'Testimonials', icon: Users, category: 'Sections' },
  { type: 'faq', name: 'FAQ', icon: HelpCircle, category: 'Sections' },
  { type: 'contact-form', name: 'Contact Form', icon: Phone, category: 'Forms' },
  { type: 'gallery', name: 'Gallery', icon: ImageIcon, category: 'Media' },
  { type: 'cta', name: 'Call to Action', icon: ArrowRight, category: 'Sections' },
  { type: 'heading', name: 'Heading', icon: Type, category: 'Basic' },
  { type: 'text', name: 'Text Block', icon: FileText, category: 'Basic' },
  { type: 'button', name: 'Button', icon: Box, category: 'Basic' },
  { type: 'image', name: 'Image', icon: ImageIcon, category: 'Media' },
  { type: 'card', name: 'Card', icon: Layout, category: 'Basic' },
  { type: 'divider', name: 'Divider', icon: FileText, category: 'Layout' },
  { type: 'spacer', name: 'Spacer', icon: FileText, category: 'Layout' },
  { type: 'columns', name: 'Columns', icon: Grid, category: 'Layout' },
];

function ComponentLibraryItem({
  item,
  onAdd,
}: {
  item: (typeof componentLibrary)[0];
  onAdd: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onAdd}
      className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
    >
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <item.icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.category}</p>
      </div>
      <Plus className="h-4 w-4 ml-auto text-muted-foreground" />
    </motion.button>
  );
}

function SortableItem({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  children,
}: {
  component: WebsiteComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 w-full p-2 flex items-center justify-between bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-move"
      >
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-destructive/20"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded hover:bg-muted"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
        <Move className="h-4 w-4 text-muted-foreground" />
      </div>
      <div onClick={onSelect} className="cursor-pointer">
        {children}
      </div>
    </div>
  );
}

function PropertiesPanel() {
  const selectedComponent = useSelectedComponent();
  const { updateComponentStyles, updateComponent } = useWebsiteStore();
  const [activeTab, setActiveTab] = useState('style');

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Select a component to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold capitalize">{selectedComponent.type}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          ID: {selectedComponent.id.slice(0, 8)}...
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
          <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 overflow-auto p-4 space-y-4">
          {/* Padding */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Padding (px)</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <Input
                  key={side}
                  type="number"
                  placeholder={side}
                  value={selectedComponent.styles.padding?.[side] || 0}
                  onChange={(e) => {
                    updateComponentStyles(selectedComponent.id, {
                      padding: {
                        ...selectedComponent.styles.padding,
                        [side]: parseInt(e.target.value) || 0,
                      },
                    });
                  }}
                  className="h-8 text-xs"
                />
              ))}
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Margin (px)</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <Input
                  key={side}
                  type="number"
                  placeholder={side}
                  value={selectedComponent.styles.margin?.[side] || 0}
                  onChange={(e) => {
                    updateComponentStyles(selectedComponent.id, {
                      margin: {
                        ...selectedComponent.styles.margin,
                        [side]: parseInt(e.target.value) || 0,
                      },
                    });
                  }}
                  className="h-8 text-xs"
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedComponent.styles.backgroundColor || '#ffffff'}
                onChange={(e) => {
                  updateComponentStyles(selectedComponent.id, {
                    backgroundColor: e.target.value,
                  });
                }}
                className="w-10 h-10 p-1"
              />
              <Input
                value={selectedComponent.styles.backgroundColor || ''}
                onChange={(e) => {
                  updateComponentStyles(selectedComponent.id, {
                    backgroundColor: e.target.value,
                  });
                }}
                className="h-10 flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedComponent.styles.color || '#000000'}
                onChange={(e) => {
                  updateComponentStyles(selectedComponent.id, {
                    color: e.target.value,
                  });
                }}
                className="w-10 h-10 p-1"
              />
              <Input
                value={selectedComponent.styles.color || ''}
                onChange={(e) => {
                  updateComponentStyles(selectedComponent.id, {
                    color: e.target.value,
                  });
                }}
                className="h-10 flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Border Radius</Label>
            <Input
              value={selectedComponent.styles.borderRadius || ''}
              onChange={(e) => {
                updateComponentStyles(selectedComponent.id, {
                  borderRadius: e.target.value,
                });
              }}
              placeholder="8px"
            />
          </div>

          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              value={selectedComponent.styles.width || ''}
              onChange={(e) => {
                updateComponentStyles(selectedComponent.id, {
                  width: e.target.value,
                });
              }}
              placeholder="100%"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              value={selectedComponent.styles.height || ''}
              onChange={(e) => {
                updateComponentStyles(selectedComponent.id, {
                  height: e.target.value,
                });
              }}
              placeholder="auto"
            />
          </div>
        </TabsContent>

        <TabsContent value="content" className="flex-1 overflow-auto p-4 space-y-4">
          {/* Title */}
          {selectedComponent.content.title !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                value={selectedComponent.content.title || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      title: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}

          {/* Subtitle */}
          {selectedComponent.content.subtitle !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Subtitle</Label>
              <Input
                value={selectedComponent.content.subtitle || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      subtitle: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}

          {/* Text */}
          {selectedComponent.content.text !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Text</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedComponent.content.text || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      text: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}

          {/* Button Text */}
          {selectedComponent.content.buttonText !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Button Text</Label>
              <Input
                value={selectedComponent.content.buttonText || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      buttonText: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}

          {/* Image URL */}
          {selectedComponent.content.image !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Image URL</Label>
              <Input
                value={selectedComponent.content.image || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      image: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}

          {/* Description */}
          {selectedComponent.content.description !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedComponent.content.description || ''}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: {
                      ...selectedComponent.content,
                      description: e.target.value,
                    },
                  });
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LayerItem({
  component,
  depth = 0,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  component: WebsiteComponent;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = component.children && component.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted ${
          selectedId === component.id ? 'bg-primary/10' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(component.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <Component className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm truncate capitalize">{component.type}</span>
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(component.id);
            }}
            className="p-1 hover:bg-muted rounded"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            className="p-1 hover:bg-destructive/20 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {component.children!.map((child) => (
            <LayerItem
              key={child.id}
              component={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const currentPage = useCurrentPage();
  const selectedComponent = useSelectedComponent();

  const {
    addComponent,
    deleteComponent,
    duplicateComponent,
    reorderComponents,
    moveComponent,
  } = useWebsiteStore();

  const {
    selectedComponentId,
    setSelectedComponent,
    devicePreview,
    setDevicePreview,
    sidebarTab,
    setSidebarTab,
  } = useEditorStore();

  const { undo, redo, canUndo, canRedo, pushHistory, clearHistory } =
    useHistoryStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeComponent, setActiveComponent] = useState<WebsiteComponent | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const component = currentPage?.components.find((c) => c.id === active.id);
    if (component) {
      setActiveComponent(component);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveComponent(null);

    if (over && active.id !== over.id && currentPage) {
      const oldIndex = currentPage.components.findIndex(
        (c) => c.id === active.id
      );
      const newIndex = currentPage.components.findIndex(
        (c) => c.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        pushHistory(currentPage);
        reorderComponents(oldIndex, newIndex);
      }
    }
  };

  const handleAddComponent = (type: ComponentType) => {
    if (currentPage) {
      pushHistory(currentPage);
    }
    const newId = addComponent(type);
    if (newId) {
      setSelectedComponent(newId);
    }
  };

  const handleDelete = (componentId: string) => {
    if (currentPage) {
      pushHistory(currentPage);
    }
    deleteComponent(componentId);
    if (selectedComponentId === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleDuplicate = (componentId: string) => {
    if (currentPage) {
      pushHistory(currentPage);
    }
    const newId = duplicateComponent(componentId);
    if (newId) {
      setSelectedComponent(newId);
    }
  };

  const handleUndo = () => {
    const previousPage = undo();
    if (previousPage && currentPage) {
      // Apply the previous state
    }
  };

  const handleRedo = () => {
    const nextPage = redo();
    if (nextPage && currentPage) {
      // Apply the next state
    }
  };

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  // Redirect to builder if no page exists
  useEffect(() => {
    if (!currentPage && !useWebsiteStore.getState().currentPageId) {
      router.push('/builder');
    }
  }, [currentPage, router]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Wesbyte</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            {currentPage?.name || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={handleUndo}
              disabled={!canUndo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={handleRedo}
              disabled={!canRedo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Device Preview */}
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 ${
                devicePreview === 'desktop'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 ${
                devicePreview === 'tablet'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 ${
                devicePreview === 'mobile'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          <Link href="/publish">
            <Button variant="default" className="gap-2">
              Publish
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r flex flex-col">
          <Tabs
            value={sidebarTab}
            onValueChange={(v) => setSidebarTab(v as typeof sidebarTab)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="m-2">
              <TabsTrigger value="components" className="flex-1 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </TabsTrigger>
              <TabsTrigger value="layers" className="flex-1 text-xs">
                <Layers className="h-3 w-3 mr-1" />
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="flex-1 overflow-auto p-2">
              <div className="space-y-4">
                {Array.from(new Set(componentLibrary.map((c) => c.category))).map(
                  (category) => (
                    <div key={category}>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {componentLibrary
                          .filter((c) => c.category === category)
                          .map((item) => (
                            <ComponentLibraryItem
                              key={item.type}
                              item={item}
                              onAdd={() => handleAddComponent(item.type)}
                            />
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="layers" className="flex-1 overflow-auto p-2">
              <ScrollArea className="h-full">
                {currentPage && currentPage.components.length > 0 ? (
                  <div className="space-y-1">
                    {currentPage.components.map((component) => (
                      <LayerItem
                        key={component.id}
                        component={component}
                        selectedId={selectedComponentId}
                        onSelect={setSelectedComponent}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground p-4">
                    No components yet. Add some from the Components tab.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <div className="p-8 flex justify-center">
            <motion.div
              layout
              className={`bg-background border shadow-lg rounded ${deviceSizes[devicePreview]}`}
              style={{ minHeight: 'calc(100vh - 250px)' }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentPage?.components.map((c) => c.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {currentPage && currentPage.components.length > 0 ? (
                    currentPage.components.map((component) => (
                      <SortableItem
                        key={component.id}
                        component={component}
                        isSelected={selectedComponentId === component.id}
                        onSelect={() => setSelectedComponent(component.id)}
                        onDelete={() => handleDelete(component.id)}
                        onDuplicate={() => handleDuplicate(component.id)}
                      >
                        <ComponentRenderer component={component} />
                      </SortableItem>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="text-center max-w-md">
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                          <Layout className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Start building your page
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Click on components in the left sidebar to add them to your page.
                          Drag to reorder.
                        </p>
                      </div>
                    </div>
                  )}
                </SortableContext>

                <DragOverlay>
                  {activeComponent && (
                    <div className="opacity-70">
                      <ComponentRenderer component={activeComponent} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l flex flex-col">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
