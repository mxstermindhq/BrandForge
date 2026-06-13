"use client";

import { trackEvent } from "@/lib/tracking";

type ResourceDownloadLinkProps = {
  href: string;
  name: string;
};

export function ResourceDownloadLink({ href, name }: ResourceDownloadLinkProps): React.JSX.Element {
  return (
    <a
      href={href}
      download
      onClick={() => trackEvent("resource_download", { resource: name })}
      className="text-sm text-accent-bright hover:text-text"
    >
      {name} ↓
    </a>
  );
}
