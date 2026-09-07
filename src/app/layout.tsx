import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PwaProvider } from "@/components/site/pwa-provider";
import { ORG, SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gamtaa Barattoota Tuulaa (GBT) | From Education to Service",
    template: `%s | Gamtaa Barattoota Tuulaa (GBT)`,
  },
  description:
    "Gamtaa Barattoota Tuulaa (GBT) unites university students to empower communities through education, mentorship, digital literacy, and volunteer service in Tuulaa Town, Eastern Hararghe, Oromia, Ethiopia.",
  keywords: [
    "Gamtaa Barattoota Tuulaa",
    "GBT",
    "Tuulaa",
    "student volunteers",
    "community service",
    "education",
    "student mentorship",
    "Oromia",
    "Ethiopia",
    "free summer education",
    "digital literacy",
    "Kombolcha",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GBT",
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
    siteName: "Gamtaa Barattoota Tuulaa (GBT)",
    locale: "en_ET",
    url: SITE_URL,
    title: "Gamtaa Barattoota Tuulaa (GBT) | From Education to Service",
    description:
      "Gamtaa Barattoota Tuulaa (GBT) unites university students to empower communities through free education, mentorship, digital literacy, and community service in Tuulaa Town, Eastern Hararghe, Ethiopia.",
    images: [
      {
        url: `${SITE_URL}/images/hero-students.jpg`,
        width: 1200,
        height: 630,
        alt: "Gamtaa Barattoota Tuulaa (GBT) student volunteers at an outdoor community event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamtaa Barattoota Tuulaa (GBT) | From Education to Service",
    description:
      "Gamtaa Barattoota Tuulaa (GBT) unites university students to empower communities through free education, mentorship, digital literacy, and community service in Tuulaa Town, Eastern Hararghe, Ethiopia.",
    images: [`${SITE_URL}/images/hero-students.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["NGO", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: "Gamtaa Barattoota Tuulaa",
      alternateName: ["GBT", "Tuulaa Student Association"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/images/hero-students.jpg`,
      description:
        "Gamtaa Barattoota Tuulaa (GBT) brings university students together to transform the opportunities they receive into meaningful service for their communities in Tuulaa Town, Eastern Hararghe, Ethiopia.",
      foundingDate: "2021",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tuulaa Town",
        addressLocality: "Kombolcha City",
        addressRegion: "Eastern Hararghe, Oromia",
        addressCountry: "ET",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: ORG.phone,
        contactType: "general inquiries",
        email: ORG.email,
        areaServed: "ET",
        availableLanguage: ["Oromo", "Amharic", "English"],
      },
      sameAs: [
        "https://facebook.com",
        "https://instagram.com",
        "https://linkedin.com",
        "https://t.me",
        "https://youtube.com",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Gamtaa Barattoota Tuulaa (GBT)",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
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
