import Link from "next/link";
import { ContactBar } from "@/components/marketing/ContactBar";
import { SITE } from "@/lib/site";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <>
      <header className="sticky top-0 z-50 h-[60px] border-b border-border bg-bg/70 backdrop-blur">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-xl text-gold">
              ⬡ LeadForge
            </Link>
            <a
              href={SITE.mxstermind}
              className="hidden font-mono text-[9px] tracking-widest text-tx-muted hover:text-gold sm:inline"
            >
              ← mxstermind.com
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-tx-muted sm:gap-6">
            <Link href="/pricing" className="hover:text-tx">
              Pricing
            </Link>
            <a
              href={SITE.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden hover:text-tx sm:inline"
            >
              Discord
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden hover:text-tx sm:inline"
            >
              Telegram
            </a>
            <Link href="/auth/login" className="hover:text-tx">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded bg-gold px-4 py-2 font-medium text-bg hover:bg-gold-light"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </header>
      <ContactBar />
      <main className="mx-auto max-w-6xl px-6">{children}</main>
      <footer className="mt-24 border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-display text-lg text-gold">⬡ LeadForge</p>
            <p className="mt-1 text-xs text-tx-muted">
              AI buyer intelligence · multi-platform lead scraping
            </p>
            <p className="mt-2 text-xs text-tx-muted">
              Part of{" "}
              <a href={SITE.mxstermindTools} className="text-gold hover:underline">
                mxstermind Studio Tools
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-[#5865F2] px-4 py-2 font-mono text-[10px] font-bold text-white hover:bg-[#4752c4]"
            >
              Discord
            </a>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-border px-4 py-2 font-mono text-[10px] text-tx-muted hover:text-tx"
            >
              Telegram
            </a>
            <Link
              href="/pricing"
              className="rounded border border-border px-4 py-2 font-mono text-[10px] text-tx-muted hover:text-tx"
            >
              Pricing
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] text-tx-subtle">
          © {new Date().getFullYear()} LeadForge · Fixed quotes & support on Discord / Telegram
        </p>
      </footer>
    </>
  );
}
