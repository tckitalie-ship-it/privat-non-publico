import './globals.css';

import type { Metadata } from 'next';

import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'News Platform Association (NPA)',
  description:
    'Piattaforma moderna per la gestione di associazioni, membri, eventi, finanze e comunicazioni.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className="dark"
      suppressHydrationWarning
    >
      <body className="bg-white text-black transition-colors dark:bg-[#0f1117] dark:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>

        <Toaster
          richColors
          position="top-right"
          theme="dark"
        />
      </body>
    </html>
  );
}