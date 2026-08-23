import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ThreadLanding } from "./_components/thread/ThreadLanding";
import { websiteJsonLd } from "@/lib/json-ld";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--t-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "BrandForge — Client work, done in one thread",
  description:
    "The conversation, the money, the plan and an AI copilot — everything a client project needs lives in a single chat. Escrow-held payouts, live milestones, and @AI drafts. No invoices, no status meetings.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — Client work, done in one thread",
    description:
      "Escrow, milestones and an AI copilot — all inside the client chat.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BrandForge" }],
  },
};

export default function LandingPage() {
  const jsonLd = {
    ...websiteJsonLd(),
    description: "Chat-first client workspace with escrow, milestones and an AI copilot.",
  };

  return (
    <div className={bricolage.variable}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ThreadLanding />
    </div>
  );
}
