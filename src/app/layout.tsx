import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "AVIVA Worship - Cancionero Digital",
  description: "Cancionero digital para músicos de AVIVA Worship. Encuentra letras, acordes y tonalidades de tus canciones favoritas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <Header />
            <main className="min-h-screen pt-16 pb-20 md:pb-6">
              {children}
            </main>
            <BottomNav />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
