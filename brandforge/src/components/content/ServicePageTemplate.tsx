import Link from "next/link";
import { CTASection, FAQBlock, InlineCTA, PageHero } from "@/components/content";
import type { ServiceDetail } from "@/types/service-page";

type ServicePageTemplateProps = {
  service: ServiceDetail;
};

/** Renders a full service deep-dive page body (used inside PageShell). */
export function ServicePageTemplate({ service }: ServicePageTemplateProps): React.JSX.Element {
  return (
    <>
      <PageHero
        eyebrow={service.hero.eyebrow}
        title={service.hero.title}
        subhead={service.hero.subhead}
      />

      <section className="py-12">
        <div className="content-wrap max-w-3xl space-y-6">
          {service.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-text-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-14">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Who this is for
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {service.icp.map((item) => (
              <li
                key={item}
                className="rounded-md border border-b1 bg-bg p-4 text-sm text-text-secondary"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InlineCTA
        headline={`Need ${service.hero.eyebrow}?`}
        subhead="Discord or Telegram — fixed quote in 24 hours. Name this service in your DM."
      />

      <section className="py-14">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">What you get</h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {service.included.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-accent-bright" aria-hidden>
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-b1 py-14">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {service.process.map((step, index) => (
              <li key={step.title} className="rounded-md border border-b1 bg-s1 p-6">
                <p className="font-mono text-[10px] text-accent-bright">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">Relevant work</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {service.portfolio.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md border border-b1 bg-s1 p-5 hover:border-[var(--a-mid)]"
                data-cursor="hover"
              >
                <h3 className="font-bold text-accent-bright">{item.label}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-b1 bg-s2 py-14">
        <div className="content-wrap flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold">Pricing</h2>
            <p className="mt-2 font-mono text-2xl font-bold text-accent-bright">{service.pricing.range}</p>
            <p className="mt-2 max-w-xl text-sm text-text-secondary">{service.pricing.note}</p>
          </div>
          <p className="font-mono text-[10px] text-muted">
            See also:{" "}
            <Link href="/packages/" className="text-accent-bright hover:text-text">
              packages
            </Link>
          </p>
        </div>
      </section>

      {service.blogLinks.length > 0 ? (
        <section className="py-12">
          <div className="content-wrap">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Related reading</h2>
            <ul className="mt-4 space-y-2">
              {service.blogLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-bright hover:text-text">
                    {link.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <FAQBlock items={service.faqs} />
      <CTASection
        title="Get a fixed quote in 24 hours"
        subhead="Send scope on Discord or Telegram — BrandForge replies with USD pricing, not a ballpark."
      />
    </>
  );
}
