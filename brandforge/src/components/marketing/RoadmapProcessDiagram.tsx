"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROADMAP_SLUGS, ROADMAP_STAGES } from "@/content/roadmap/stages";
import { CopyButton } from "@/components/content/CopyButton";

const STAGES = ROADMAP_SLUGS.map((slug) => {
  const s = ROADMAP_STAGES[slug]!;
  return { slug, stage: s.stage, title: s.title, checklist: s.checklist };
});

/** Interactive validate → design → deliver → support diagram. */
export function RoadmapProcessDiagram(): React.JSX.Element {
  const params = useSearchParams();
  const activeSlug = params.get("stage") ?? STAGES[0]!.slug;
  const active = STAGES.find((s) => s.slug === activeSlug) ?? STAGES[0]!;
  const checklistText = active.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n");

  return (
    <section className="border-y border-b1 bg-s1 py-12">
      <div className="content-wrap">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
          Process map
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Validate → Design → Deliver → Support — click a stage for checklist. You are here:{" "}
          <span className="text-accent-bright">{active.title}</span>
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STAGES.map((s) => {
            const isActive = s.slug === active.slug;
            return (
              <li key={s.slug}>
                <Link
                  href={`/roadmap/?stage=${s.slug}`}
                  className={`block rounded-md border p-4 text-center transition-colors ${
                    isActive ? "border-accent bg-accent/10" : "border-b1 bg-bg hover:border-accent/40"
                  }`}
                >
                  <p className="font-mono text-[9px] text-muted">Stage {s.stage}</p>
                  <p className="mt-1 text-xs font-bold leading-snug">{s.title}</p>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 rounded-md border border-b1 bg-bg p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{active.title} checklist</h3>
            <CopyButton text={checklistText} label="Copy checklist" />
          </div>
          <ul className="mt-4 space-y-2">
            {active.checklist.map((item) => (
              <li key={item} className="text-sm text-text-secondary">
                · {item}
              </li>
            ))}
          </ul>
          <Link
            href={`/roadmap/${active.slug}/`}
            className="mt-4 inline-block font-mono text-[10px] text-accent-bright hover:text-text"
          >
            Open full stage guide →
          </Link>
        </div>
      </div>
    </section>
  );
}
