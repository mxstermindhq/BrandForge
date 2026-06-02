import Link from "next/link";
import { CTASection, FAQBlock } from "@/components/content";
import type { DevPageDetail } from "@/types/dev-page";

type DevPageTemplateProps = {
  page: DevPageDetail;
};

export function DevPageTemplate({ page }: DevPageTemplateProps): React.JSX.Element {
  return (
    <>
      <section className="py-12">
        <div className="content-wrap grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-serif text-xl font-light">Overview</h2>
              <div className="mt-4 space-y-3">
                {page.overview.map((p) => (
                  <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-serif text-xl font-light">Technologies & reasoning</h2>
              <ul className="mt-4 space-y-4">
                {page.technologies.map((tech) => (
                  <li key={tech.name} className="rounded-sm border border-b1 bg-s1 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">{tech.name}</p>
                    <p className="mt-2 text-sm text-text-secondary">{tech.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-xl font-light">Technical decisions</h2>
              <div className="mt-4 space-y-4">
                {page.decisions.map((d) => (
                  <div key={d.title}>
                    <h3 className="text-sm font-semibold text-text">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{d.body}</p>
                  </div>
                ))}
              </div>
            </div>
            {page.codeSnippet ? (
              <div>
                <h2 className="font-serif text-xl font-light">Architecture note</h2>
                <pre className="mt-4 overflow-x-auto rounded-sm border border-b1 bg-s2 p-4 font-mono text-[11px] leading-relaxed text-text-secondary">
                  {page.codeSnippet}
                </pre>
              </div>
            ) : null}
          </div>
          <aside className="space-y-6">
            <div className="rounded-sm border border-b1 bg-s1 p-6">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted">Delivered example</p>
              <p className="mt-2 font-serif text-lg font-light">{page.projectExample.name}</p>
              <p className="mt-2 text-sm text-text-secondary">{page.projectExample.summary}</p>
              <Link href={page.projectExample.href} className="mt-4 inline-block font-mono text-[10px] text-accent-bright hover:text-text">
                View case study →
              </Link>
            </div>
            <div className="rounded-sm border border-b1 bg-s1 p-6">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted">Commercial benefit</p>
              <ul className="mt-3 space-y-2">
                {page.commercialBenefit.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-accent-bright">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
      <FAQBlock items={page.faqs} />
      <CTASection
        title="Discuss this capability on your build"
        subhead="Apply with your stack, deadline, and outcome — we reply within 24 hours."
      />
    </>
  );
}
