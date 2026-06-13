import type { Metadata } from "next";
import { PageShell } from "@/components/content";
import { StoreSuccessClient } from "@/app/(content)/store/success/StoreSuccessClient";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Order confirmed | BrandForge Store",
  description: "Your BrandForge store purchase is confirmed. Download links arrive by email or Discord.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE.url}/store/success/` },
};

export default function StoreSuccessPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Store", href: "/store/" },
        { label: "Confirmed", href: "/store/success/" },
      ]}
      path="/store/success/"
    >
      <StoreSuccessClient />
    </PageShell>
  );
}
