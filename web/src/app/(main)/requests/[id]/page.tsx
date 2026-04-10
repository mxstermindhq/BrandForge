import type { Metadata } from "next";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { RequestDetailClient } from "./_components/RequestDetailClient";
import { fetchRequestForMetadata, requestBudgetSnippet } from "@/lib/metadata-api";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const req = await fetchRequestForMetadata(params.id);
  const title = req?.title || "Request";
  const budget = requestBudgetSnippet(req);
  const budgetBit =
    budget != null && Number.isFinite(budget) ? `Budget $${budget.toLocaleString()}. ` : "";
  return {
    title,
    description: `${title} — ${budgetBit}Open brief on BrandForge.`,
    openGraph: { url: `https://brandforge.gg/requests/${params.id}` },
  };
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<PageRouteLoading title="Loading request" variant="inline" />}>
      <RequestDetailClient id={params.id} />
    </Suspense>
  );
}
