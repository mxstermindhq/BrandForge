import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Admin Dashboard | BrandForge",
  description: "Internal analytics — not for public indexing.",
  alternates: { canonical: `${SITE.url}/admin/` },
  robots: { index: false, follow: false, nocache: true },
};

/** Internal ops dashboard — protect with Cloudflare Access or NEXT_PUBLIC_BF_ADMIN_KEY. */
export default function AdminPage(): React.JSX.Element {
  return (
    <main className="content-wrap py-8">
      <AdminDashboard />
    </main>
  );
}
