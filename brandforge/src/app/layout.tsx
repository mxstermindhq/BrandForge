import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SITE } from "@/config/site";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-grotesk",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-face",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "BrandForge — Design, Development & Growth Packages",
    template: "%s · BrandForge",
  },
  description:
    "Design, development, and growth packages for digital founders and operators. Fixed USD pricing. Quote in 24 hours. Escrow and crypto accepted.",
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "BrandForge",
    title: "BrandForge — Design, Dev & Growth Packages",
    description:
      "One team for brand, website, and growth. Fixed USD packages. Quote in 24 hours.",
    images: [{ url: "/img/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — Design, Dev & Growth Packages",
    description:
      "One team for brand, website, and growth. Fixed USD packages. Quote in 24 hours.",
    images: ["/img/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "BrandForge Blog RSS" }],
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  colorScheme: "dark",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body className="bg-bg text-text antialiased">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
