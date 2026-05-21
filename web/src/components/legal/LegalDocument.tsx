import Link from "next/link";

type Section = { heading: string; body: string[] };

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: Section[];
};

export function LegalDocument({ title, lastUpdated, intro, sections }: LegalDocumentProps) {
  return (
    <main className="landing-layout min-h-screen px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
          ← Directory
        </Link>
        <h1 className="mt-6 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Last updated: {lastUpdated}</p>
        {intro ? <p className="mt-6 text-base leading-relaxed text-[var(--color-text-secondary)]">{intro}</p> : null}
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
