import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <>
      <header className="sticky top-0 z-50 h-[60px] border-b border-border bg-bg/70 backdrop-blur">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl text-gold">
            ⬡ LeadForge
          </Link>
          <div className="flex items-center gap-6 text-sm text-tx-muted">
            <Link href="/pricing" className="hover:text-tx">
              Pricing
            </Link>
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
      <main className="mx-auto max-w-6xl px-6">{children}</main>
      <footer className="mt-24 border-t border-border py-10 text-center text-xs text-tx-muted">
        LeadForge · a BrandForge tool
      </footer>
    </>
  );
}
