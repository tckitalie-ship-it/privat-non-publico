import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Association SaaS',
  description: 'Modern association platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white text-black transition-colors dark:bg-[#0f1117] dark:text-white`}
      >
        <ThemeProvider>{children}</ThemeProvider>

        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}