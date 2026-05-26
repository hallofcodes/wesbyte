import { v4 } from 'uuid';

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

export interface ComponentStyles {
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
  width?: string;
  height?: string;
  borderRadius?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  boxShadow?: string;
  border?: string;
  display?: string;
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}

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

export interface ComponentContent {
  text?: string;
  subtext?: string;
  title?: string;
  subtitle?: string;
  label?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  alt?: string;
  height?: string;
  items?: Array<{
    title?: string;
    description?: string;
    price?: string;
    features?: string[];
    image?: string;
    name?: string;
    role?: string;
    quote?: string;
    question?: string;
    answer?: string;
    icon?: string;
  }>;
  links?: Array<{
    label: string;
    href: string;
  }>;
  logo?: string;
  placeholder?: string;
  columns?: number;
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

export function createDefaultStyles(): ComponentStyles {
  return {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

export function createComponent(
  type: ComponentType,
  content: Partial<ComponentContent> = {},
  styles: Partial<ComponentStyles> = {}
): WebsiteComponent {
  return {
    id: `comp_${v4()}`,
    type,
    content: getDefaultContent(type, content),
    styles: { ...createDefaultStyles(), ...styles },
    children: [],
    parentId: null,
    order: 0,
  };
}

export function getDefaultContent(
  type: ComponentType,
  overrides: Partial<ComponentContent> = {}
): ComponentContent {
  const defaults: Record<ComponentType, ComponentContent> = {
    hero: {
      title: 'Build Something Amazing',
      subtitle: 'Create beautiful websites without coding. Our AI-powered platform makes it easy.',
      buttonText: 'Get Started',
      image: 'https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    navbar: {
      logo: 'Brand',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
      ],
      buttonText: 'Sign Up',
    },
    footer: {
      description: 'Building the future of web design, one website at a time.',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    heading: {
      text: 'Welcome to Our Platform',
    },
    text: {
      text: 'Create stunning websites in minutes with our AI-powered builder. No coding required.',
    },
    button: {
      text: 'Click Here',
      buttonText: 'Get Started',
    },
    image: {
      image: 'https://images.pexels.com/photos/261579/pexels-photo-261579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      alt: 'Image description',
    },
    card: {
      title: 'Feature Title',
      description: 'A brief description of this feature and its benefits.',
      image: 'https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    pricing: {
      title: 'Pricing Plans',
      items: [
        {
          title: 'Starter',
          price: '$9/mo',
          features: ['5 Websites', 'Basic Templates', 'Email Support'],
        },
        {
          title: 'Pro',
          price: '$29/mo',
          features: ['Unlimited Websites', 'Premium Templates', 'Priority Support', 'Custom Domain'],
        },
        {
          title: 'Enterprise',
          price: '$99/mo',
          features: ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support'],
        },
      ],
    },
    testimonial: {
      items: [
        {
          name: 'Sarah Johnson',
          role: 'CEO, TechStart',
          quote: 'This platform transformed how we build websites. Incredible results!',
          image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
        },
      ],
    },
    faq: {
      items: [
        {
          question: 'How does the AI website builder work?',
          answer: 'Simply describe what you want, and our AI generates a complete website draft which you can customize.',
        },
        {
          question: 'Can I export the code?',
          answer: 'Yes! You can export clean, production-ready React/Next.js code anytime.',
        },
      ],
    },
    'contact-form': {
      title: 'Get in Touch',
      description: 'Have a question? Send us a message and we will get back to you soon.',
    },
    gallery: {
      title: 'Our Gallery',
      items: [
        { image: 'https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { image: 'https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600' },
      ],
    },
    feature: {
      title: 'Powerful Features',
      items: [
        { title: 'AI-Powered', description: 'Generate complete websites with a simple prompt', icon: 'sparkles' },
        { title: 'Drag & Drop', description: 'Customize everything visually without coding', icon: 'move' },
        { title: 'Responsive', description: 'All websites look great on any device', icon: 'monitor' },
      ],
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of creators building amazing websites.',
      buttonText: 'Start Building Free',
    },
    divider: {},
    spacer: { height: '40px' },
    container: {},
    grid: { columns: 3 },
    columns: { columns: 2 },
  };

  return { ...defaults[type], ...overrides };
}

export function createEmptyPage(name: string = 'Home', slug: string = '/'): WebsitePage {
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
