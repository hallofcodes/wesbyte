'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Globe,
  Code,
  Settings,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Zap,
  FileJson,
  Folder,
  FileCode,
  Shield,
  Eye,
} from 'lucide-react';
import { useWebsiteStore, useCurrentPage } from '@/store';
import Link from 'next/link';

export default function PublishPage() {
  const router = useRouter();
  const currentPage = useCurrentPage();
  const { currentWebsite, settings, updateSettings } = useWebsiteStore();

  const [customDomain, setCustomDomain] = useState('');
  const [metaTitle, setMetaTitle] = useState(currentPage?.meta.title || '');
  const [metaDescription, setMetaDescription] = useState(
    currentPage?.meta.description || ''
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
    setExported(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  // Generate code preview
  const generateReactCode = () => {
    if (!currentPage) return '';

    let code = `import { motion } from 'framer-motion';\n\n`;
    code += `export default function Page() {\n`;
    code += `  return (\n`;
    code += `    <main className="min-h-screen">\n`;

    for (const component of currentPage.components) {
      code += `      <${getComponentName(component.type)} />\n`;
    }

    code += `    </main>\n`;
    code += `  );\n`;
    code += `}\n`;

    return code;
  };

  const getComponentName = (type: string) => {
    const names: Record<string, string> = {
      hero: 'HeroSection',
      navbar: 'Navbar',
      footer: 'Footer',
      feature: 'FeaturesSection',
      pricing: 'PricingSection',
      testimonial: 'TestimonialsSection',
      faq: 'FAQSection',
      'contact-form': 'ContactForm',
      gallery: 'GallerySection',
      cta: 'CallToAction',
      heading: 'Heading',
      text: 'TextBlock',
      button: 'Button',
      image: 'Image',
      card: 'Card',
    };
    return names[type] || 'Section';
  };

  const generateNextjsConfig = () => {
    return `// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.pexels.com'],
  },
}

module.exports = nextConfig`;
  };

  const generatePackageJson = () => {
    return `{
  "name": "${currentWebsite?.name.toLowerCase().replace(/\s+/g, '-') || 'my-website'}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0"
  }
}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/editor" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Wesbyte</span>
            </Link>
          </div>

          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Export & Publish</h1>
          <p className="text-muted-foreground mt-2">
            Export your website code or deploy it directly to the web.
          </p>
        </div>

        <Tabs defaultValue="export" className="space-y-8">
          <TabsList>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export Code
            </TabsTrigger>
            <TabsTrigger value="deploy" className="gap-2">
              <Globe className="h-4 w-4" />
              Deploy
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Settings className="h-4 w-4" />
              SEO Settings
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Export Project
                  </CardTitle>
                  <CardDescription>
                    Download your website as a complete Next.js project.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Code className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">React + Next.js</p>
                        <p className="text-xs text-muted-foreground">
                          Production-ready Next.js 14 code
                        </p>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Shield className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">TypeScript</p>
                        <p className="text-xs text-muted-foreground">
                          Full type safety included
                        </p>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Zap className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Optimized</p>
                        <p className="text-xs text-muted-foreground">
                          Already configured for best performance
                        </p>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>Exporting...</>
                    ) : exported ? (
                      <>
                        <Check className="h-4 w-4" />
                        Exported Successfully
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download ZIP
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Code Preview */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Code Preview
                  </CardTitle>
                  <CardDescription>
                    Preview the generated React code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted overflow-auto text-xs h-[300px]">
                      <code>{generateReactCode()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopyCode(generateReactCode())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Files */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Included Files</CardTitle>
                <CardDescription>
                  Everything you need to run your website locally or deploy to any hosting platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      package.json
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      next.config.js
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      tsconfig.json
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      tailwind.config.js
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      app/page.tsx
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      app/layout.tsx
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      app/globals.css
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      components/**/*.tsx
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      /app
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      /components
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      /lib
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      /public
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deploy Tab */}
          <TabsContent value="deploy">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Deploy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    One-Click Deploy
                  </CardTitle>
                  <CardDescription>
                    Deploy your website instantly with our hosting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">Your URL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`https://${currentWebsite?.slug || 'my-site'}.aibuilder.app`}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button size="icon" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    <Globe className="h-4 w-4" />
                    Deploy Now
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Free SSL certificate included
                  </p>
                </CardContent>
              </Card>

              {/* Custom Domain */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Custom Domain
                  </CardTitle>
                  <CardDescription>
                    Connect your own domain name.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Domain Name</Label>
                    <Input
                      placeholder="yourdomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your domain without https://
                    </p>
                  </div>

                  <Button className="w-full" variant="outline">
                    Add Custom Domain
                  </Button>

                  {customDomain && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-xs font-medium">DNS Records to add:</p>
                      <code className="text-xs block">
                        A Record: 76.76.21.21
                        <br />
                        CNAME: cname.aibuilder.app
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Deploy Platforms */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Deploy Elsewhere</CardTitle>
                <CardDescription>
                  Export and deploy to your favorite platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {['Vercel', 'Netlify', 'AWS', 'Cloudflare'].map((platform) => (
                    <button
                      key={platform}
                      className="p-4 rounded-lg border hover:bg-muted transition-colors text-center"
                    >
                      <p className="font-medium">{platform}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        One-click deploy
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Meta Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Meta Tags</CardTitle>
                  <CardDescription>
                    Optimize how your website appears in search results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Your Page Title"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 50-60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <textarea
                      className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Describe your website..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 150-160 characters
                    </p>
                  </div>

                  <Button className="w-full">Save Meta Tags</Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Preview</CardTitle>
                  <CardDescription>
                    How your page will appear in Google.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg border">
                    <div className="text-blue-600 text-lg mb-1">
                      {metaTitle || 'Your Page Title'}
                    </div>
                    <div className="text-green-700 text-sm mb-2">
                      {currentWebsite?.slug || 'yoursite'}.aibuilder.app
                    </div>
                    <div className="text-gray-600 text-sm">
                      {metaDescription || 'Your meta description will appear here...'}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Title Length</span>
                      <span className={metaTitle.length > 60 ? 'text-orange-500' : 'text-green-500'}>
                        {metaTitle.length}/60
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Description Length</span>
                      <span className={metaDescription.length > 160 ? 'text-orange-500' : 'text-green-500'}>
                        {metaDescription.length}/160
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Preview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>
                  How your website appears when shared on social media.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Twitter Card */}
                  <div>
                    <p className="text-sm font-medium mb-2">Twitter Card</p>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="aspect-video bg-muted" />
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          aibuilder.app
                        </div>
                        <div className="font-medium mb-1">
                          {metaTitle || 'Your Page Title'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {metaDescription || 'Your description...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facebook Card */}
                  <div>
                    <p className="text-sm font-medium mb-2">Facebook Share</p>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="aspect-video bg-muted" />
                      <div className="p-3 bg-muted">
                        <div className="text-xs text-muted-foreground mb-1">
                          aibuilder.app
                        </div>
                        <div className="font-medium">
                          {metaTitle || 'Your Page Title'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
