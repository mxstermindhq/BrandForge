import { ForgePage } from "@/components/forge/ForgePage";

type Section = { heading: string; body: string[] };

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: Section[];
};

export function LegalDocument({ title, lastUpdated, intro, sections }: LegalDocumentProps) {
  return (
    <ForgePage title={title} eyebrow={`Updated ${lastUpdated}`} description={intro} narrow>
      <div className="forge-prose">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </ForgePage>
  );
}
