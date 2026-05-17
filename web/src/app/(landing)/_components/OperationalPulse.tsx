"use client";

import Link from "next/link";
import { LIVE_ACTIVITY, REQUEST_PREVIEW, CONTACT, contactMessage } from "@/content/landing-directory";

const TYPE_LABEL: Record<(typeof LIVE_ACTIVITY)[number]["type"], string> = {
  service: "Service",
  request: "Request",
  match: "Match",
  deal: "Deal",
};

export function OperationalPulse() {
  return (
    <section className="border-y border-outline-variant bg-surface-container-low px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="section-label !mb-1">Live Activity</p>
              <h2 className="font-headline text-2xl font-semibold text-on-surface">Platform feels alive from first visit</h2>
            </div>
            <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              Live
            </span>
          </div>

          <div className="space-y-3">
            {LIVE_ACTIVITY.map((item) => (
              <article
                key={item.id}
                className="group rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {TYPE_LABEL[item.type]}
                    </p>
                    <p className="mt-1 text-sm font-medium text-on-surface">{item.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{item.meta}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-outline-variant px-2 py-0.5 text-[11px] text-on-surface-variant">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/60 bg-surface p-5">
          <p className="section-label !mb-1">Targeted Requests</p>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Work with serious clients only</h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Requests are quality-screened by {CONTACT.guarantor}. No spam briefs, no race-to-bottom bidding.
          </p>

          <ul className="mt-4 space-y-3">
            {REQUEST_PREVIEW.map((req) => (
              <li key={req.id} className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-3">
                <p className="text-sm font-medium text-on-surface">{req.title}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {req.category} · {req.budget} · {req.timeline}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link href="/requests/new" className="btn-secondary min-h-10 justify-center text-sm">
              Submit request
            </Link>
            <a
              href={contactMessage("I want to discuss a project fit")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-h-10 justify-center text-sm"
            >
              Start conversation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
