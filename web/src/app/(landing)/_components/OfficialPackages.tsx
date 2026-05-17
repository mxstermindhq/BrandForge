"use client";

import { motion } from "framer-motion";
import { PACKAGES } from "@/content/landing-directory";
import { CONTACT } from "@/content/landing-directory";

export function OfficialPackages() {
  return (
    <section id="packages" className="scroll-mt-24 border-t border-[#C9A84C]/20 bg-[#0A0F1E] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="section-label text-[#C9A84C]">Services Board</p>
          <h2 className="font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">Done-for-you. Scoped. Delivered.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {PACKAGES.map((pkg, idx) => (
            <motion.article
              key={pkg.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.42, delay: idx * 0.04 }}
              className="group relative flex flex-col rounded-2xl border border-[#C9A84C]/20 bg-[#0F172B] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#C9A84C]/55"
            >
              <div className="mb-3 flex items-center gap-2">
                {pkg.popular ? (
                  <span className="rounded-full border border-[#1A6B4A] bg-[#1A6B4A]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9FE3C2]">
                    Popular
                  </span>
                ) : null}
                {pkg.urgent ? (
                  <span className="rounded-full border border-[#1A6B4A] bg-[#1A6B4A]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9FE3C2]">
                    High demand
                  </span>
                ) : null}
              </div>

              <h3 className="font-headline text-2xl font-semibold text-[#F5F0E8]">{pkg.name}</h3>
              <p className="mt-1 text-lg font-semibold text-[#C9A84C]">{pkg.price}</p>
              <p className="mt-2 text-sm text-[#C9BEAA]">{pkg.tagline}</p>

              <ul className="mt-5 grid gap-2 text-sm text-[#F5F0E8]">
                {pkg.includes.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">✓</span>
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
                  Book via Discord
                </a>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 rounded-2xl border border-[#C9A84C]/30 shadow-[0_0_28px_rgba(201,168,76,0.16)]" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
