"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";

/** Fixed bottom CTA — appears after scrolling past hero. */
export function StickyCta(): React.JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[250] border-t border-b1 bg-bg/95 px-4 py-3 backdrop-blur-md md:hidden"
      aria-label="Quick contact"
    >
      <div className="mx-auto flex max-w-md gap-2">
        <Link
          href="#packages"
          className="flex-1 rounded border border-b2 py-2.5 text-center font-mono text-[10px] font-semibold text-text-secondary"
        >
          Packages
        </Link>
        <a
          href={discordHref("sticky-cta-mobile")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded bg-accent py-2.5 text-center font-mono text-[10px] font-bold text-white"
          {...ctaTrackAttrs("discord", "sticky-cta-mobile")}
        >
          Get a quote
        </a>
      </div>
    </div>
  );
}
