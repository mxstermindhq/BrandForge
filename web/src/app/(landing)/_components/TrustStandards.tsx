"use client";

const STANDARDS = [
  {
    title: "Verified-only directory",
    body: "Visibility is for whitelisted professionals with proven execution in startup, tech, and design.",
  },
  {
    title: "No pay-to-rank behavior",
    body: "Profiles are not boosted by ad spend. Discovery prioritizes fit, clarity, and delivery quality.",
  },
  {
    title: "Specific scope first",
    body: "Services and requests must be explicit. Ambiguous briefs are refined before introductions.",
  },
  {
    title: "Human trust layer",
    body: "Conversations start with mxstermind to reduce risk and protect both clients and operators.",
  },
];

export function TrustStandards() {
  return (
    <section id="trust" className="border-t border-outline-variant bg-surface-container-lowest px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="section-label">Trust Standards</p>
          <h2 className="font-headline text-3xl font-bold text-on-surface sm:text-4xl">
            Built on fairness, clarity, and accountable introductions
          </h2>
          <p className="mt-3 text-on-surface-variant">
            Brandforge applies principled commerce standards designed for long-term trust, transparent process, and real
            outcomes for all users.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {STANDARDS.map((item) => (
            <article key={item.title} className="rounded-xl border border-outline-variant/60 bg-surface p-5">
              <h3 className="font-headline text-lg font-semibold text-on-surface">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
