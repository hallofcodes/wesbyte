import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider.tsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wesbyte - Create Beautiful Websites with AI',
  description: 'Build professional websites instantly with AI. Describe what you want, and our AI creates it. Customize everything visually without coding.',
  openGraph: {
    title: 'AI Website Builder - Create Beautiful Websites with AI',
    description: 'Build professional websites instantly with AI. No coding required.',
    images: [
      {
        url: '/assets/preview/banner.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Website Builder - Create Beautiful Websites with AI',
    description: 'Build professional websites instantly with AI. No coding required.',
    images: [
      {
        url: '/assets/preview/banner.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
