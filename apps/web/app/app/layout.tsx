import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Dashboard",
  description: "Gestione Associazione",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
