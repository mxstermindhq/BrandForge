"use client";

import { motion } from "framer-motion";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { talentInitials } from "@/lib/talent-types";

const TALENT = [
  {
    name: "Mxstermind",
    role: "Founder / operator",
    availability: "Available now",
    skills: ["n8n", "Next.js", "Growth systems"],
    pricing: "Fixed package / starts from €497",
    amanah: 98,
    completion: 97,
    nicheYears: "6 years in niche",
    badges: ["Verified identity", "Transparent scope", "Shariah-ready contracts"],
    span: "lg:col-span-6",
  },
  {
    name: "Neil Evans",
    role: "Software engineer",
    availability: "Available",
    skills: ["Next.js", "Supabase", "Architecture"],
    pricing: "Starts from €1,200",
    amanah: 94,
    completion: 95,
    nicheYears: "4 years in niche",
    badges: ["Verified delivery history", "No hidden fees"],
    span: "lg:col-span-3",
  },
  {
    name: "Eray Yildiz",
    role: "Product designer",
    availability: "Available",
    skills: ["Figma", "Design systems", "SaaS UX"],
    pricing: "Fixed package / starts from €900",
    amanah: 96,
    completion: 93,
    nicheYears: "5 years in niche",
    badges: ["UX certification verified", "Milestone-first workflow"],
    span: "lg:col-span-3",
  },
  {
    name: "Seb Marlow",
    role: "Data scientist",
    availability: "Available",
    skills: ["Analytics", "ML Ops", "Experimentation"],
    pricing: "Starts from €1,500",
    amanah: 92,
    completion: 94,
    nicheYears: "3 years in niche",
    badges: ["Peer-vetted portfolio", "Clear deliverables policy"],
    span: "lg:col-span-4",
  },
  {
    name: "Cardkh",
    role: "Project manager",
    availability: "Limited slots",
    skills: ["Agile", "Scope planning", "Team orchestration"],
    pricing: "Retainer / starts from €1,000",
    amanah: 93,
    completion: 96,
    nicheYears: "5 years in niche",
    badges: ["On-time specialist", "Contract clarity verified"],
    span: "lg:col-span-4",
  },
  {
    name: "Oliver Clegg",
    role: "Founder advisor",
    availability: "Available",
    skills: ["Go-to-market", "Offer design", "Hiring"],
    pricing: "Session + sprint packages",
    amanah: 95,
    completion: 91,
    nicheYears: "7 years in niche",
    badges: ["Founder-vetted", "Outcome-based scope"],
    span: "lg:col-span-4",
  },
];

export function TalentDirectory() {
  return (
    <section id="talent" className="scroll-mt-24 border-t border-[#C9A84C]/20 bg-[#0A0F1E] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-[#C9A84C]">Talent Directory Preview</p>
          <h2 className="font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">Meet the operators.</h2>
          <p className="mt-2 text-[#C9BEAA]">
            Asymmetric bento layout designed for speed-scanning. Trust replaces vanity ratings.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {TALENT.map((person, idx) => (
            <motion.article
              key={person.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={`surface-card rounded-2xl border border-[#C9A84C]/25 bg-white/[0.03] p-5 backdrop-blur-md ${person.span}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#C9A84C]/35 bg-[#C9A84C]/10 text-sm font-semibold text-[#F5F0E8]">
                    {talentInitials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-headline text-xl font-semibold text-[#F5F0E8]">{person.name}</h3>
                    <p className="truncate text-xs text-[#C9BEAA]">{person.role}</p>
                    <p className="mt-0.5 text-[11px] text-[#C9A84C]">{person.nicheYears}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#1A6B4A]/50 bg-[#1A6B4A]/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#9FE3C2]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1A6B4A]" />
                  {person.availability}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-[#C9A84C]/20 bg-[#0A0F1E]/70 p-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#C9BEAA]">Amanah score</span>
                  <span className="font-semibold text-[#F5F0E8]">{person.amanah}/100</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#152038]">
                  <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${person.amanah}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-[#C9BEAA]">Project completion rate: {person.completion}%</p>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#C9A84C]">{person.pricing}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.skills.map((s) => (
                  <span key={s} className="rounded-full border border-[#C9A84C]/25 bg-[#0A0F1E] px-2.5 py-1 text-[11px] text-[#F5F0E8]/90">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-[#1A6B4A]/35 bg-[#1A6B4A]/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#AEEACD]">
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-[#C9A84C]/15 bg-gradient-to-r from-[#0B1326] to-[#121D33] p-3 text-[11px] text-[#C9BEAA]">
                Preview block: live portfolio loop / website snapshot on hover (stream-ready UI tile).
              </div>

              <a
                href={contactMessage(`Connect me with ${person.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-5 min-h-10 w-full justify-center text-xs"
              >
                Instant secure booking
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
