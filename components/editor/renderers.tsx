'use client';

import { motion } from 'framer-motion';
import { WebsiteComponent } from '@/types';
import { Mail, Phone, MapPin, ChevronDown, Star, ArrowRight } from 'lucide-react';

interface ComponentRendererProps {
  component: WebsiteComponent;
  isPreview?: boolean;
  onClick?: () => void;
}

const defaultStyles: Record<string, Record<string, unknown>> = {
  hero: {
    padding: { top: 80, right: 40, bottom: 80, left: 40 },
    textAlign: 'center' as const,
  },
  navbar: {
    padding: { top: 16, right: 40, bottom: 16, left: 40 },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
    backgroundColor: 'hsl(var(--muted))',
  },
  heading: {
    padding: { top: 16, right: 0, bottom: 8, left: 0 },
    fontWeight: '700',
  },
  text: {
    padding: { top: 8, right: 0, bottom: 8, left: 0 },
  },
  button: {
    padding: { top: 12, right: 24, bottom: 12, left: 24 },
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  card: {
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'hsl(var(--card))',
  },
  pricing: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  testimonial: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
    backgroundColor: 'hsl(var(--muted))',
  },
  faq: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  'contact-form': {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  gallery: {
    padding: { top: 40, right: 40, bottom: 40, left: 40 },
  },
  feature: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  cta: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
    textAlign: 'center' as const,
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  image: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  divider: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  spacer: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  container: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  grid: {
    padding: { top: 0, right: 20, bottom: 0, left: 20 },
  },
  columns: {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  },
};

function applyStyles(component: WebsiteComponent) {
  const baseStyles = defaultStyles[component.type] || {};
  const { margin, padding, ...restStyles } = component.styles;

  const basePadding = baseStyles.padding as { top?: number; right?: number; bottom?: number; left?: number } | undefined;

  return {
    marginTop: margin?.top || 0,
    marginRight: margin?.right || 0,
    marginBottom: margin?.bottom || 0,
    marginLeft: margin?.left || 0,
    paddingTop: padding?.top ?? basePadding?.top ?? 0,
    paddingRight: padding?.right ?? basePadding?.right ?? 0,
    paddingBottom: padding?.bottom ?? basePadding?.bottom ?? 0,
    paddingLeft: padding?.left ?? basePadding?.left ?? 0,
    ...restStyles,
  };
}

export function RenderNode({ node }: { node: any }) {
  if (!node) return null;

  // text node
  if (typeof node === "string") {
    return node;
  }

  const Tag = node.type;

  return (
    <Tag {...node.props}>
      {node.children?.map((child: any, i: number) => (
        <RenderNode key={i} node={child} />
      ))}
    </Tag>
  );
}

