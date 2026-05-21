import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { COMPANY_PRODUCT_BLURB, PRIVACY_LAST_UPDATED, privacySections } from "@/content/legal-copy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BrandForge handles data on the curated operator directory.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={PRIVACY_LAST_UPDATED}
      intro={COMPANY_PRODUCT_BLURB}
      sections={privacySections}
    />
  );
}
