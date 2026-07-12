import Link from "next/link";
import { SITE } from "@/config/site";

export function ForgeFooter() {
  return (
    <footer className="border-t border-b1/40 py-8">
      <div className="content-wrap flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} BrandForge — a mxstermind company
        </p>
        <div className="flex items-center gap-4">
          <Link href="/portfolio/" className="text-xs text-t2 hover:text-accent transition-colors">
            Portfolio
          </Link>
          <a
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-t2 hover:text-accent transition-colors"
          >
            Discord
          </a>
          <a
            href={SITE.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-t2 hover:text-accent transition-colors"
          >
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}
