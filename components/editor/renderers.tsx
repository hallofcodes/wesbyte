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

export function HeroRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, subtitle, buttonText, buttonLink, image } = component.content;
  const styles = applyStyles(component);

  return (
    <section
      className="relative overflow-hidden"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      {image && (
        <div className="absolute inset-0 z-0">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}
        {buttonText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90">
              {buttonText}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function NavbarRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { logo, links = [], buttonText } = component.content;
  const styles = applyStyles(component);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-sm"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          {logo && (
            <span className="text-xl font-bold">{logo}</span>
          )}
          {links.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
        {buttonText && (
          <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground font-medium hover:bg-primary/90">
            {buttonText}
          </button>
        )}
      </div>
    </nav>
  );
}

export function FooterRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { description, links = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <footer
      className="border-t border-border"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="md:col-span-2">
            {links.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function HeadingRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { text } = component.content;
  const styles = applyStyles(component);

  return (
    <h2
      className="text-2xl font-bold md:text-3xl"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      {text}
    </h2>
  );
}

export function TextRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { text } = component.content;
  const styles = applyStyles(component);

  return (
    <p
      className="text-muted-foreground"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      {text}
    </p>
  );
}

export function ButtonRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { text, buttonText } = component.content;
  const styles = applyStyles(component);

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      {buttonText || text}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function ImageRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { image, alt } = component.content;
  const styles = applyStyles(component);

  return (
    <div style={styles as React.CSSProperties} onClick={onClick}>
      {image && (
        <img
          src={image}
          alt={alt || ''}
          className="w-full h-auto rounded-lg"
        />
      )}
    </div>
  );
}

export function CardRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, description, image } = component.content;
  const styles = applyStyles(component);

  return (
    <div
      className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow"
      style={styles as React.CSSProperties}
      onClick={onClick}
    >
      {image && (
        <img
          src={image}
          alt={title || ''}
          className="w-full h-48 object-cover rounded-t-xl"
        />
      )}
      <div className="p-6">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function PricingRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, items = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="text-center text-3xl font-bold">{title}</h2>
        )}
        {items.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-8 text-center hover:border-primary transition-colors"
              >
                {item.title && (
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                )}
                {item.price && (
                  <p className="mt-4 text-4xl font-bold">{item.price}</p>
                )}
                {item.features && (
                  <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    {item.features.map((feature, i) => (
                      <li key={i} className="flex items-center justify-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="mt-8 w-full rounded-lg bg-primary py-2 text-primary-foreground font-medium hover:bg-primary/90">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function TestimonialRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { items = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">What People Say</h2>
        {items.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-8"
              >
                {item.quote && (
                  <p className="text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                )}
                <div className="mt-4 flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || ''}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    {item.name && (
                      <p className="font-semibold">{item.name}</p>
                    )}
                    {item.role && (
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function FAQRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { items = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold">Frequently Asked Questions</h2>
        {items.length > 0 && (
          <div className="mt-12 space-y-4">
            {items.map((item, index) => (
              <details
                key={index}
                className="group rounded-lg border bg-card"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 font-medium">
                  {item.question}
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ContactFormRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, description } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-2xl">
        {title && <h2 className="text-center text-3xl font-bold">{title}</h2>}
        {description && (
          <p className="mt-4 text-center text-muted-foreground">{description}</p>
        )}
        <form className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              className="rounded-lg border bg-background px-4 py-3"
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border bg-background px-4 py-3"
            />
          </div>
          <input
            type="text"
            placeholder="Subject"
            className="w-full rounded-lg border bg-background px-4 py-3"
          />
          <textarea
            placeholder="Your message"
            rows={5}
            className="w-full rounded-lg border bg-background px-4 py-3"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-3 text-primary-foreground font-medium hover:bg-primary/90"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export function GalleryRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, items = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-6xl">
        {title && <h2 className="text-center text-3xl font-bold">{title}</h2>}
        {items.length > 0 && (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div key={index} className="overflow-hidden rounded-xl">
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="h-64 w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function FeatureRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, items = [] } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="text-center text-3xl font-bold">{title}</h2>
        )}
        {items.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {items.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                {item.title && (
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                )}
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CTARenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { title, subtitle, buttonText } = component.content;
  const styles = applyStyles(component);

  return (
    <section style={styles as React.CSSProperties} onClick={onClick}>
      <div className="mx-auto max-w-4xl text-center">
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {subtitle && <p className="mt-4 text-lg opacity-90">{subtitle}</p>}
        {buttonText && (
          <button className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-primary font-medium hover:bg-white/90">
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}

export function DividerRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  return (
    <hr
      className="border-t border-border"
      onClick={onClick}
    />
  );
}

export function SpacerRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const { height } = component.content;
  return (
    <div
      style={{ height: height || '40px' }}
      onClick={onClick}
    />
  );
}

export function ContainerRenderer({ component, isPreview, onClick, children }: ComponentRendererProps & { children?: React.ReactNode }) {
  const styles = applyStyles(component);

  return (
    <div style={styles as React.CSSProperties} onClick={onClick}>
      {children}
    </div>
  );
}

export function GridRenderer({ component, isPreview, onClick, children }: ComponentRendererProps & { children?: React.ReactNode }) {
  const { columns = 3 } = component.content;
  const styles = applyStyles(component);

  return (
    <div
      className="grid gap-4"
      style={{
        ...styles as React.CSSProperties,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function ColumnsRenderer({ component, isPreview, onClick, children }: ComponentRendererProps & { children?: React.ReactNode }) {
  const { columns = 2 } = component.content;
  const styles = applyStyles(component);

  return (
    <div
      className="grid gap-8"
      style={{
        ...styles as React.CSSProperties,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Main component renderer
export function ComponentRenderer({ component, isPreview, onClick }: ComponentRendererProps) {
  const renderers: Record<string, React.FC<ComponentRendererProps>> = {
    hero: HeroRenderer,
    navbar: NavbarRenderer,
    footer: FooterRenderer,
    heading: HeadingRenderer,
    text: TextRenderer,
    button: ButtonRenderer,
    image: ImageRenderer,
    card: CardRenderer,
    pricing: PricingRenderer,
    testimonial: TestimonialRenderer,
    faq: FAQRenderer,
    'contact-form': ContactFormRenderer,
    gallery: GalleryRenderer,
    feature: FeatureRenderer,
    cta: CTARenderer,
    divider: DividerRenderer,
    spacer: SpacerRenderer,
    container: ContainerRenderer,
    grid: GridRenderer,
    columns: ColumnsRenderer,
  };

  const Renderer = renderers[component.type];

  if (!Renderer) {
    return (
      <div
        className="rounded-lg border-2 border-dashed border-muted-foreground p-8 text-center"
        onClick={onClick}
      >
        <p className="text-muted-foreground">Unknown component: {component.type}</p>
      </div>
    );
  }

  return <Renderer component={component} isPreview={isPreview} onClick={onClick} />;
}
