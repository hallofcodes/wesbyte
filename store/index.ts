import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 } from 'uuid';
import {
  Website,
  WebsitePage,
  WebsiteComponent,
  WebsiteSettings,
  AIMessage,
  createComponent,
  createEmptyPage,
  ComponentType,
  ComponentStyles,
} from '@/types';

interface AIState {
  isGenerating: boolean;
  messages: AIMessage[];
  error: string | null;
}

interface WebsiteState {
  currentWebsite: Website | null;
  currentPageId: string | null;
  pages: WebsitePage[];
  settings: WebsiteSettings;

  // Actions
  setCurrentWebsite: (website: Website | null) => void;
  createWebsite: (name: string, description?: string) => void;
  updateWebsite: (updates: Partial<Website>) => void;
  deleteWebsite: () => void;

  // Page actions
  setCurrentPage: (pageId: string) => void;
  addPage: (name: string, slug?: string) => void;
  updatePage: (pageId: string, updates: Partial<WebsitePage>) => void;
  deletePage: (pageId: string) => void;

  // Component actions
  addComponent: (component: WebsiteComponent, parentId?: string | null, index?: number) => string;
  updateComponent: (componentId: string, updates: Partial<WebsiteComponent>) => void;
  updateComponentStyles: (componentId: string, styles: Partial<ComponentStyles>) => void;
  deleteComponent: (componentId: string) => void;
  duplicateComponent: (componentId: string) => string | null;
  moveComponent: (componentId: string, newParentId: string | null, newIndex: number) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;

  // Settings
  updateSettings: (updates: Partial<WebsiteSettings>) => void;
}

interface AIStore extends AIState {
  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

// Default settings
const defaultSettings: WebsiteSettings = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    foreground: '#0f172a',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'monospace',
  },
  theme: 'light',
};

