import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";
import { ConditionalFooter } from "./_components/ConditionalFooter";
import { AgeGate } from "./_components/AgeGate";
import { FloatingContactButtons } from "./_components/FloatingContactButtons";
import { WebVitalsClient } from "./_components/WebVitalsClient";
import { ChatWidgetClient } from "./support/_components/ChatWidgetClient";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Beautyhabesha",
    template: "%s • Beautyhabesha",
  },
  description:
    "Membership platform for premium escort profiles with verified listings.",
  keywords: ["escort", "membership", "premium", "VIP", "Platinum", "profiles"],
  openGraph: {
    title: "Beautyhabesha",
    description:
      "Discover premium escort profiles with VIP and Platinum visibility.",
    type: "website",
    siteName: "Beautyhabesha",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beautyhabesha",
    description:
      "Discover premium escort profiles with VIP and Platinum visibility.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black antialiased text-white`}
      >
        <WebVitalsClient />
        <AgeGate>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-screen min-w-0 flex-col">
            <SiteHeader />
            <main id="main-content" className="min-h-0 min-w-0 flex-1" tabIndex={-1}>
              {children}
            </main>
            <ConditionalFooter />
            <FloatingContactButtons />
            <ChatWidgetClient />
          </div>
        </AgeGate>
      </body>
    </html>
  );
}
