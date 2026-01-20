import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactorProvider } from '@/contexts/ReactorContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Anzen Industries - Reactor Monitoring Platform',
  description: 'Real-time enzyme reactor monitoring and AI-powered optimization for cell-free biomanufacturing',
  keywords: ['enzyme reactor', 'biomanufacturing', 'process monitoring', 'AI optimization'],
  authors: [{ name: 'Anzen Industries' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-white text-black min-h-screen">
        <ReactorProvider>
          {children}
        </ReactorProvider>
      </body>
    </html>
  );
}