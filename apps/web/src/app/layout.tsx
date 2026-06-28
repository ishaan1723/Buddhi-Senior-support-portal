import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { FixedSosButton } from "@/components/fixed-sos-button";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Buddhi - Senior Support Portal",
  description: "Emergency help, trusted local services, and concierge support for H-West Ward seniors.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf7"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <FixedSosButton />
        <BottomNav />
      </body>
    </html>
  );
}
