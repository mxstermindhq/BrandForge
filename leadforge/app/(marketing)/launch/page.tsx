import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "@/components/marketing/CopyBlock";
import {
  DISTRIBUTION_POSTS,
  POSTING_CHECKLIST,
  QUICK_FACTS,
  THREAD_TITLES,
} from "@/lib/distribution-copy";

export const metadata: Metadata = {
  title: "Launch kit — LeadForge",
  description: "Internal distribution copy for forums and social.",
  robots: { index: false, follow: false, nocache: true },
};

/** Hidden page — not linked from nav. Share URL manually with the team only. */
export default function LaunchKitPage(): React.JSX.Element {
  const sections = [
    { id: "discord", label: "Discord" },
    { id: "telegram", label: "Telegram" },
    { id: "reddit-long", label: "Reddit" },
    { id: "hackforums", label: "HackForums" },
    { id: "voided", label: "Voided" },
    { id: "patched", label: "Patched" },
    { id: "builtbybit", label: "BuiltByBit" },
    { id: "twitter-thread", label: "X / Twitter" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "generic-forum", label: "Generic" },
    { id: "dm-short", label: "DMs" },
  ];

  return (
    <div className="pb-24 pt-10">
      {/* Internal banner */}
      <div className="rounded-lg border border-gold/30 bg-gold-bg/20 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gold">
          Internal · not indexed · manual URL only
        </p>
        <h1 className="mt-2 font-display text-3xl font-light md:text-4xl">
          Launch & distribution kit
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-tx-muted">
          Copy-ready posts for Discord, Telegram, Reddit, HackForums, Voided.to, Patched.to,
          BuiltByBit, X, LinkedIn, and DMs. Click <strong className="text-tx">Copy post</strong>{" "}
          — paste into the thread. This page is not linked from the site or search engines.
        </p>
      </div>

      {/* Quick facts */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Live URL", value: QUICK_FACTS.url },
          { label: "Register", value: QUICK_FACTS.register },
          { label: "Free credits", value: String(QUICK_FACTS.credits) },
          { label: "Platforms scraped", value: QUICK_FACTS.platforms },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-bg-surface p-4">
            <p className="font-mono text-[9px] uppercase tracking-wider text-tx-subtle">
              {item.label}
            </p>
            <p className="mt-2 break-all font-mono text-xs text-tx-muted">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Jump nav */}
      <nav
        className="sticky top-[108px] z-30 -mx-6 mt-10 border-y border-border bg-bg/95 px-6 py-3 backdrop-blur-md"
        aria-label="Platform sections"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded border border-border px-3 py-1.5 font-mono text-[10px] text-tx-muted transition hover:border-gold hover:text-gold"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Thread titles */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-light">Thread title ideas</h2>
        <p className="mt-1 text-sm text-tx-muted">Pick one or mix — forums care about titles.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {THREAD_TITLES.map((group) => (
            <div key={group.platform} className="rounded-lg border border-border p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold">
                {group.platform}
              </p>
              <ul className="mt-3 space-y-2">
                {group.titles.map((t) => (
                  <li key={t} className="text-sm leading-relaxed text-tx-muted">
                    · {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Copy blocks */}
      <section className="mt-14 space-y-6">
        <h2 className="font-display text-2xl font-light">Posts by platform</h2>
        {DISTRIBUTION_POSTS.map((post) => (
          <CopyBlock key={post.id} {...post} />
        ))}
      </section>

      {/* Checklist */}
      <section className="mt-14 rounded-xl border border-border bg-bg-surface p-6">
        <h2 className="font-display text-2xl font-light">Posting checklist</h2>
        <ul className="mt-4 space-y-2">
          {POSTING_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-tx-muted">
              <span className="text-gold">□</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Support links */}
      <section className="mt-10 flex flex-wrap gap-4 text-sm">
        <a
          href={QUICK_FACTS.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          Discord support
        </a>
        <a
          href={QUICK_FACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          Telegram
        </a>
        <Link href="/" className="text-tx-muted hover:text-tx">
          ← Public homepage
        </Link>
      </section>
    </div>
  );
}
