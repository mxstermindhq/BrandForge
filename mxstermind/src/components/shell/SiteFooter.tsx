import Link from "next/link";
import { SITE } from "@/config/site";

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-b1 py-12">
      <div className="content-wrap">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-muted" aria-label="Footer">
          <Link href="/services/" className="hover:text-text">
            Services
          </Link>
          <Link href="/portfolio/" className="hover:text-text">
            Portfolio
          </Link>
          <Link href="/developers/" className="hover:text-text">
            Developers
          </Link>
          <Link href="/process/" className="hover:text-text">
            Process
          </Link>
          <Link href="/apply/" className="hover:text-text">
            Apply
          </Link>
          <Link href="/about/" className="hover:text-text">
            About
          </Link>
          <Link href="/ethics-standards/" className="hover:text-text">
            Ethics
          </Link>
          <Link href="/blog/" className="hover:text-text">
            Blog
          </Link>
          <Link href="/for/established-businesses/" className="hover:text-text">
            For businesses
          </Link>
          <a href={SITE.brandforge} className="hover:text-text" rel="noopener noreferrer">
            brandforge.gg
          </a>
        </nav>
        <p className="mt-6 font-mono text-[10px] text-muted">
          © 2026 mxstermind · Bespoke design, engineering & growth
        </p>
      </div>
    </footer>
  );
}
