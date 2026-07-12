import Link from "next/link";
import { SITE } from "@/config/site";

export default function NotFound(): React.JSX.Element {
  return (
    <main id="main" className="min-h-[70vh] flex items-center justify-center">
      <div className="content-wrap text-center py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-text">Page not found</h1>
        <p className="mt-3 text-sm text-t2 max-w-sm mx-auto">
          That page does not exist or has moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-white transition-all hover:bg-accent/90"
          >
            Back to Home
          </Link>
          <Link
            href="/portfolio/"
            className="rounded-md border border-b2 px-5 py-3 text-sm font-bold text-text transition-all hover:border-accent hover:text-accent"
          >
            View Portfolio
          </Link>
        </div>
        <div className="mt-6">
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-t2 hover:text-accent transition-colors"
          >
            Contact on Discord →
          </a>
        </div>
      </div>
    </main>
  );
}
