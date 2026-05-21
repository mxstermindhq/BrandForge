import { notFound } from "next/navigation";
import { ServicePageClient } from "@/components/listings/ServicePageClient";
import { fetchServiceById } from "@/lib/fetch-service";
import { isReservedUsername, profilePath } from "@/lib/reserved-paths";

export default async function MemberServicePage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  if (isReservedUsername(username)) notFound();

  const service = await fetchServiceById(id);
  if (!service) notFound();

  return (
    <ServicePageClient
      service={service}
      backHref={profilePath(username)}
      backLabel={`← ${username}`}
    />
  );
}
