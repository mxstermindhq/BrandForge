import Link from "next/link";
import { CopyButton } from "@/components/content/CopyButton";
import { CTASection, FAQBlock, InlineCTA, PageHero } from "@/components/content";
import type { RoadmapStage } from "@/content/roadmap/stages";

type RoadmapStageTemplateProps = {
  stage: RoadmapStage;
};

export function RoadmapStageTemplate({ stage }: RoadmapStageTemplateProps): React.JSX.Element {
  const checklistText = stage.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n");

  return (
    <>
      <PageHero
        eyebrow={`Stage ${stage.stage}`}
        title={stage.title}
        subhead={stage.overview}
      />

      <section className="py-12">
        <div className="content-wrap max-w-3xl space-y-6">
          {stage.body.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="border-y border-b1 bg-s1 py-14">
        <div className="content-wrap grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Before you enter
            </h2>
            <ul className="mt-4 space-y-2">
              {stage.prerequisites.map((item) => (
                <li key={item} className="text-sm text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Five common mistakes
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-4 text-sm text-text-secondary">
              {stage.mistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="content-wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              Checklist
            </h2>
            <CopyButton text={checklistText} label="Copy checklist" />
          </div>
          <ul className="mt-6 space-y-2">
            {stage.checklist.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-accent-bright" aria-hidden>
                  □
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <InlineCTA
        headline="Ready to move to the next stage?"
        subhead="Copy the checklist, then DM us on Discord or Telegram with your stage and niche."
      />

      <section className="py-8">
        <div className="content-wrap max-w-3xl">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Success looks like
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{stage.success}</p>
          <div className="mt-8 flex flex-wrap gap-4 font-mono text-[10px]">
            {stage.nextSlug ? (
              <Link href={`/roadmap/${stage.nextSlug}/`} className="text-accent-bright hover:text-text">
                {stage.nextLabel ?? "Next stage →"}
              </Link>
            ) : null}
            <Link href={stage.serviceHref} className="text-muted hover:text-text">
              {stage.serviceLabel}
            </Link>
          </div>
        </div>
      </section>

      <FAQBlock items={stage.faqs} pageSlug={`/roadmap/${stage.slug}/`} title={`Stage ${stage.stage} FAQ`} />
      <CTASection
        title="Stuck on this stage?"
        subhead="Discord or Telegram — we map you to a package or quote in 24 hours."
        campaign={`roadmap-${stage.slug}-cta`}
      />
    </>
  );
}
