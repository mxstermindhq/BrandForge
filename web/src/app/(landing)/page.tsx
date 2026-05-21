import type { Metadata } from "next";
import { ForgeLanding } from "./_components/forge/ForgeLanding";
import { getLandingOperators } from "@/lib/operators.server";
import { websiteJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "BrandForge — Forge Anything Digital",
  description:
    "The forge for digital products, services, and talent. AI systems, Discord growth, brands, dev, content — built for online communities.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — Forge Anything Digital",
    description: "Amazon for digital services and products. Enter the stellar furnace.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BrandForge" }],
  },
};

export default async function LandingPage() {
  const operators = await getLandingOperators();
  const jsonLd = {
    ...websiteJsonLd(),
    description: "Digital products, services, and talent marketplace for online communities.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ForgeLanding operators={operators} />
    </>
  );
}
