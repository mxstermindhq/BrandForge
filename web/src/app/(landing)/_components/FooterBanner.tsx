"use client";

import { CONTACT } from "@/content/landing-directory";

export function FooterBanner() {
  return (
    <section className="relative overflow-hidden border-t border-[#A67C2E]/16 bg-[#FCFAF5] px-4 py-16 sm:px-6 lg:px-8">
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        <path d="M100 12l17 34 38 2-30 23 10 37-35-18-35 18 10-37-30-23 38-2 17-34z" stroke="#A67C2E" strokeWidth="2" />
        <path d="M100 43l9 18 20 1-16 12 5 20-18-9-18 9 5-20-16-12 20-1 9-18z" stroke="#A67C2E" strokeWidth="2" />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="font-headline text-4xl font-semibold text-[#1F2937] sm:text-5xl">Ready to build something real?</h2>
        <p className="mt-3 text-lg text-[#6B7280]">One conversation. We handle the rest.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-6 text-sm">
            Start a conversation →
          </a>
          <a href="#packages" className="btn-secondary min-h-11 px-6 text-sm">
            Explore services ↑
          </a>
        </div>
      </div>
    </section>
  );
}
