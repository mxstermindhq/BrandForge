import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/tokens.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthMeProvider } from "@/providers/AuthMeProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: {
    default: "BrandForge — Curated AI-Native Operators",
    template: "%s · BrandForge",
  },
  description:
    "A verified directory of elite builders, designers, and growth operators. " +
    "One conversation with mxstermind — scoped, trusted, no marketplace noise.",
  keywords: [
    "curated talent directory",
    "AI-native operators",
    "startup builders",
    "growth operators",
    "BrandForge",
    "verified operators",
  ],
  authors: [{ name: "BrandForge" }],
  creator: "BrandForge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — Curated AI-Native Operators",
    description:
      "Browse verified operators, services, and work. Start one conversation — mxstermind coordinates fit.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrandForge — Professional OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — Curated AI-Native Operators",
    description:
      "Browse verified operators, services, and work. Start one conversation — mxstermind coordinates fit.",
    images: ["/og-image.png"],
    creator: "@brandforge",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* FOUC Prevention - Set theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const saved = localStorage.getItem('brandforge-theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                let theme = saved || 'light';
                let resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
                document.documentElement.classList.add(resolved);
              })();
            `,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className={bodyFont.className}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <AuthMeProvider>
              {children}
            </AuthMeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
