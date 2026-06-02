import Link from "next/link";
import { CopyButton } from "@/components/content/CopyButton";
import type { RoadmapStepData } from "@/types/content";

type RoadmapStepProps = {
  step: RoadmapStepData;
};

export function RoadmapStep({ step }: RoadmapStepProps): React.JSX.Element {
  const checklistText = step.checklist.map((item, i) => `${i + 1}. ${item}`).join("\n");

  return (
    <article className="rounded-md border border-b1 bg-s1 p-6 lg:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
        Stage {String(step.stage).padStart(2, "0")}
      </p>
      <h2 className="mt-3 text-2xl font-bold">{step.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">{step.summary}</p>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Checklist</h3>
          <CopyButton text={checklistText} label="Copy checklist" />
        </div>
        <ul className="mt-3 space-y-2">
          {step.checklist.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-text-secondary">
              <span className="text-accent-bright" aria-hidden>
                □
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 font-mono text-[10px]">
        {step.nextHref ? (
          <Link href={step.nextHref} className="text-accent-bright hover:text-text" data-cursor="hover">
            {step.nextLabel ?? "Next stage →"}
          </Link>
        ) : null}
        {step.serviceHref ? (
          <Link href={step.serviceHref} className="text-muted hover:text-text" data-cursor="hover">
            {step.serviceLabel ?? "Relevant service →"}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
