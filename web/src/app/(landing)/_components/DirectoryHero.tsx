"use client";

import { CONTACT } from "@/content/landing-directory";
import { ContactCTA } from "./ContactCTA";

export function DirectoryHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-tertiary/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Vetted operators · Done-for-you packages
        </p>

        <h1 className="font-headline text-4xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
          Build your brand faster with{" "}
          <span className="bg-gradient-to-r from-[#dbeafe] via-[#60a5fa] to-[#1d4ed8] bg-clip-text text-transparent">
            AI-native operators
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-on-surface-variant sm:text-xl">
          Curated talent for ambitious startups, creators, and online brands. Not another freelancer
          marketplace — outcome-focused builders with the exact skills, tools, and experience you need.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#talent" className="btn-primary min-h-11 px-6">
            Hire Talent
          </a>
          <a href="#packages" className="btn-secondary min-h-11 px-6">
            Book a Package
          </a>
          <ContactCTA
            subject="New project on BrandForge"
            label="Start Project"
            variant="ghost"
            showDiscord={false}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-outline-variant/50 pt-8 text-sm text-on-surface-variant">
          <span>
            All contact via{" "}
            <a
              href={CONTACT.telegram}
              className="font-semibold text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {CONTACT.telegramHandle}
            </a>{" "}
            or Discord
          </span>
          <span className="hidden h-4 w-px bg-outline-variant sm:block" />
          <span>
            Managed by <span className="font-semibold text-on-surface">{CONTACT.guarantor}</span> — your guarantor
          </span>
        </div>
      </div>
    </section>
  );
}
