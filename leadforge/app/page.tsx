import Link from "next/link";
import { PACKS, PLATFORMS } from "@/lib/constants";

const STEPS = [
  { n: "01", title: "Describe", body: "Your product and ideal customer." },
  { n: "02", title: "Select sources", body: "Toggle Reddit, Google, LinkedIn, and more." },
  { n: "03", title: "Launch", body: "Pay with credits and start the run." },
  { n: "04", title: "Export", body: "AI-scored leads with emails and pitch angles." },
] as const;

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="py-20">
      <section className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          B2B + B2C lead generation
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-6xl font-light leading-tight md:text-7xl">
          Find <span className="text-gold">700</span> peptide buyers in minutes.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-tx-muted">
          Describe your customer, choose your platforms, and receive enriched
          leads with emails, fit scores, and a written pitch angle each.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded bg-gold px-6 py-3 font-medium text-bg hover:bg-gold-light"
          >
            Start Free — 500 Leads
          </Link>
          <Link
            href="/pricing"
            className="rounded border border-border px-6 py-3 text-tx hover:border-border-hover"
          >
            View Pricing
          </Link>
        </div>
      </section>

      <section className="mt-28 grid gap-6 md:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-lg border border-border bg-bg-surface p-6">
            <p className="font-mono text-sm text-gold">{s.n}</p>
            <h3 className="mt-3 text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-tx-muted">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-28">
        <h2 className="font-display text-4xl font-light">Sources</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-bg-surface p-5">
              <div className="text-2xl">{p.icon}</div>
              <h3 className="mt-3">{p.name}</h3>
              <p className="mt-1 text-xs text-tx-muted">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-28">
        <h2 className="font-display text-4xl font-light">Credit packs</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack) => (
            <div key={pack.id} className="rounded-lg border border-border bg-bg-surface p-6">
              <h3 className="text-lg text-gold">{pack.name}</h3>
              <p className="mt-2 font-mono text-3xl">${pack.priceUsd}</p>
              <p className="mt-1 text-sm text-tx-muted">{pack.credits} credits</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
