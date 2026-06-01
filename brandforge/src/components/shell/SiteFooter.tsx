import Link from "next/link";

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-b1 py-9">
      <div className="content-wrap flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[10px] text-[var(--m2)]">© 2026 BrandForge</p>
        <nav className="flex gap-5 font-mono text-[11px] text-[var(--m2)]">
          <Link href="/terms" className="hover:text-text" data-cursor="hover">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-text" data-cursor="hover">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
