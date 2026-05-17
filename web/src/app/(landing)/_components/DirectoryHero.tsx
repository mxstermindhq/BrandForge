"use client";

import { CONTACT } from "@/content/landing-directory";
import { ContactCTA } from "./ContactCTA";

export function DirectoryHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-tertiary/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Whitelisted operators · trust-first matching
        </p>

        <h1 className="font-headline max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
          The operating directory for{" "}
          <span className="bg-gradient-to-r from-[#dbeafe] via-[#60a5fa] to-[#1d4ed8] bg-clip-text text-transparent">
            modern internet brands
          </span>
        </h1>

        <p className="mt-5 max-w-3xl text-lg text-on-surface-variant sm:text-xl">
          Browse verified people, services, and targeted requests. Start with one trusted conversation through{" "}
          {CONTACT.guarantor}, then assemble the right team for your project.
        </p>

        <div className="mt-7 grid max-w-3xl gap-3 rounded-2xl border border-outline-variant/60 bg-surface/70 p-3 backdrop-blur sm:grid-cols-2">
          <a href="#talent" className="rounded-xl border border-primary/30 bg-primary/10 p-4 transition hover:border-primary/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hire</p>
            <p className="mt-1 font-headline text-lg font-semibold text-on-surface">Browse operators & packages</p>
            <p className="mt-1 text-sm text-on-surface-variant">Submit a request and get matched in one thread.</p>
          </a>
          <a href="#talent" className="rounded-xl border border-outline-variant bg-surface-container-low p-4 transition hover:border-primary/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Get hired</p>
            <p className="mt-1 font-headline text-lg font-semibold text-on-surface">Show your work and receive demand</p>
            <p className="mt-1 text-sm text-on-surface-variant">Publish niche services and receive qualified opportunities.</p>
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ContactCTA subject="Brandforge project request" label="Start conversation" variant="primary" showDiscord={false} />
          <a href="#packages" className="btn-secondary min-h-11 px-6">
            Explore services
          </a>
          <a href="/requests/new" className="btn-secondary min-h-11 px-6">
            Submit request
          </a>
        </div>

        <div className="mt-10 grid max-w-4xl gap-2 border-t border-outline-variant/50 pt-7 text-sm text-on-surface-variant sm:grid-cols-3">
          <p>Verified-only discovery</p>
          <p>No pay-to-rank visibility</p>
          <p>Conversation-first matching</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
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
          <span className="hidden h-4 w-px bg-outline-variant md:block" />
          <span>
            Managed by <span className="font-semibold text-on-surface">{CONTACT.guarantor}</span> — your guarantor
          </span>
        </div>
      </div>
    </section>
  );
}
