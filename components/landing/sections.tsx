"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  Palette,
  Download,
  Check,
  Star,
  ArrowRight,
  Monitor,
  Layers,
  Code2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const states = ["prompt", "generated", "editor"] as const;

type Mode = (typeof states)[number];

export default function MorphDemo() {
  const [mode, setMode] = useState<(typeof states)[number]>("prompt");

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((prev) => {
        const idx = states.indexOf(prev);
        return states[(idx + 1) % states.length];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden flex items-center justify-center p-2">
      <div className="w-full h-full max-w-full">
        <motion.div
          layout
          className="h-[240px] w-full overflow-hidden rounded-xl border bg-background p-3"
        >
          {/* PROMPT STATE */}
          {mode === "prompt" && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="text-sm text-muted-foreground">AI Prompt</div>
              <div className="h-10 rounded-md bg-muted" />
              <div className="h-10 w-2/3 rounded-md bg-muted" />
            </motion.div>
          )}

          {/* GENERATED WEBSITE STATE */}
          {mode === "generated" && (
            <motion.div
              key="generated"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <motion.div
                layoutId="hero"
                className="h-16 rounded-md bg-blue-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <motion.div
                  layoutId="card1"
                  className="h-20 rounded-md bg-blue-50"
                />
                <motion.div
                  layoutId="card2"
                  className="h-20 rounded-md bg-blue-50"
                />
              </div>
              <motion.div
                layoutId="footer"
                className="h-10 rounded-md bg-blue-100"
              />
            </motion.div>
          )}

          {/* EDITOR STATE */}
          {mode === "editor" && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              {/* Sidebar */}
              <div className="w-32 space-y-2">
                <div className="h-6 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
              </div>

              {/* Canvas */}
              <div className="flex-1 space-y-3">
                <motion.div
                  layoutId="hero"
                  className="h-20 rounded-md bg-green-100"
                />
                <motion.div
                  layoutId="card1"
                  className="h-16 rounded-md bg-green-50"
                />
                <motion.div
                  layoutId="card2"
                  className="h-16 rounded-md bg-green-50"
                />
                <motion.div
                  layoutId="footer"
                  className="h-10 rounded-md bg-green-100"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div
            variants={fadeIn}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              AI-Powered Website Builder
            </span>
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Build Beautiful Websites
            <br />
            <span className="text-gradient animate-gradient">
              With Just Words
            </span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Describe what you want, and our AI creates a complete website. Then
            customize everything visually without writing a single line of code.
          </motion.p>

          <motion.div
            variants={fadeIn}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/builder">
              <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                <Wand2 className="h-5 w-5" />
                Build Your Website
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Export your code
            </div>
          </motion.div>
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.8 }}
          className="mt-16 relative"
        >
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
          <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2 rounded-md bg-background px-4 py-1 text-sm text-muted-foreground">
                  <Wand2 className="h-3 w-3" />
                  Generating website...
                </div>
              </div>
            </div>
            <div className="aspect-video bg-muted/30">
              <div className="aspect-video bg-muted/30 overflow-hidden">
                <div className="h-full w-full">
                  <MorphDemo />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Wand2,
      title: "AI-Powered Generation",
      description:
        "Describe your website in plain English. Our AI creates a complete, responsive design instantly.",
    },
    {
      icon: Layers,
      title: "Drag & Drop Editor",
      description:
        "Customize every element visually. Move, resize, style - all without touching code.",
    },
    {
      icon: Palette,
      title: "Design Freedom",
      description:
        "Full control over colors, typography, spacing, animations, and more.",
    },
    {
      icon: Monitor,
      title: "Responsive Preview",
      description:
        "See your site on desktop, tablet, and mobile. Perfect on every device.",
    },
    {
      icon: Code2,
      title: "Clean Code Export",
      description:
        "Export production-ready React/Next.js code. Your code, your control.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for performance. Built-in SEO best practices.",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to Build
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to published website in minutes. No coding required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out",
      features: [
        "3 websites",
        "Basic components",
        "Community support",
        "Export to React",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      description: "For growing businesses",
      features: [
        "Unlimited websites",
        "Premium components",
        "Priority support",
        "Custom domains",
        "Team collaboration",
        "Advanced AI features",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For large teams",
      features: [
        "Everything in Pro",
        "White label option",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale when you need. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <Card
                className={`h-full ${
                  plan.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Founder, TechStart",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      content:
        "This platform transformed how we build websites. What used to take weeks now takes hours. The AI-generated designs are incredible.",
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      content:
        "As a designer, I was skeptical. But the visual editor gives me complete control. Best of both worlds - AI speed with design freedom.",
    },
    {
      name: "Emily Rodriguez",
      role: "Small Business Owner",
      image:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      content:
        "I launched my bakery website in one afternoon. No developers, no designers. Just me describing what I wanted. Amazing!",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Loved by Creators</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators building beautiful websites.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-12 text-center"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Build Your Website?
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of creators. Start free, no credit card required.
            </p>
            <Link href="/builder">
              <Button
                size="lg"
                className="mt-8 bg-white text-blue-600 hover:bg-white/90 gap-2"
              >
                <Wand2 className="h-5 w-5" />
                Start Building Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-8" />
        </motion.div>
      </div>
    </section>
  );
}