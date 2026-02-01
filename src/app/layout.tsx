import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { LayoutWrapper } from "@/components/providers/LayoutWrapper";

const archivo = Archivo({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "AVIVA Worship - Cancionero Digital",
  description: "Cancionero digital para músicos de AVIVA Worship. Encuentra letras, acordes y tonalidades de tus canciones favoritas.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AVIVA Worship",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={archivo.variable}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${archivo.className} antialiased bg-aviva-black text-aviva-text`}>
        <SessionProvider>
          <ToastProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
