"use client";

import { trackEvent } from "@/lib/tracking";

type EcosystemDownloadLinkProps = {
  href: string;
  name: string;
  source: "brandforge" | "mxstermind";
};

export function EcosystemDownloadLink({
  href,
  name,
  source,
}: EcosystemDownloadLinkProps): React.JSX.Element {
  return (
    <a
      href={href}
      download
      onClick={() =>
        trackEvent("resource_download", {
          resource: name,
          source,
          magnet: "creator-economy-stack",
        })
      }
      className="inline-block rounded border border-accent bg-accent/10 px-5 py-2.5 font-mono text-[11px] font-bold text-accent-bright hover:bg-accent/20"
    >
      Download {name} ↓
    </a>
  );
}
