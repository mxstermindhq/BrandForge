"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  TALENT,
  type TalentCategory,
  type TalentProfile,
} from "@/content/landing-directory";
import { ContactCTA } from "./ContactCTA";

const AVAILABILITY: Record<TalentProfile["availability"], { label: string; className: string }> = {
  available: { label: "Available", className: "bg-success/15 text-success border-success/30" },
  limited: { label: "Limited slots", className: "bg-warning/15 text-warning border-warning/30" },
  waitlist: { label: "Waitlist", className: "bg-on-surface-variant/15 text-on-surface-variant border-outline-variant" },
};

function TalentCard({ person }: { person: TalentProfile }) {
  const avail = AVAILABILITY[person.availability];
  const subject = `Hire ${person.name} — ${person.role}`;

  return (
    <article className="group surface-card flex flex-col overflow-hidden rounded-xl border border-outline-variant/60 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className={`bg-gradient-to-br ${person.accent} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-outline-variant/50 bg-surface/80 font-headline text-sm font-bold text-on-surface backdrop-blur">
              {person.initials}
            </div>
            <div>
              <h3 className="font-headline text-base font-semibold text-on-surface">{person.name}</h3>
              <p className="text-sm font-medium text-primary">{person.role}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${avail.className}`}>
            {avail.label}
          </span>
        </div>
        {person.highlight ? (
          <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{person.highlight}</p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">
            {person.category}
          </span>
          <span className="text-on-surface-variant">{person.yearsExp}+ yrs</span>
          <span className="font-semibold text-on-surface">{person.rateLabel}</span>
        </div>

        <div>
          <p className="section-label !mb-2 !text-[10px]">Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {person.tools.map((t) => (
              <span
                key={t}
                className="rounded border border-outline-variant/60 bg-surface-container-low px-2 py-0.5 text-[11px] text-on-surface-variant"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label !mb-2 !text-[10px]">Preferences</p>
          <div className="flex flex-wrap gap-1.5">
            {person.preferences.map((p) => (
              <span key={p} className="text-[11px] text-on-surface-variant">
                · {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2">
          <ContactCTA subject={subject} label="Contact" variant="secondary" className="w-full [&_a]:flex-1 [&_a]:justify-center" />
        </div>
      </div>
    </article>
  );
}

export function TalentDirectory() {
  const [category, setCategory] = useState<TalentCategory>("All");

  const filtered = useMemo(() => {
    if (category === "All") return TALENT;
    return TALENT.filter((t) => t.category === category);
  }, [category]);

  return (
    <section id="talent" className="scroll-mt-24 border-t border-outline-variant bg-surface-container-lowest px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="section-label">Talent Directory</p>
          <h2 className="font-headline text-3xl font-bold text-on-surface sm:text-4xl">Hire vetted operators</h2>
          <p className="mt-3 text-on-surface-variant">
            Real skills, tools, and experience — ready for ambitious projects and partnerships. Contact any operator
            through Telegram or Discord; {`mxstermind`} coordinates every intro.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                category === cat
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person) => (
            <TalentCard key={person.id} person={person} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-on-surface-variant">No operators in this category yet — check back soon.</p>
        ) : null}
      </div>
    </section>
  );
}
