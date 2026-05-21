import { redirect } from "next/navigation";

const LEGACY_SELLER_SLUGS = new Set([
  "forge-studio",
  "nova-growth",
  "apex-funnels",
  "prism-brand",
  "stack-launch",
]);

/** Legacy mock seller IDs → official BrandForge profile */
export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (LEGACY_SELLER_SLUGS.has(id)) {
    redirect("/brandforge");
  }
  redirect(`/${encodeURIComponent(id)}`);
}
