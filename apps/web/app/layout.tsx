import "./globals.css";

import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "News Platform Association (NPA)",
  description:
    "Piattaforma moderna per la gestione di associazioni, membri, eventi, finanze e comunicazioni.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}