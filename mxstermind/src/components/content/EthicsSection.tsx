import type { EthicsSectionData } from "@/types/content";

type EthicsSectionProps = {
  sections: readonly EthicsSectionData[];
};

/** Six-part ethics block — identical structure, tone set by page copy. */
export function EthicsSection({ sections }: EthicsSectionProps): React.JSX.Element {
  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 id={`${section.id}-title`} className="mt-2 text-xl font-bold">
            {section.title}
          </h2>
          <div className="mt-4 space-y-3">
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-text-secondary">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
