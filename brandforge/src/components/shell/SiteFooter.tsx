import Link from "next/link";
import { CrossPlatformLink } from "@/components/marketing/CrossPlatformLink";

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-b1 py-12">
      <div className="content-wrap">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-[var(--m2)]" aria-label="Footer">
          <Link href="/services/" className="hover:text-text">
            Services
          </Link>
          <Link href="/packages/" className="hover:text-text">
            Packages
          </Link>
          <Link href="/portfolio/" className="hover:text-text">
            Portfolio
          </Link>
          <Link href="/about/" className="hover:text-text">
            About
          </Link>
          <Link href="/contact/" className="hover:text-text">
            Contact
          </Link>
          <Link href="/ethics-standards/" className="hover:text-text">
            Ethics
          </Link>
          <Link href="/brand-guide/" className="hover:text-text">
            Brand guide
          </Link>
          <Link href="/partners/" className="hover:text-text">
            Partners
          </Link>
          <Link href="/store/" className="hover:text-text">
            Store
          </Link>
          <Link href="/mxstermind/" className="hover:text-text">
            MXSTERMIND
          </Link>
          <Link href="/blog/" className="hover:text-text">
            Blog
          </Link>
          <CrossPlatformLink
            href="https://mxstermind.com"
            platform="mxstermind"
            campaign="footer-mxm"
            className="hover:text-text"
          >
            mxstermind.com ↗
          </CrossPlatformLink>
          <Link href="/terms/" className="hover:text-text">
            Terms
          </Link>
          <Link href="/privacy/" className="hover:text-text">
            Privacy
          </Link>
        </nav>
        <p className="mt-6 font-mono text-[10px] text-[var(--m2)]">© 2026 BrandForge · Design, dev & growth for operators</p>
      </div>
    </footer>
  );
}
