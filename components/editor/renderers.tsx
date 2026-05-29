"use client";

import { WebsiteComponent } from '@/types';
import type { UINode } from '@/lib/ai';

const defaultStyles: Record<string, Record<string, unknown>> = {
  hero: {
    padding: { top: 80, right: 40, bottom: 80, left: 40 },
    textAlign: "center" as const,
  },
  navbar: {
    padding: { top: 16, right: 40, bottom: 16, left: 40 },
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
    backgroundColor: "hsl(var(--muted))",
  },
  heading: {
    padding: { top: 16, right: 0, bottom: 8, left: 0 },
    fontWeight: "700",
  },
  text: {
    padding: { top: 8, right: 0, bottom: 8, left: 0 },
  },
  button: {
    padding: { top: 12, right: 24, bottom: 12, left: 24 },
    borderRadius: "8px",
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
  },
  card: {
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    backgroundColor: "hsl(var(--card))",
  },
  pricing: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  testimonial: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
    backgroundColor: "hsl(var(--muted))",
  },
  faq: {
    padding: { top: 60, right: 40, bottom: 60, left: 40 },
  },
  "contact-form": {
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
    textAlign: "center" as const,
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
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

  const basePadding = baseStyles.padding as
    | { top?: number; right?: number; bottom?: number; left?: number }
    | undefined;

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

export function RenderNode({
  node,
}: {
  node: WebsiteComponent | UINode | string | null;
}) {
  if (!node) return null;

  if (typeof node === "string") {
    return node;
  }

  if ("content" in node) {
    const component = node as WebsiteComponent;
    const style = applyStyles(component);
    const className = component.styles?.className;
    const children = component.children?.map((child) => (
      <RenderNode key={child.id} node={child} />
    ));

    switch (component.type) {
      case "hero":
        return (
          <section className={className} style={style}>
            <h1 className="text-4xl font-bold">{component.content.title}</h1>
            {component.content.subtitle && (
              <p className="mt-3 text-muted-foreground">
                {component.content.subtitle}
              </p>
            )}
            {component.content.buttonText && (
              <button className="mt-6 px-4 py-2 rounded bg-primary text-primary-foreground">
                {component.content.buttonText}
              </button>
            )}
            {children}
          </section>
        );
      case "heading": {
        const Tag = (component.content.tag ||
          "h2") as keyof JSX.IntrinsicElements;
        return (
          <Tag className={className} style={style}>
            {component.content.text}
          </Tag>
        );
      }
      case "text": {
        const Tag = (component.content.tag ||
          (component.content.href ? "a" : "p")) as keyof JSX.IntrinsicElements;
        return (
          <Tag
            href={component.content.href}
            className={className}
            style={style}
            {...(component.content.props || {})}
          >
            {component.content.text}
          </Tag>
        );
      }
      case "button":
        return (
          <button className={className} style={style}>
            {component.content.buttonText || component.content.text}
          </button>
        );
      case "image":
        return (
          <img
            className={className}
            style={style}
            src={component.content.image}
            alt={component.content.alt || "image"}
            {...(component.content.props || {})}
          />
        );
      case "divider":
        return <hr className={className} style={style} />;
      case "spacer":
        return (
          <div
            className={className}
            style={{
              ...style,
              height: component.content.height || style.height || "40px",
            }}
          />
        );
      case "container": {
        const Tag = (component.content.tag ||
          "div") as keyof JSX.IntrinsicElements;
        const {
          className: propsClassName,
          style: propsStyle,
          ...restProps
        } = component.content.props || {};
        return (
          <Tag
            {...restProps}
            className={[propsClassName, className].filter(Boolean).join(" ")}
            style={{ ...propsStyle, ...style }}
          >
            {children}
          </Tag>
        );
      }
      default:
        return (
          <div className={className} style={style}>
            {children}
          </div>
        );
    }
  }

  const uiNode = node as UINode;
  const Tag = uiNode.type as keyof JSX.IntrinsicElements;
  return (
    <Tag {...uiNode.props}>
      {uiNode.children?.map((child, i) => (
        <RenderNode key={i} node={child as any} />
      ))}
    </Tag>
  );
}
