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
          {/* Main Application Container */}
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
              <div className="container-responsive">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L2 7L12 12L22 7L12 2Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 17L12 22L22 17"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 12L12 17L22 12"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-black">Anzen Industries</h1>
                      <p className="text-xs text-gray-600">Reactor Intelligence Platform</p>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-black rounded-full pulse-indicator"></div>
                      <span className="text-sm font-medium text-black">Live</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-white">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white mt-auto">
              <div className="container-responsive py-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-black">Anzen Industries</span>
                    <span className="mx-2">•</span>
                    <span>California Facility</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Platform v1.0.0</span>
                    <span>•</span>
                    <span>© {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ReactorProvider>
      </body>
    </html>
  );
}