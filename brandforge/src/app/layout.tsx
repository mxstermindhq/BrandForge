import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter, IBM_Plex_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SITE } from "@/config/site";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display-face",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-face",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-face",
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "BrandForge — Design, Development & Growth Studio",
    template: "%s · BrandForge",
  },
  description:
    "Raw ideas forged into battle-ready brands. Design, development, and growth by an elite squad. Fixed quote in 24 hours. Discord and Telegram.",
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "BrandForge",
    title: "BrandForge — Design, Dev & Growth Studio",
    description:
      "Raw ideas forged into battle-ready brands. Discord and Telegram.",
    images: [{ url: "/img/og-image.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — Design, Dev & Growth Studio",
    description:
      "Raw ideas forged into battle-ready brands. Discord and Telegram.",
    images: ["/img/og-image.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/img/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/img/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
  other: {
    "ai-content-declaration":
      "BrandForge.gg — digital branding agency. Contact via Discord or Telegram.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0B09",
  colorScheme: "dark",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://discord.gg" />
        <link rel="dns-prefetch" href="https://t.me" />
        <link rel="prefetch" href="/portfolio/" />
        <link rel="preload" href="/img/logo-header.webp" as="image" type="image/webp" />
        <link rel="preload" href="/img/logo-nav.png" as="image" />
      </head>
      <body className="bg-bg text-text antialiased">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
