import Link from "next/link";
import { ContactCTA } from "@/components/marketing/ContactBar";
import { LandingDemo } from "@/components/marketing/LandingDemo";
import { CHANNEL_META, PACKS, PLATFORMS, WELCOME_CREDITS } from "@/lib/constants";

const FLOW = [
  {
    step: "01",
    title: "Paste your website",
    body: "Drop the URL where you sell — product, service, SaaS, or agency site.",
  },
  {
    step: "02",
    title: "AI profiles your buyer",
    body: "We infer who actually buys (not what you sell): titles, intent signals, pain points.",
  },
  {
    step: "03",
    title: "Scrape every platform",
    body: "Intent-based queries hit LinkedIn, Reddit, X, Google, Instagram, TikTok, YouTube & the open web.",
  },
  {
    step: "04",
    title: "Contact hot leads",
    body: "Scored leads with emails, fit reasons, and pitch angles — streamed live.",
  },
] as const;

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="pb-20 pt-12">
      {/* Hero */}
      <section className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          B2B + B2C buyer intelligence
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-light leading-[1.1] md:text-7xl">
          Paste your site.{" "}
          <span className="text-gold">Find buyers everywhere.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-tx-muted md:text-lg">
          LeadForge analyzes what you sell, builds your ideal buyer profile, then scrapes
          unlimited matching leads across 8 platforms — with emails and intent scores.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded bg-gold px-6 py-3 text-sm font-medium text-bg hover:bg-gold-light"
          >
            Start Free — {WELCOME_CREDITS} credits
          </Link>
          <Link
            href="/auth/login"
            className="rounded border border-border px-6 py-3 text-sm text-tx hover:border-border-hover"
          >
            Sign in to search
          </Link>
        </div>
      </section>

      {/* Live demo prototype */}
      <section className="mt-16 md:mt-20">
        <LandingDemo />
      </section>

      {/* Flow */}
      <section className="mt-28">
        <h2 className="font-display text-4xl font-light">How it works</h2>
        <p className="mt-2 max-w-xl text-sm text-tx-muted">
          From website URL to scored leads in minutes — no manual ICP spreadsheets.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-border bg-bg-surface p-6 transition hover:border-border-hover"
            >
              <p className="font-mono text-sm text-gold">{s.step}</p>
              <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tx-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-light">8 platforms. One search.</h2>
            <p className="mt-2 text-sm text-tx-muted">
              Intent-based queries — not generic title + industry spam.
            </p>
          </div>
          <Link href="/auth/register" className="text-sm text-gold hover:underline">
            Try all channels →
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORMS.map((p) => {
            const meta = CHANNEL_META[p.id];
            return (
              <div
                key={p.id}
                className="group rounded-xl border border-border bg-bg-surface p-5 transition hover:border-gold/30"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold"
                    style={{
                      color: meta?.color ?? "#888",
                      backgroundColor: `${meta?.color ?? "#888"}18`,
                    }}
                  >
                    {meta?.icon ?? p.icon}
                  </span>
                  <h3 className="font-medium">{p.name}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-tx-muted">{p.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Social proof strip */}
      <section className="mt-28 rounded-2xl border border-gold/20 bg-gold-bg px-6 py-10 text-center md:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Unlimited potential</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-light md:text-4xl">
          Every buyer who&apos;s actively signaling they need what you sell
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-tx-muted">
          Solo founders posting &ldquo;looking for a developer&rdquo; on Reddit. Pre-seed CEOs on
          LinkedIn. Indie hackers on X. We find them — you close them.
        </p>
        <Link
          href="/auth/register"
          className="mt-8 inline-block rounded bg-gold px-8 py-3 text-sm font-medium text-bg hover:bg-gold-light"
        >
          Analyze my site free
        </Link>
      </section>

      {/* Pricing teaser */}
      <section className="mt-28">
        <h2 className="font-display text-4xl font-light">Simple credits</h2>
        <p className="mt-2 text-sm text-tx-muted">~1 credit per lead. No subscription required.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((pack, i) => (
            <div
              key={pack.id}
              className={`rounded-xl border bg-bg-surface p-6 ${
                i === 1 ? "border-gold/40" : "border-border"
              }`}
            >
              <h3 className="text-gold">{pack.name}</h3>
              <p className="mt-2 font-mono text-3xl">${pack.priceUsd}</p>
              <p className="mt-1 text-xs text-tx-muted">{pack.credits.toLocaleString()} credits</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/pricing" className="text-sm text-gold hover:underline">
            Full pricing →
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mt-28 rounded-2xl border border-border bg-bg-surface px-6 py-12 text-center">
        <h2 className="font-display text-3xl font-light">Need help finding buyers?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-tx-muted">
          Same Discord & Telegram as mxstermind Studio — real humans, fixed quotes, no sales calls.
        </p>
        <ContactCTA className="mt-8" />
      </section>
    </div>
  );
}
