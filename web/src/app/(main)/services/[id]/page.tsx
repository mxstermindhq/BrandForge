import type { Metadata } from "next";
import { ServiceDetailClient } from "./_components/ServiceDetailClient";
import { fetchServiceForMetadata } from "@/lib/metadata-api";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const service = await fetchServiceForMetadata(params.id);
  const title = service?.title || "Service";
  const price = service?.price != null ? Number(service.price) : null;
  const descRaw = (service?.description || "").trim() || "Professional service on BrandForge.";
  const descSlice = descRaw.length > 120 ? `${descRaw.slice(0, 117)}…` : descRaw;
  const priceBit =
    price != null && Number.isFinite(price) ? `From $${price.toLocaleString()}. ` : "";
  return {
    title,
    description: `${title} — ${priceBit}${descSlice}`,
    openGraph: { url: `https://brandforge.gg/services/${params.id}` },
  };
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  return <ServiceDetailClient id={params.id} />;
}
