import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";
import { MXM_POSITIONING } from "@/config/positioning";
import { SITE } from "@/config/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `mxstermind — ${MXM_POSITIONING.title}`,
    template: "%s · mxstermind",
  },
  description: MXM_POSITIONING.shortDescription,
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "mxstermind",
    title: `mxstermind — ${MXM_POSITIONING.title}`,
    description: MXM_POSITIONING.tagline,
    images: [
      {
        url: "/img/og-image.png",
        width: 1200,
        height: 630,
        alt: `mxstermind — ${MXM_POSITIONING.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `mxstermind — ${MXM_POSITIONING.title}`,
    description: MXM_POSITIONING.tagline,
    images: ["/img/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080807",
  colorScheme: "dark",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
