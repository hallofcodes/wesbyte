import { CSSProperties } from "react";
import { v4 } from "uuid";

/* =========================
   CORE TYPES
========================= */

export type ThemeMode = "light" | "dark" | "system";

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
  | "hero"
  | "navbar"
  | "footer"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "card"
  | "pricing"
  | "testimonial"
  | "faq"
  | "contact-form"
  | "gallery"
  | "feature"
  | "cta"
  | "divider"
  | "spacer"
  | "container"
  | "grid"
  | "columns";

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
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface GenerationRequest {
  prompt: string;
  pageId?: string;
  componentId?: string;
  action: "generate" | "regenerate" | "improve" | "modify";
}

export interface ComponentContent {
  title?: string;
  subtitle?: string;
  text?: string;
  buttonText?: string;
  image?: string;
  alt?: string;
  description?: string;
  logo?: string;
  links?: Array<{ label: string; href: string }>;
  items?: Array<any>;
  plans?: Array<any>;
  href?: string;
  tag?: keyof JSX.IntrinsicElements;
  props?: Record<string, any>;
  [key: string]: any;
}

export interface BoxSpacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ComponentStyles extends Omit<
  CSSProperties,
  "padding" | "margin"
> {
  className?: string;
  padding?: BoxSpacing;
  margin?: BoxSpacing;
}

export interface WebsiteComponent {
  id: string;
  type: ComponentType;
  content: ComponentContent;
  styles: ComponentStyles;
  children?: WebsiteComponent[];
  parentId?: string | null;
  order: number;
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
  styles: Partial<ComponentStyles> = {},
): WebsiteComponent {
  return {
    id: `comp_${v4()}`,
    type,
    content: getDefaultContent(type, content),
    props: {},
    styles: { ...createDefaultStyles(), ...styles },
    children: [],
    parentId: null,
    order: 0,
  };
}

export function createDefaultStyles(): ComponentStyles {
  return {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

/**
 * Default props per component type (React-friendly)
 */
export function getDefaultContent(
  type: ComponentType,
  overrides: Partial<ComponentContent> = {},
): ComponentContent {
  const defaults: Partial<Record<ComponentType, ComponentContent>> = {
    hero: {
      title: "Build Something Amazing",
      subtitle: "Create beautiful websites with AI",
      buttonText: "Get Started",
    },
    // ... other defaults (optional)
  };

  return { ...(defaults[type] || {}), ...overrides };
}

/**
 * Empty page factory
 */
export function createEmptyPage(
  name: string = "Home",
  slug: string = "/",
): WebsitePage {
  return {
    id: `page_${v4()}`,
    name,
    slug,
    components: [],
    meta: {
      title: name,
      description: "",
      keywords: [],
    },
  };
}
