"use client";

/** Minimal features strip — detail lives in the deal-room preview below. */
export function FeaturesGrid() {
  return (
    <section id="features" className="border-t border-outline-variant bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-label !mb-3">Features</p>
        <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Every deal. One thread.{" "}
          <span className="text-primary">AI that ships the work.</span>
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant sm:text-base">Human expertise. AI execution.</p>
      </div>
    </section>
  );
}
