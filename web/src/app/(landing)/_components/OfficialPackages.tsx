"use client";

import { motion } from "framer-motion";
import { PACKAGES } from "@/content/landing-directory";
import { CONTACT } from "@/content/landing-directory";

const HOOKS: Record<string, string> = {
  "creator-launch": "Your brand, your page, your content engine - live in days.",
  "mvp-sprint": "From idea to shipped product. Weeks, not months. No excuses.",
  "ai-automation": "Your leads followed up. Your support answered. Your CRM fed. Automatically.",
  "viral-content": "30 assets a month that actually stop the scroll. Or we redo them.",
  "growth-engine": "Ads, content, funnels, analytics - fully managed. We become your team.",
  "ai-support": "Cut support costs by 70%. Trained on your docs. Live in 72 hours.",
  "tiktok-shop": "Store live. Creators sourced. Content running. Ads optimised. One sprint.",
  "booking-system": "Never lose a lead to a missed follow-up again.",
};

export function OfficialPackages() {
  return (
    <section id="packages" className="scroll-mt-24 border-t border-[#A67C2E]/16 bg-[#F8F6F1] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="section-label text-[#8A6A27]">Services Board</p>
          <h2 className="font-headline text-4xl font-semibold text-[#1F2937] sm:text-5xl">
            Done-for-you. Scoped before it starts. Delivered or it doesn't leave.
          </h2>
          <p className="mt-3 text-[#6B7280]">
            Pick a package. We handle the rest. Every service has a fixed scope, a clear outcome, and mxstermind
            standing behind it.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {PACKAGES.map((pkg, idx) => (
            <motion.article
              key={pkg.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.42, delay: idx * 0.04 }}
              className="group relative flex flex-col rounded-2xl border border-[#A67C2E]/14 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#A67C2E]/40"
            >
              <div className="mb-3 flex items-center gap-2">
                {pkg.popular ? (
                  <span className="rounded-full border border-[#1F7A4D]/35 bg-[#1F7A4D]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1F7A4D]">
                    Popular
                  </span>
                ) : null}
                {pkg.urgent ? (
                  <span className="rounded-full border border-[#1F7A4D]/35 bg-[#1F7A4D]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1F7A4D]">
                    High demand
                  </span>
                ) : null}
              </div>

              <h3 className="font-headline text-2xl font-semibold text-[#1F2937]">{pkg.name}</h3>
              <p className="mt-2 text-sm italic text-[#6B7280]">{HOOKS[pkg.id]}</p>
              <p className="mt-1 text-lg font-semibold text-[#8A6A27]">{pkg.price}</p>
              <p className="mt-1 text-sm text-[#6B7280]">{pkg.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#A67C2E]/22 bg-[#F7F3EA] px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#5C4620]">
                  Transparent pricing
                </span>
                <span className="rounded-full border border-[#1F7A4D]/35 bg-[#1F7A4D]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#1F7A4D]">
                  Clear scope
                </span>
              </div>

              <ul className="mt-5 grid gap-2 text-sm text-[#374151]">
                {pkg.includes.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#8A6A27]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <a
                  href={CONTACT.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary min-h-11 w-full justify-center text-sm"
                >
                  Book via Discord →
                </a>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl border border-[#A67C2E]/24 shadow-[0_0_24px_rgba(166,124,46,0.12)]" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
