import type { Metadata } from "next";
import { LaunchCampaignClient } from "@/app/(content)/launch/LaunchCampaignClient";
import { SITE } from "@/config/site";

/** Internal ops page — not indexed. */
export const metadata: Metadata = {
  title: "Launch Campaign | BrandForge",
  description: "Weekly outreach calendar — forums, Reddit, X, Threads, LinkedIn.",
  alternates: { canonical: `${SITE.url}/launch/` },
  robots: { index: false, follow: false },
};

export default function LaunchPage(): React.JSX.Element {
  return <LaunchCampaignClient />;
}
