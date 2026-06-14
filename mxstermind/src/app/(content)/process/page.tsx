import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { PROCESS_FAQ, PROCESS_STEPS } from "@/content/hubs/process-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Process — How the Founder OS Works | mxstermind",
  description:
    "Apply, fit review, OS scope, build, handoff — mxstermind process for Founder Operating System access.",
  path: "/process/",
});

export default function ProcessPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Process", href: "/process/" },
      ]}
      path="/process/"
      faqs={PROCESS_FAQ}
    >
      <PageHero
        eyebrow="Process"
        title="Selective intake, fixed scope, clean handoff"
        subhead="No account managers. Named contributors. Milestones you can verify before payment release."
      />
      <section className="py-12">
        <div className="content-wrap space-y-8">
          {PROCESS_STEPS.map((step) => (
            <div key={step.step} className="border-b border-b1 pb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">{step.step}</p>
              <h2 className="mt-2 font-serif text-2xl font-light">{step.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
      <FAQBlock items={PROCESS_FAQ} />
      <CTASection title="Ready to apply?" subhead="Discord or Telegram — outcome, deadline, budget band." />
    </PageShell>
  );
}
