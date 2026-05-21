"use client";

import Link from "next/link";
import { CONTACT } from "@/content/landing-directory";

export function ForgeFooter() {
  return (
    <footer className="forge-footer">
      <div className="forge-container forge-footer-inner">
        <div>
          <p className="forge-footer-brand">BrandForge.gg</p>
          <p className="forge-footer-tag">The forge for digital products & services.</p>
          <p className="forge-footer-sister">
            Sister brand:{" "}
            <a href="https://mxstermind.com" target="_blank" rel="noopener noreferrer" className="forge-footer-link">
              Mxstermind
            </a>{" "}
            — intelligence & coordination.
          </p>
        </div>
        <div className="forge-footer-links">
          <Link href="/help">Help</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={CONTACT.discord} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </div>
        <p className="forge-footer-copy">© {new Date().getFullYear()} BrandForge</p>
      </div>
    </footer>
  );
}
