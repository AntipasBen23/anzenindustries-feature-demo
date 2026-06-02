import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactorProvider } from '@/contexts/ReactorContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tera — Reactor Intelligence',
  description: 'Real-time enzyme reactor monitoring and AI-powered optimization for cell-free biomanufacturing',
  keywords: ['enzyme reactor', 'biomanufacturing', 'process monitoring', 'AI optimization'],
  authors: [{ name: 'Tera' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen">
        <ReactorProvider>
          {children}
        </ReactorProvider>
      </body>
    </html>
  );
}
