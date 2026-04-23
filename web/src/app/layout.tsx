import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthMeProvider } from "@/providers/AuthMeProvider";
import { BootstrapProvider } from "@/providers/BootstrapProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-headline",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: {
    default: "BrandForge — The Professional OS for the AI Era",
    template: "%s · BrandForge",
  },
  description:
    "BrandForge is the marketplace and deal OS where specialists list services, " +
    "buyers post briefs, and negotiations, contracts, and payments stay in one thread.",
  keywords: [
    "professional marketplace",
    "AI era platform",
    "freelance OS",
    "deal rooms",
    "specialist marketplace",
    "contract management",
    "BrandForge",
    "professional services",
    "escrow marketplace",
  ],
  authors: [{ name: "BrandForge" }],
  creator: "BrandForge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — The Professional OS for the AI Era",
    description:
      "One identity, marketplace, and workspace where humans lead and AI accelerates.",
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
    title: "BrandForge — The Professional OS for the AI Era",
    description:
      "One identity, marketplace, and workspace where humans lead and AI accelerates.",
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
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
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
      <body className={`${inter.className}`}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <AuthMeProvider>
              <BootstrapProvider>{children}</BootstrapProvider>
            </AuthMeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
