"use client";

const faqs = [
  {
    q: "Is there a free tier?",
    a: "Yes. Free includes public profiles (when enabled), marketplace listings, messaging, projects, and credits as implemented — see the Free column on this page.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades apply once Stripe Customer/Checkout is connected; until then, use Free and settings for account changes.",
  },
  {
    q: "Do you offer annual billing?",
    a: "The toggle shows annual pricing for presentation. Checkout will mirror monthly vs annual when billing ships.",
  },
  {
    q: "What payment methods are supported?",
    a: "The API supports Stripe, optional manual crypto treasury, and optional NOWPayments hosted invoices when env keys are set. Request owners can review proposals on each brief and start checkout from there.",
  },
  {
    q: "Is there a trial?",
    a: "The Free tier is the trial: no card required for core marketplace use. Time-boxed trials can layer on paid SKUs later.",
  },
];

export function PlansFaq() {
  return (
    <section aria-labelledby="faq-heading" className="mt-20 border-t border-outline-variant/20 pt-12">
      <h2 id="faq-heading" className="font-display text-on-surface text-xl font-semibold tracking-tight">
        FAQ
      </h2>
      <div className="mt-6 divide-y divide-outline-variant/15">
        {faqs.map((item) => (
          <details key={item.q} className="group py-1">
            <summary className="font-headline text-on-surface hover:text-secondary cursor-pointer list-none py-4 text-sm font-semibold tracking-tight transition-all duration-300 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span className="material-symbols-outlined text-secondary shrink-0 text-lg transition-transform duration-300 group-open:rotate-180">
                  expand_more
                </span>
              </span>
            </summary>
            <p className="text-on-surface-variant pb-4 pl-0 text-sm font-light leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
