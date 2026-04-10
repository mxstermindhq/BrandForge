import type { Metadata } from "next";
import { RequestsClient } from "./_components/RequestsClient";

export const metadata: Metadata = {
  title: "Open Requests",
  description:
    "Active briefs from operators and founders. " + "Post a request or bid on real marketplace demand.",
  openGraph: { url: "https://brandforge.gg/requests" },
};

export default function RequestsPage() {
  return <RequestsClient />;
}
