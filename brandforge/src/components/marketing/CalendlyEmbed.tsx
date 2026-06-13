"use client";

import { SITE } from "@/config/site";
import { ctaTrackAttrs, discordHref, trackEvent } from "@/lib/tracking";

type CalendlyEmbedProps = {
  title?: string;
  campaign?: string;
};

/** Inline Calendly when URL configured — Discord fallback otherwise. */
export function CalendlyEmbed({
  title = "Book a free 15-min scope call",
  campaign = "calendly-scope-call",
}: CalendlyEmbedProps): React.JSX.Element {
  const url = SITE.calendlyUrl;

  if (!url) {
    return (
      <div className="rounded-md border border-b1 bg-s1 p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Calendly scheduling is coming soon. Message us on Discord for a scope call — fixed quote in
          24 hours.
        </p>
        <a
          href={discordHref(campaign)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("click_calendly_fallback", { campaign })}
          className="mt-4 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
          {...ctaTrackAttrs("discord", campaign)}
        >
          Book via Discord instead
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-b1 bg-bg">
      <p className="border-b border-b1 bg-s1 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-accent-bright">
        {title}
      </p>
      <iframe
        title={title}
        src={`${url}?hide_gdpr_banner=1`}
        className="h-[680px] w-full border-0"
        loading="lazy"
        onLoad={() => trackEvent("click_calendly", { campaign, action: "embed_load" })}
        data-bf-cta="calendly"
        data-bf-campaign={campaign}
      />
    </div>
  );
}
