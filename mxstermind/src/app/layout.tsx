import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";
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
    default: "mxstermind — Bespoke Design, Engineering & Growth",
    template: "%s · mxstermind",
  },
  description:
    "Selective studio for established businesses and serious founders. Custom scope — brand, product, Web3, automation. Apply on Discord or Telegram.",
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "mxstermind",
    title: "mxstermind — Bespoke Studio",
    description:
      "No packages. No templates. Outcome-led design, engineering, and growth for scaling companies.",
    images: [{ url: "/img/og-image.png", width: 1200, height: 630, alt: "mxstermind — bespoke studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "mxstermind — Bespoke Studio",
    description:
      "Selective engagements for established businesses. Custom scope only.",
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
