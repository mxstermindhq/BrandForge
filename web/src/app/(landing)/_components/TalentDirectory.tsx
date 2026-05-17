"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CONTACT } from "@/content/landing-directory";
import { CURATED_OPERATORS } from "@/content/curated-operators";
import { talentInitials } from "@/lib/talent-types";
import { profilePath } from "@/lib/reserved-paths";

const SPANS = ["lg:col-span-6", "lg:col-span-3", "lg:col-span-3", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4", "lg:col-span-6", "lg:col-span-6"];

export function TalentDirectory() {
  return (
    <section id="talent" className="scroll-mt-24 border-t border-[#A67C2E]/18 bg-[#F8F6F1] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-[#8A6A27]">Talent Directory Preview</p>
          <h2 className="font-headline text-4xl font-semibold text-[#1F2937] sm:text-5xl">Meet the operators.</h2>
          <p className="mt-2 text-[#6B7280]">
            Six verified builders. Real rates. Real track records. mxstermind has worked with every one of them personally.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {CURATED_OPERATORS.map((person, idx) => (
            <motion.article
              key={person.username}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -4, scale: 1.01, boxShadow: "0 0 28px rgba(166,124,46,0.14)" }}
              className={`surface-card rounded-2xl border border-[#A67C2E]/18 bg-white p-5 backdrop-blur-md ${SPANS[idx % SPANS.length]}`}
            >
              <div className="mb-4 h-1 w-full rounded-full bg-[#A67C2E]/70" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#A67C2E]/25 bg-[#A67C2E]/10 text-sm font-semibold text-[#5C4620]">
                    {talentInitials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-headline text-xl font-semibold text-[#1F2937]">{person.name}</h3>
                    <p className="truncate text-xs text-[#6B7280]">{person.role}</p>
                    <p className="mt-0.5 text-[11px] text-[#8A6A27]">{person.yearsExp} years in niche</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#1F7A4D]/30 bg-[#1F7A4D]/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#1F7A4D]">
                  <span className={`h-1.5 w-1.5 rounded-full ${person.availability === "limited" ? "bg-[#A67C2E]" : "bg-[#1F7A4D]"}`} />
                  {person.availability === "limited" ? "Limited slots" : "Available"}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-[#A67C2E]/20 bg-[#F7F3EA] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280]">Trust score</span>
                  <span className="font-semibold text-[#1F2937]">{person.amanahScore}/100</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#DFD7C8]">
                  <div className="h-full rounded-full bg-[#A67C2E]" style={{ width: `${person.amanahScore}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-[#6B7280]">Project completion rate: {person.completionRate}%</p>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-[#4B5563]">{person.bio}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#8A6A27]">{person.startingPrice}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.skills.map((s) => (
                  <span key={s} className="rounded-full border border-[#A67C2E]/18 bg-[#F7F3EA] px-2.5 py-1 text-[11px] text-[#374151]">
                    {s}
                  </span>
                ))}
              </div>

              {person.status === "building" ? (
                <div className="mt-5 rounded-lg border border-[#A67C2E]/18 bg-[#F7F3EA] px-3 py-2 text-xs text-[#6B7280]">
                  Profile being completed · {person.yearsExp} years experience.
                </div>
              ) : null}

              <Link href={profilePath(person.username)} className="btn-secondary mt-5 min-h-10 w-full justify-center text-xs">
                View profile →
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#A67C2E]/22 bg-white px-4 py-3 text-sm text-[#374151]">
          🔒 Verified-only. No open applications. Every operator is manually whitelisted by {CONTACT.guarantor}.
        </div>
      </div>
    </section>
  );
}
