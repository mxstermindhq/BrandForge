import type { Metadata } from "next";
import Link from "next/link";
import { helpFaqs } from "@/content/legal-copy";
import { CONTACT } from "@/content/landing-directory";

export const metadata: Metadata = {
  title: "Help",
  description: "How the BrandForge curated directory works.",
};

export default function HelpPage() {
  return (
    <main className="landing-layout min-h-screen px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
          ← Directory
        </Link>
        <h1 className="mt-6 font-headline text-4xl font-semibold text-[var(--color-text-primary)]">Help</h1>
        <p className="mt-3 text-base text-[var(--color-text-secondary)]">
          Curated operators, one conversation with mxstermind — no marketplace noise.
        </p>
        <div className="mt-10 space-y-4">
          {helpFaqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border p-6"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <h2 className="font-headline text-lg font-semibold text-[var(--color-text-primary)]">{faq.q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{faq.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-[var(--color-text-secondary)]">
          Still stuck?{" "}
          <a
            href={CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-gold)] hover:underline"
            data-track="help_telegram"
          >
            Message {CONTACT.telegramHandle} on Telegram
          </a>{" "}
          or email{" "}
          <a href="mailto:support@brandforge.gg" className="text-[var(--color-gold)] hover:underline">
            support@brandforge.gg
          </a>
          .
        </p>
      </div>
    </main>
  );
}
