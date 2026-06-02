import type { Metadata } from "next";
import { BrandGuideClient } from "@/app/(content)/brand-guide/BrandGuideClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Brand Guide — Tokens & Copy | BrandForge",
  description:
    "Colours, typography, voice guide, and one-click copy templates for BrandForge operators.",
  path: "/brand-guide/",
});

export default function BrandGuidePage(): React.JSX.Element {
  return <BrandGuideClient />;
}
