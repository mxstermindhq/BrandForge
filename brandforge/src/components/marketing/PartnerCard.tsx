"use client";

import { trackEvent } from "@/lib/tracking";

type PartnerCardProps = {
  name: string;
  description: string;
  whyRecommend: string;
  href: string;
  affiliate: boolean;
  refCode?: string;
};

export function PartnerCard({
  name,
  description,
  whyRecommend,
  href,
  affiliate,
  refCode,
}: PartnerCardProps): React.JSX.Element {
  const url = refCode ? `${href}${href.includes("?") ? "&" : "?"}ref=${refCode}` : href;

  return (
    <article className="rounded-md border border-b1 bg-s1 p-6">
      <h3 className="text-lg font-bold">{name}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
      <p className="mt-3 text-xs text-muted">{whyRecommend}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-4 inline-block font-mono text-[10px] text-accent-bright"
        onClick={() => {
          if (refCode) trackEvent("partner_referral", { partner: refCode, action: "outbound_click" });
        }}
      >
        Visit {name} ↗
      </a>
      {affiliate ? (
        <p className="mt-2 font-mono text-[9px] text-amber">Affiliate / partner link disclosed</p>
      ) : null}
    </article>
  );
}
