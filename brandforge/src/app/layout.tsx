import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { PrefetchLinks } from "@/components/perf/PrefetchLinks";
import { ServiceWorkerRegister } from "@/components/perf/ServiceWorkerRegister";
import { SITE } from "@/config/site";
import "./globals.css";

/** Trim weights — 300 dropped; mono 700 rarely used in UI. */
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-grotesk",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
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
    images: [{ url: "/img/og-image.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — Design, Dev & Growth Packages",
    description:
      "One team for brand, website, and growth. Fixed USD packages. Quote in 24 hours.",
    images: ["/img/og-image.webp"],
  },
  robots: { index: true, follow: true },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "BrandForge Blog RSS" }],
    },
  },
  other: {
    "ai-content-declaration":
      "BrandForge.gg — digital branding agency for Discord, gaming, Web3, forums, and SaaS. Packages from $300. Contact via Discord or Telegram.",
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
      <head>
        <link rel="dns-prefetch" href="https://discord.gg" />
        <link rel="dns-prefetch" href="https://t.me" />
        <link rel="prefetch" href="/packages/" />
        <link rel="prefetch" href="/portfolio/" />
        <link rel="preload" href="/img/logo-header.webp" as="image" type="image/webp" />
      </head>
      <body className="bg-bg text-text antialiased">
        {children}
        <PrefetchLinks />
        <ServiceWorkerRegister />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
