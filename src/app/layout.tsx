import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactorProvider } from '@/contexts/ReactorContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('tera-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <ReactorProvider>
            {children}
          </ReactorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
