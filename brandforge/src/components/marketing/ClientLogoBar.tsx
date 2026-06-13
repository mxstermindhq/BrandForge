"use client";

import Link from "next/link";

const NICHES = [
  { slug: "gaming-server-owners", icon: "🎮", label: "Gaming" },
  { slug: "saas-startups", icon: "◆", label: "SaaS" },
  { slug: "web3-crypto-projects", icon: "◇", label: "Web3" },
  { slug: "forum-sellers", icon: "▣", label: "Forums" },
  { slug: "ecommerce-brands", icon: "▮", label: "E-commerce" },
  { slug: "content-creators", icon: "▶", label: "Creators" },
  { slug: "mobile-app-founders", icon: "📱", label: "Mobile" },
  { slug: "automation-ops-teams", icon: "⚙", label: "Ops" },
] as const;

/** Niche trust bar — links to /for/* guides. CSS marquee, static grid when reduced motion. */
export function ClientLogoBar(): React.JSX.Element {
  return (
    <section className="border-y border-b1 bg-s1 py-8" aria-label="Who we serve">
      <div className="content-wrap">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Trusted by operators across niches
        </p>
        <div className="bf-trust-marquee mt-6 overflow-hidden">
          <ul className="bf-trust-marquee-track flex gap-4">
            {[...NICHES, ...NICHES].map((n, i) => (
              <li key={`${n.slug}-${i}`}>
                <Link
                  href={`/for/${n.slug}/`}
                  className="flex min-w-[120px] flex-col items-center rounded-md border border-b1 bg-bg px-4 py-3 grayscale transition-all hover:grayscale-0 hover:border-accent"
                >
                  <span className="text-2xl" aria-hidden>
                    {n.icon}
                  </span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted">
                    {n.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-center font-mono text-[9px] text-muted">
          <Link href="/portfolio/" className="text-accent-bright hover:text-text">
            See shipped work →
          </Link>
        </p>
      </div>
    </section>
  );
}