// Website Store
export const useWebsiteStore = create<WebsiteState>()(
  devtools(
    immer((set, get) => ({
      currentWebsite: null,
      currentPageId: null,
      pages: [],
      settings: defaultSettings,

      setCurrentWebsite: (website) =>
        set((state) => {
          state.currentWebsite = website;
          state.pages = website?.pages || [];
          state.settings = website?.settings || defaultSettings;
          state.currentPageId = website?.pages[0]?.id || null;
        }),

      createWebsite: (name, description = '') =>
        set((state) => {
          const websiteId = v4();
          const homePage = createEmptyPage('Home', '/');

          state.currentWebsite = {
            id: websiteId,
            userId: '',
            name,
            description,
            slug: v4(),
            pages: [homePage],
            settings: defaultSettings,
            isPublished: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.pages = [homePage];
          state.currentPageId = homePage.id;
        }),

      updateWebsite: (updates) =>
        set((state) => {
          if (state.currentWebsite) {
            Object.assign(state.currentWebsite, updates);
            state.currentWebsite.updatedAt = new Date();
          }
        }),

      deleteWebsite: () =>
        set((state) => {
          state.currentWebsite = null;
          state.pages = [];
          state.currentPageId = null;
          state.settings = defaultSettings;
        }),

      setCurrentPage: (pageId) =>
        set((state) => {
          state.currentPageId = pageId;
        }),

      addPage: (name, slug) =>
        set((state) => {
          const newPage = createEmptyPage(name, slug || `/${name.toLowerCase().replace(/\s+/g, '-')}`);
          state.pages.push(newPage);
          if (state.currentWebsite) {
            state.currentWebsite.pages.push(newPage);
          }
        }),

      updatePage: (pageId, updates) =>
        set((state) => {
          const pageIndex = state.pages.findIndex((p) => p.id === pageId);
          if (pageIndex !== -1) {
            Object.assign(state.pages[pageIndex], updates);
          }
        }),

      deletePage: (pageId) =>
        set((state) => {
          const index = state.pages.findIndex((p) => p.id === pageId);
          if (index !== -1 && state.pages.length > 1) {
            state.pages.splice(index, 1);
            if (state.currentPageId === pageId) {
              state.currentPageId = state.pages[0]?.id || null;
            }
          }
        }),

      addComponent: (component: WebsiteComponent, parentId = null, index) => {
  let newComponentId = '';

  set((state) => {
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    if (!currentPage) return;

    const newComponent: WebsiteComponent = {
      ...component,
      parentId: parentId || null,
    };

    newComponentId = newComponent.id;

    const insert = (components: WebsiteComponent[]): boolean => {
      if (parentId === null) {
        const i = index ?? components.length;
        components.splice(i, 0, newComponent);
        return true;
      }

      for (const comp of components) {
        if (comp.id === parentId) {
          if (!comp.children) comp.children = [];
          const i = index ?? comp.children.length;
          comp.children.splice(i, 0, newComponent);
          return true;
        }
        if (comp.children && insert(comp.children)) return true;
      }
      return false;
    };

    insert(currentPage.components);
  });

  return newComponentId;
},

      updateComponent: (componentId, updates) =>
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          const updateRecursive = (components: WebsiteComponent[]): boolean => {
            for (const comp of components) {
              if (comp.id === componentId) {
                Object.assign(comp, updates);
                return true;
              }
              if (comp.children && updateRecursive(comp.children)) {
                return true;
              }
            }
            return false;
          };

          updateRecursive(currentPage.components);
        }),

      updateComponentStyles: (componentId, styles) =>
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          const updateStylesRecursive = (components: WebsiteComponent[]): boolean => {
            for (const comp of components) {
              if (comp.id === componentId) {
                comp.styles = { ...comp.styles, ...styles };
                return true;
              }
              if (comp.children && updateStylesRecursive(comp.children)) {
                return true;
              }
            }
            return false;
          };

          updateStylesRecursive(currentPage.components);
        }),

      deleteComponent: (componentId) =>
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          const deleteRecursive = (components: WebsiteComponent[]): boolean => {
            const index = components.findIndex((c) => c.id === componentId);
            if (index !== -1) {
              components.splice(index, 1);
              return true;
            }
            for (const comp of components) {
              if (comp.children && deleteRecursive(comp.children)) {
                return true;
              }
            }
            return false;
          };

          deleteRecursive(currentPage.components);
        }),

      duplicateComponent: (componentId) => {
        let duplicateId: string | null = null;
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          let componentToDuplicate: WebsiteComponent | null = null;

          const findComponent = (components: WebsiteComponent[]): WebsiteComponent | null => {
            for (const comp of components) {
              if (comp.id === componentId) return comp;
              if (comp.children) {
                const found = findComponent(comp.children);
                if (found) return found;
              }
            }
            return null;
          };

          componentToDuplicate = findComponent(currentPage.components);
          if (!componentToDuplicate) return;

          const duplicateRecursive = (
            comp: WebsiteComponent,
            parentId: string | null
          ): WebsiteComponent => {
            const newComp: WebsiteComponent = {
              ...comp,
              id: `comp_${v4()}`,
              parentId,
              children: comp.children?.map((child) => duplicateRecursive(child, comp.id)) || [],
            };
            return newComp;
          };

          const duplicate = duplicateRecursive(componentToDuplicate, componentToDuplicate.parentId ?? null);
          duplicateId = duplicate.id;

          const findAndInsert = (components: WebsiteComponent[]): boolean => {
            const index = components.findIndex((c) => c.id === componentId);
            if (index !== -1) {
              components.splice(index + 1, 0, duplicate);
              return true;
            }
            for (const comp of components) {
              if (comp.children && findAndInsert(comp.children)) {
                return true;
              }
            }
            return false;
          };

          findAndInsert(currentPage.components);
        });
        return duplicateId;
      },

      moveComponent: (componentId, newParentId, newIndex) =>
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          let componentToMove: WebsiteComponent | null = null;

          const removeComponent = (components: WebsiteComponent[]): boolean => {
            const index = components.findIndex((c) => c.id === componentId);
            if (index !== -1) {
              componentToMove = components.splice(index, 1)[0];
              return true;
            }
            for (const comp of components) {
              if (comp.children && removeComponent(comp.children)) {
                return true;
              }
            }
            return false;
          };

          removeComponent(currentPage.components);
          if (!componentToMove) return;

          // Type assertion to fix narrowing issue
          const movedComponent = componentToMove as WebsiteComponent;
          movedComponent.parentId = newParentId;

          const addComponent = (components: WebsiteComponent[]) => {
            if (newParentId === null) {
              components.splice(newIndex, 0, componentToMove!);
              return true;
            }
            for (const comp of components) {
              if (comp.id === newParentId) {
                if (!comp.children) comp.children = [];
                comp.children.splice(newIndex, 0, componentToMove!);
                return true;
              }
              if (comp.children && addComponent(comp.children)) {
                return true;
              }
            }
            return false;
          };

          addComponent(currentPage.components);
        }),

      reorderComponents: (startIndex, endIndex) =>
        set((state) => {
          const currentPage = state.pages.find((p) => p.id === state.currentPageId);
          if (!currentPage) return;

          const [removed] = currentPage.components.splice(startIndex, 1);
          currentPage.components.splice(endIndex, 0, removed);
        }),

      updateSettings: (updates) =>
        set((state) => {
          state.settings = { ...state.settings, ...updates };
          if (state.currentWebsite) {
            state.currentWebsite.settings = state.settings;
          }
        }),
    })),
    { name: 'website-store' }
  )
);

// AI Store
export const useAIStore = create<AIStore>()(
  devtools(
    immer((set) => ({
      isGenerating: false,
      messages: [],
      error: null,

      addMessage: (role, content) =>
        set((state) => {
          state.messages.push({
            id: v4(),
            role,
            content,
            timestamp: new Date(),
          });
        }),

      setIsGenerating: (isGenerating) =>
        set((state) => {
          state.isGenerating = isGenerating;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearMessages: () =>
        set((state) => {
          state.messages = [];
        }),
    })),
    { name: 'ai-store' }
  )
);

// Combined selector for getting current page components
export const useCurrentPage = () => {
  const pages = useWebsiteStore((state) => state.pages);
  const currentPageId = useWebsiteStore((state) => state.currentPageId);
  const currentPage = pages.find((p) => p.id === currentPageId);
  return currentPage;
};

