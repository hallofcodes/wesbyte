import { v4 } from 'uuid';

/* =========================
   CORE TYPES
========================= */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface FontSettings {
  heading: string;
  body: string;
  mono: string;
}

export interface WebsiteSettings {
  colors: ColorPalette;
  fonts: FontSettings;
  theme: ThemeMode;
}

/* =========================
   COMPONENT SYSTEM (NEW ARCHITECTURE)
   React-first, not CMS-first
========================= */

export type ComponentType =
  | 'hero'
  | 'navbar'
  | 'footer'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'card'
  | 'pricing'
  | 'testimonial'
  | 'faq'
  | 'contact-form'
  | 'gallery'
  | 'feature'
  | 'cta'
  | 'divider'
  | 'spacer'
  | 'container'
  | 'grid'
  | 'columns';

/**
 * React-native props model
 * (AI can freely define structure per component type)
 */
export interface ComponentProps {
  [key: string]: any;
}

/**
 * Styling is now React-friendly (Tailwind / class-based)
 */
export interface ComponentStyles {
  className?: string;
}

/* =========================
   MAIN COMPONENT MODEL
========================= */

export interface WebsiteComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  className?: string;
  children?: WebsiteComponent[];
  parentId?: string | null;
  order: number;
}

/* =========================
   PAGE / SITE STRUCTURE
========================= */

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  components: WebsiteComponent[];
  meta: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Website {
  id: string;
  userId: string;
  name: string;
  description: string;
  slug: string;
  pages: WebsitePage[];
  settings: WebsiteSettings;
  isPublished: boolean;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   VERSIONING / TEMPLATES
========================= */

export interface WebsiteVersion {
  id: string;
  websiteId: string;
  version: number;
  pages: WebsitePage[];
  settings: WebsiteSettings;
  description: string;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  pages: WebsitePage[];
  settings: WebsiteSettings;
  previewImage?: string;
  isPremium: boolean;
}

/* =========================
   USER / AI SYSTEM
========================= */

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface GenerationRequest {
  prompt: string;
  pageId?: string;
  componentId?: string;
  action: 'generate' | 'regenerate' | 'improve' | 'modify';
}

/* =========================
   HELPERS
========================= */

/**
 * Create a clean React-compatible component
 */
 
 /*
export function createComponent(
  type: ComponentType,
  props: ComponentProps = {},
  className: string = ''
): WebsiteComponent {
  return {
    id: `comp_${v4()}`,
    type,
    props: {
      ...getDefaultContent(type),
      ...props,
    },
    className,
    children: [],
    parentId: null,
    order: 0,
  };
}*/

export function createComponent(
  type: ComponentType,
  content: Partial<ComponentContent> = {},
  styles: Partial<ComponentStyles> = {}
): WebsiteComponent {
  return {
    id: `comp_${v4()}`,
    type,
    content: getDefaultContent(type, content) ?? {}, // FIX: never undefined
    styles: { ...createDefaultStyles(), ...styles },
    children: [],
    parentId: null,
    order: 0,
  };
}

/**
 * Default props per component type (React-friendly)
 */
export function getDefaultContent(type: ComponentType): ComponentProps {
  const defaults: Record<ComponentType, ComponentProps> = {
    hero: {
      title: 'Build Something Amazing',
      subtitle: 'Create beautiful websites with AI',
      buttonText: 'Get Started',
    },

    navbar: {
      logo: 'Brand',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
      buttonText: 'Sign Up',
    },

    footer: {
      description: 'Building modern web experiences',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },

    heading: {
      text: 'Welcome',
    },

    text: {
      text: 'Sample text content',
    },

    button: {
      text: 'Click Me',
    },

    image: {
      src: 'https://images.pexels.com/photos/261579/pexels-photo-261579.jpeg',
      alt: 'Image',
    },

    card: {
      title: 'Card Title',
      description: 'Card description',
    },

    pricing: {
      title: 'Pricing',
      plans: [],
    },

    testimonial: {
      items: [],
    },

    faq: {
      items: [],
    },

    'contact-form': {
      title: 'Contact Us',
      description: 'Send us a message',
    },

    gallery: {
      items: [],
    },

    feature: {
      items: [],
    },

    cta: {
      title: 'Ready to start?',
      buttonText: 'Get Started',
    },

    divider: {},
    spacer: { height: '40px' },
    container: {},
    grid: { columns: 3 },
    columns: { columns: 2 },
  };

  return defaults[type] || {};
}

/**
 * Empty page factory
 */
export function createEmptyPage(
  name: string = 'Home',
  slug: string = '/'
): WebsitePage {
  return {
    id: `page_${v4()}`,
    name,
    slug,
    components: [],
    meta: {
      title: name,
      description: '',
      keywords: [],
    },
  };
}