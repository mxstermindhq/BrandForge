"use client";

import { trackEvent } from "@/lib/tracking";
import { buildTrackedUrl } from "@/lib/tracking";

type CrossPlatformLinkProps = {
  href: string;
  children: React.ReactNode;
  platform: "brandforge" | "mxstermind";
  campaign?: string;
  className?: string;
};

/** Tracked cross-site navigation between BrandForge and MXSTERMIND. */
export function CrossPlatformLink({
  href,
  children,
  platform,
  campaign = "cross-nav",
  className = "",
}: CrossPlatformLinkProps): React.JSX.Element {
  const url = buildTrackedUrl(href, campaign, "cross_nav");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackEvent("cross_platform_nav", {
          platform,
          destination: href,
          campaign,
        })
      }
    >
      {children}
    </a>
  );
}
