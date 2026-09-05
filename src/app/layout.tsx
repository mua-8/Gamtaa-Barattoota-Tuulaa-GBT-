import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PwaProvider } from "@/components/site/pwa-provider";
import { ORG } from "@/lib/site";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a2318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gbtuulaa.org"),
  title: {
    default: `${ORG.name} — From Education to Service`,
    template: `%s | ${ORG.name}`,
  },
  description: ORG.description,
  keywords: [
    "Gamtaa Barattoota Tuulaa",
    "GBT",
    "student volunteers",
    "community service",
    "free education",
    "mentorship",
    "Oromia",
    "Ethiopia",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: ORG.shortName ?? ORG.name,
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: ORG.name,
    locale: "en_ET",
    title: `${ORG.name} — From Education to Service`,
    description: ORG.description,
    images: [
      {
        url: "/images/hero-students.jpg",
        width: 720,
        height: 405,
        alt: "GBT student volunteers at an outdoor community event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORG.name} — From Education to Service`,
    description: ORG.description,
    images: ["/images/hero-students.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-forest-900 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <PwaProvider />
      </body>
    </html>
  );
}
