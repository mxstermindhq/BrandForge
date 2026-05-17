"use client";

import { PACKAGES } from "@/content/landing-directory";
import { ContactCTA } from "./ContactCTA";

export function OfficialPackages() {
  return (
    <section id="packages" className="scroll-mt-24 border-t border-outline-variant px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Services Board</p>
            <h2 className="font-headline text-3xl font-bold text-on-surface sm:text-4xl">Targeted, outcome-first services</h2>
            <p className="mt-3 text-on-surface-variant">
              Productized services with clear scope, timeline, and expected outcomes. Pick one and Brandforge handles
              fit and execution routing.
            </p>
          </div>
          <p className="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Launch pricing · Limited slots
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              className={`relative flex flex-col rounded-xl border p-5 transition hover:border-primary/40 ${
                pkg.popular
                  ? "border-primary/50 bg-surface-container-high shadow-lg shadow-primary/10"
                  : "border-outline-variant bg-surface-container-low"
              }`}
            >
              {pkg.popular ? (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-on-primary">
                  Popular
                </span>
              ) : null}
              {pkg.urgent && !pkg.popular ? (
                <span className="absolute -top-2.5 left-4 rounded-full border border-warning/50 bg-warning/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-warning">
                  High demand
                </span>
              ) : null}

              <h3 className="font-headline text-lg font-semibold text-on-surface">{pkg.name}</h3>
              <p className="mt-1 text-xl font-bold text-primary">{pkg.price}</p>
              <p className="mt-2 text-sm text-on-surface-variant">{pkg.tagline}</p>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-on-surface">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="material-symbols-outlined shrink-0 text-sm text-success">check</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-[11px] text-on-surface-variant">For: {pkg.target}</p>

              <div className="mt-5">
                <ContactCTA
                  subject={`Package: ${pkg.name}`}
                  label="Book Package"
                  variant={pkg.popular ? "primary" : "secondary"}
                  className="w-full [&>a]:w-full [&>a]:justify-center"
                  showDiscord
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
