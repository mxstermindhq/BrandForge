"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { talentInitials } from "@/lib/talent-types";

const TALENT = [
  {
    name: "Mxstermind",
    role: "Founder / operator",
    availability: "Available",
    skills: ["n8n", "Next.js", "Growth systems"],
    avatarUrl: null,
  },
  {
    name: "Neil Evans",
    role: "Software engineer",
    availability: "Available",
    skills: ["Next.js", "Supabase", "Architecture"],
    avatarUrl: null,
  },
  {
    name: "Eray Yildiz",
    role: "Product designer",
    availability: "Available",
    skills: ["Figma", "Design systems", "SaaS UX"],
    avatarUrl: null,
  },
  {
    name: "Seb Marlow",
    role: "Data scientist",
    availability: "Available",
    skills: ["Analytics", "ML Ops", "Experimentation"],
    avatarUrl: null,
  },
];

export function TalentDirectory() {
  return (
    <section id="talent" className="scroll-mt-24 border-t border-[#C9A84C]/20 bg-[#0A0F1E] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-[#C9A84C]">Talent Directory Preview</p>
          <h2 className="font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">Meet the operators.</h2>
          <p className="mt-2 text-[#C9BEAA]">Profiles being completed now — first clients in, first matched.</p>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {TALENT.map((person, idx) => (
            <motion.article
              key={person.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="surface-card min-w-[280px] snap-center rounded-2xl border border-[#C9A84C]/20 bg-[#0F172B] p-5 sm:min-w-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {person.avatarUrl ? (
                    <Image src={person.avatarUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-sm font-semibold text-[#F5F0E8]">
                      {talentInitials(person.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-headline text-lg font-semibold text-[#F5F0E8]">{person.name}</h3>
                    <p className="text-xs text-[#C9BEAA]">{person.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#1A6B4A]/50 bg-[#1A6B4A]/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#9FE3C2]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1A6B4A]" />
                  {person.availability}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {person.skills.map((s) => (
                  <span key={s} className="rounded-full border border-[#C9A84C]/25 bg-[#0A0F1E] px-2.5 py-1 text-[11px] text-[#F5F0E8]/90">
                    {s}
                  </span>
                ))}
              </div>

              <a
                href={contactMessage(`Connect me with ${person.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-5 min-h-10 w-full justify-center text-xs"
              >
                Contact via {CONTACT.guarantor}
              </a>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#C9A84C]/30 bg-[#0F172B] px-4 py-3 text-sm text-[#F5F0E8]">
          🔒 Verified-only. No open applications. Curated by {CONTACT.guarantor}.
        </div>
      </div>
    </section>
  );
}
