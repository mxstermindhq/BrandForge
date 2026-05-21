import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { COMPANY_PRODUCT_BLURB, TERMS_LAST_UPDATED, termsSections } from "@/content/legal-copy";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the BrandForge curated operator directory.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated={TERMS_LAST_UPDATED}
      intro={COMPANY_PRODUCT_BLURB}
      sections={termsSections}
    />
  );
}
