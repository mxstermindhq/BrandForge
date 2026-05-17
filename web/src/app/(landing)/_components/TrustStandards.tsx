"use client";

const STANDARDS = [
  {
    title: "Verified-only directory",
    body: "Whitelisted people with execution proof in startup, tech, and design.",
  },
  {
    title: "No pay-to-rank behavior",
    body: "Discovery is merit-based. Visibility is never bought through ads or placement fees.",
  },
  {
    title: "Specific scope first",
    body: "Services and requests must be explicit before intros. No vague briefs, no confusion.",
  },
  {
    title: "Human trust layer",
    body: "mxstermind mediates first contact to protect both client and operator outcomes.",
  },
];

export function TrustStandards() {
  return (
    <section id="trust" className="border-t border-[#C9A84C]/20 bg-[#0A0F1E] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-[#C9A84C]">Trust Standards</p>
          <h2 className="font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">
            Built on Amanah, Adl, and precise execution
          </h2>
          <p className="mt-3 text-[#C9BEAA]">
            These aren't marketing words. They're the operating standards every operator and client is held to.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STANDARDS.map((item) => (
            <article key={item.title} className="rounded-xl border border-[#C9A84C]/22 bg-[#0F172B] p-5">
              <svg viewBox="0 0 24 24" className="mb-3 h-6 w-6 text-[#C9A84C]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l2.8 5.6L21 10l-4.5 4.1 1 6.4L12 17.5 6.5 20.5l1-6.4L3 10l6.2-2.4L12 2z" />
              </svg>
              <h3 className="font-headline text-xl font-semibold text-[#F5F0E8]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#C9BEAA]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
