"use client";

import { CONTACT, contactMessage } from "@/content/landing-directory";

const REQUESTS = [
  {
    title: "Senior design partner for SaaS onboarding",
    category: "Branding",
    budget: "€2K-€5K",
    timeline: "2-3 weeks",
  },
  {
    title: "n8n + CRM + WhatsApp automation",
    category: "AI & Automation",
    budget: "€800-€2.5K",
    timeline: "5-10 days",
  },
  {
    title: "UGC editor, 20 assets/month",
    category: "Video",
    budget: "€1.2K-€3K/mo",
    timeline: "Monthly",
  },
];

export function TargetedRequests() {
  return (
    <section id="requests" className="border-t border-[#C9A84C]/20 bg-[#0B1326] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-[#C9A84C]">Requests Board</p>
          <h2 className="font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">
            Serious clients. Real budgets. No tyre-kickers.
          </h2>
          <p className="mt-3 text-[#C9BEAA]">Every brief has been reviewed by mxstermind before posting.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REQUESTS.map((request) => (
            <article key={request.title} className="rounded-2xl border border-[#C9A84C]/20 bg-[#0F172B] p-5">
              <p className="mb-2 inline-flex rounded-full border border-[#C9A84C]/30 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#C9A84C]">
                {request.category}
              </p>
              <h3 className="font-headline text-xl font-semibold text-[#F5F0E8]">{request.title}</h3>
              <p className="mt-2 text-sm text-[#C9BEAA]">
                Budget: {request.budget} · Timeline: {request.timeline}
              </p>
              <a
                href={contactMessage(`Interest in request: ${request.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-5 min-h-10 w-full justify-center text-sm"
              >
                Submit interest →
              </a>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs text-[#C9BEAA]">
          Request routing, qualification, and introductions managed personally by {CONTACT.guarantor}. No cold inbox, no chaos.
        </p>
      </div>
    </section>
  );
}
