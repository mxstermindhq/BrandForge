import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner application",
  description: "Apply to deploy BrandForge agent infrastructure for your agency clients.",
  robots: { index: false, follow: true },
};

export default function PartnerApplyPage() {
  return (
    <div className="page-root text-on-surface">
      <div className="page-content max-w-xl pb-12">
        <p className="section-label !mb-2">Partners</p>
        <h1 className="page-title">Agency partner program</h1>
        <p className="page-subtitle mt-3">
          We are onboarding a small number of digital agencies to co-design agent templates, pricing, and ROI
          reporting. Tell us about your team and we will follow up.
        </p>
        <ul className="text-on-surface-variant mt-6 list-inside list-disc space-y-2 font-body text-sm">
          <li>Agency name, site, and primary service category</li>
          <li>Rough client count and tools stack (CMS, ads, CRM)</li>
          <li>One agent workflow you would sell first</li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:partners@brandforge.gg?subject=BrandForge%20agency%20partner" className="btn-primary min-h-11 px-5">
            Email partners@brandforge.gg
          </a>
          <Link href="/agents/marketplace" className="btn-secondary min-h-11 px-5">
            Browse marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
